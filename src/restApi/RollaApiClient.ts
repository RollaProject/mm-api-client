import { AxiosInstance, AxiosRequestConfig } from 'axios';

import { RollaWS } from '..';
import rollaApiConfig from '../rollaApi.config.json';
import {
  getAuthenticationString,
  IAuthentication,
  YIELD_ENDPOINT,
} from '../utils';
import { IRollaWSOptions } from '../wsApi/RollaWs';

import {
  Configuration,
  ConfigurationParameters,
  DefaultApi,
  DefaultApiPostMetaTransactionResponsesRequest,
  DefaultApiPostQuoteResponsesRequest,
  LastLookResponseWithOrderSignatureDto,
  MarketMakerQuoteResponseDto,
  PostMetaTransactionResponseDto,
  QuoteResponseReplyDto,
} from './output';
import { RequestBatcher } from './output/RequestBatcher';
import { SignatureDto } from './output/interfaces/signature-dto';

export type Auth = IAuthentication | (() => Promise<string>) | (() => string);

export interface AxiosConfig {
  axiosInstance?: AxiosInstance;
  basePath?: ConfigurationParameters['basePath'];
  baseOptions?: ConfigurationParameters['baseOptions'];
}

export class RollaApiClient extends DefaultApi {
  public readonly baseApiPath: string;
  private readonly lastLookResponseBatcher: RequestBatcher<
    LastLookResponseWithOrderSignatureDto,
    PostMetaTransactionResponseDto
  >;
  private readonly quoteResponsesBatcher: RequestBatcher<
    MarketMakerQuoteResponseDto,
    QuoteResponseReplyDto
  >;
  constructor(
    protected auth: Auth,
    protected axiosConfig?: AxiosConfig,
    protected readonly batchingDelay = 100
  ) {
    const authHeader =
      typeof auth === 'function'
        ? auth
        : () =>
            getAuthenticationString(auth.privateKey, { chainId: auth.chainId });

    const { axiosInstance, basePath, baseOptions } = axiosConfig || {};

    const usedBasePath =
      basePath ?? rollaApiConfig.rollaApiRoot + YIELD_ENDPOINT;

    const configuration = new Configuration({
      baseOptions,
      apiKey: authHeader,
    });
    super(configuration, usedBasePath, axiosInstance);
    this.baseApiPath = usedBasePath;
    this.lastLookResponseBatcher = new RequestBatcher(batchingDelay);
    this.quoteResponsesBatcher = new RequestBatcher(batchingDelay);
  }

  public async initRollaWS(
    options: Omit<IRollaWSOptions, 'authorization' | 'wsUrl'> = {}
  ) {
    const authHeader =
      typeof this.auth === 'function'
        ? await this.auth()
        : await // @ts-ignore
          getAuthenticationString(this.auth.privateKey, {
            // @ts-ignore
            chainId: this.auth.chainId,
          });
    const wsYieldApi = new URL(this.baseApiPath)
      .toString()
      .replace('http', 'ws');

    return new RollaWS({
      wsUrl: wsYieldApi,
      authorization: authHeader,
      ...options,
    });
  }

  public postQuoteResponses(
    requestParameters: DefaultApiPostQuoteResponsesRequest,
    options?: AxiosRequestConfig
  ) {
    return this.quoteResponsesBatcher.makeBatchedRequest(
      requestParameters.marketMakerQuoteResponseDto,
      (params) =>
        super.postQuoteResponses(
          { marketMakerQuoteResponseDto: params },
          options
        ),
      (params) => params.quoteRequestId,
      (params) => params.quoteRequestId
    );
  }

  public postMetaTransactionResponses(
    requestParameters: DefaultApiPostMetaTransactionResponsesRequest,
    options?: AxiosRequestConfig
  ) {
    return this.lastLookResponseBatcher.makeBatchedRequest(
      requestParameters.lastLookResponseWithOrderSignatureDto,
      (params) =>
        super.postMetaTransactionResponses(
          { lastLookResponseWithOrderSignatureDto: params },
          options
        ),
      (params) => (params.orderSignature as SignatureDto).signatureData,
      (params) => (params.orderSignature as SignatureDto).signatureData
    );
  }
}
