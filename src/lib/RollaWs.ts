import _ from 'lodash';
import WebSocket from 'ws';

import { QuoteRequestDto } from '../restApi';
import rollaApiConfig from '../rollaApi.config.json';
import {
  getAuthenticationString,
  IAuthentication,
  YIELD_ENDPOINT,
} from '../utils';
export type JSONRPCID = string | number | null;
export type JSONRPCParams = Record<string, unknown> | unknown[];

export const isJSONRPCID = (id: unknown): id is JSONRPCID =>
  typeof id === 'string' || typeof id === 'number' || id === null;

export type JSONRPCRequest = {
  jsonrpc: '2.0';
  method: string;
  params?: JSONRPCParams;
  id: JSONRPCID;
};
enum SocketChannels {
  QUOTE_REQUESTS = 'yield/subscriptions/quoteRequests',
  META_TRANSACTIONS = 'yield/subscriptions/metaTransactions',
}
const jsonRpcCommands = {
  [SocketChannels.QUOTE_REQUESTS]: () => ({
    id: '1',
    jsonrpc: '2.0',
    method: 'yield/subscribe',
    params: {
      channels: [SocketChannels.QUOTE_REQUESTS],
    },
  }),
  [SocketChannels.META_TRANSACTIONS]: () => ({
    id: '1',
    jsonrpc: '2.0',
    method: 'yield/subscribe',
    params: {
      channels: [SocketChannels.META_TRANSACTIONS],
    },
  }),
};

export interface IRollaWSOptions {
  /**
   * Authorization information
   */
  authorization: IAuthentication;
  /**
   * Websocket connection URL
   */
  basePath?: string;
  /**
   * If specified it will try to reconnect `retryCount` times at an interval of `retryInterval` ms.
   */
  retryCount?: number;
  /**
   * Retry interval. Defaults to 3000ms (3 seconds). In order for this to take effect `retryCount` also needs to be specified.
   */
  retryInterval?: number;
  /**
   * If this should run in debug mode, additional logging will be emitted
   */
  debugMode?: boolean;
}
/**
 * Library for managing websocket connections for Rolla.
 * Todo: a big task for this is to unit test it
 */
export class RollaWS {
  /**
   * Core WS connection used to communicate
   */
  private socket: WebSocket | undefined;

  /**
   * Mapping between channels and callbacks that should respond to new messages from a channel
   */
  private channelListeners: {
    [key in SocketChannels]?: ((data: any) => void)[];
  } = {};

  /**
   * The setInterval instance of the retry count feature
   */
  private retryIntervalInstance: ReturnType<typeof setInterval> | undefined;

  /**
   * Global retry count counter, this needs to be reset whenever we clearInterval(retryIntervalCounter)
   */
  private currentRetryCount = 0;

  private readonly wsUrl: string;

  /**
   * @param options Websocket connection options
   */
  constructor(private options: IRollaWSOptions) {
    this.wsUrl =
      options.basePath || rollaApiConfig.rollaApiRoot + YIELD_ENDPOINT;
  }

  /**
   * Opens a new websocket connection to the yield api
   * @returns Promise<unknown>
   */
  async open() {
    return new Promise(async (res) => {
      const { authorization } = this.options;
      this.logInfo('Opening websocket connection to ', this.wsUrl);
      this.socket = new WebSocket(this.wsUrl, {
        headers: {
          Authorization: await getAuthenticationString(
            authorization.privateKey,
            {
              chainId: authorization.chainId,
            }
          ),
        },
      });
      this.socket.on('reply', (data) => {
        this.logInfo('log reply: ', JSON.stringify(data, null, 2));
      });

      // receive notification when a ws connection is reconnecting automatically
      this.socket.on('reconnecting', (data) => {
        this.logInfo('ws automatically reconnecting.... ', data?.wsKey);
      });

      // receive notification that a reconnection completed successfully (e.g use REST to check for missing data)
      this.socket.on('reconnected', (data) => {
        this.logInfo('ws has reconnected ', data?.wsKey);
      });

      // Recommended: receive error events (e.g. first reconnection failed)
      this.socket.on('error', (data) => {
        // @ts-ignore
        this.logInfo('ws saw error ', data?.wsKey);
      });

      this.socket.on('message', this.parseIncomingMessage.bind(this));
      this.socket.on('close', this.handleClose.bind(this));
      this.socket.on('open', () => {
        this.logInfo('Websocket connection opened ');
        this.currentRetryCount = 0;
        clearInterval(this.retryIntervalInstance);
        // automatically resubscribe to the subscribed channels if there are any

        const oldChannelListeners = _.cloneDeep(this.channelListeners);
        this.channelListeners = {};

        Object.entries(oldChannelListeners).forEach(
          ([channel, channelListeners]) => {
            for (const callback of channelListeners) {
              this.subscribeToChannel(channel as SocketChannels, callback);
            }
          }
        );
        res(null);
      });
    });
  }

