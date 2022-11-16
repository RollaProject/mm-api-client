import { AxiosInstance, AxiosRequestConfig } from 'axios';

import rollaApiConfig from '../rollaApi.config.json';
import {
  getAuthenticationString,
  IAuthentication,
  YIELD_ENDPOINT,
} from '../utils';

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
    const getAuthHeader =
      typeof auth === 'function'
        ? auth
        : () =>
            getAuthenticationString(auth.privateKey, { chainId: auth.chainId });

    const { axiosInstance, basePath, baseOptions } = axiosConfig || {};

    const usedBasePath =
      basePath ?? rollaApiConfig.rollaApiRoot + YIELD_ENDPOINT;

    const configuration = new Configuration({
      baseOptions,
      apiKey: getAuthHeader,
    });
    super(configuration, usedBasePath, axiosInstance);
    this.baseApiPath = usedBasePath;
    this.lastLookResponseBatcher = new RequestBatcher(batchingDelay);
    this.quoteResponsesBatcher = new RequestBatcher(batchingDelay);
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
      (params) => params.orderSignature,
      (params) => params.orderSignature
    );
  }
}