  /**
   * Close the socket connection
   */
  async close() {
    this.socket?.close();
  }

  /**
   * Subscribes to Rolla Quote Requests
   * @param callback The callback that will be fired
   */
  subscribeToQuoteRequests(callback: (data: QuoteRequestDto) => void) {
    this.subscribeToChannel(SocketChannels.QUOTE_REQUESTS, callback);
  }

  /**
   * Subscribes to Rolla Meta Transactions Requests
   * @param callback The callback that will be fired
   */
  subscribeToMetaTxs(callback: (data: any) => void) {
    this.subscribeToChannel(SocketChannels.META_TRANSACTIONS, callback);
  }

  /**
   * Add an event listener to a particular channel
   * @param socketChannel Socket channel name, ex. quote requests, meta txs
   * @param callback the callback to be triggered when a an event is emitted inside this channel
   */
  private subscribeToChannel(
    socketChannel: SocketChannels,
    callback: (data: any) => void
  ) {
    // this is when there's no event listener registered yet
    if (
      !this.channelListeners[socketChannel] ||
      !this.channelListeners[socketChannel]?.length
    ) {
      this.channelListeners[socketChannel] = [];
    }
    // append the callback to the map
    this.channelListeners[socketChannel]?.push(callback);

    /**
     * I'm not sure if it's ok, but for now we're assuming the subscription is always successful
     * Ideally we need to listen to the response from the server with the same id as the one send to subscribe to the channel
     * and if we don't get any errors we should assume the subscription is successful
     */
    this.socketSend(jsonRpcCommands[socketChannel]());
    this.logInfo('Subscribed to ', socketChannel);
  }

  /**
   * @param data
   * @returns
   */
  private async parseIncomingMessage(data: any) {
    const parsedData = JSON.parse(data.toString());
    this.logInfo('new websocket message ', parsedData);
    const channel = parsedData?.channel;
    if (!channel || typeof channel !== 'string') {
      this.logInfo('Message without channel', parsedData);
      return;
    }
    // get the callbacks associated with this channel
    const subscriptionCallbacksToExecute =
      this.channelListeners[channel as SocketChannels];
    if (!subscriptionCallbacksToExecute) {
      this.logInfo('no subscription callback', parsedData);
      return;
    }
    for (const subscriptionCallbackToExecute of subscriptionCallbacksToExecute) {
      await subscriptionCallbackToExecute(parsedData.result);
    }
  }

  /**
   * Internal logging for WebSockets
   * @param message message to be logged
   */
  private logInfo(...message: any[]) {
    if (this.options.debugMode)
      console.log(`[ROLLA ${this.wsUrl}] `, new Date(), ...message);
  }

  /**
   * Send a json rpc command over the websocket
   * @param jsonRpcCommand
   */
  private socketSend(
    jsonRpcCommand: ReturnType<
      typeof jsonRpcCommands[keyof typeof jsonRpcCommands]
    >
  ) {
    if (!this.socket) {
      throw new Error('Socket not connected.');
    }
    this.logInfo('Sending message', jsonRpcCommand);
    this.socket.send(JSON.stringify(jsonRpcCommand));
  }

  /**
   * Function that it's called when the websocket connection is closed
   */
  private handleClose() {
    // this is important because handleClose is called also when a connection fails to establish
    // so we need to prevent the setInterval from being called again if we're in retry mode.
    if (this.currentRetryCount > 0) return;
    this.logInfo('Websocket closed!');
    // there's a case where the user can manually call .close() and this callback will be triggered meaning that
    // even though it's purposefully close, it will still try to reconnect. It's out of the scope of the quote-provider
    // and yield api context to handle this case and it would add a more complexity to handle this case.
    // Will ignore this "bug" for now.
    let { retryInterval } = this.options;
    const { retryCount } = this.options;
    if (!retryInterval) retryInterval = 3000;
    if (!retryCount) return;
    this.retryIntervalInstance = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this.currentRetryCount < retryCount) {
        this.currentRetryCount++;
        this.logInfo('Reconnecting ', this.currentRetryCount, ' times');
        this.open();
      } else {
        this.currentRetryCount = 0;
        clearInterval(this.retryIntervalInstance);
      }
    }, retryInterval);
  }
}
