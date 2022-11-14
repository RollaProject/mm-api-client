import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
  LastLookResponseWithOrderSignatureDto,
  PostMetaTransactionResponseDto,
} from './output';

function filterUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export type Auth = IAuthentication | (() => Promise<string>) | (() => string);

export interface AxiosConfig {
  axiosInstance?: AxiosInstance;
  basePath?: ConfigurationParameters['basePath'];
  baseOptions?: ConfigurationParameters['baseOptions'];
}

export class RollaApiClient extends DefaultApi {
  public readonly baseApiPath: string;
  private req_pendingLastLookResponse: LastLookResponseWithOrderSignatureDto[] =
    [];
  private res_pendingLastLookResponse: Map<
    string,
    PostMetaTransactionResponseDto
  > = new Map();

  private pendingLastLookResponsePromise:
    | Promise<AxiosResponse<PostMetaTransactionResponseDto[]>>
    | undefined = undefined;

  private readonly batchingDelay = 100;

  constructor(protected auth: Auth, protected axiosConfig?: AxiosConfig) {
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
  }

  public async postMetaTransactionResponses(
    requestParameters: DefaultApiPostMetaTransactionResponsesRequest,
    options?: AxiosRequestConfig
  ) {
    this.req_pendingLastLookResponse.push(
      ...requestParameters.lastLookResponseWithOrderSignatureDto
    );
    const orderSignaturesOfThisCall =
      requestParameters.lastLookResponseWithOrderSignatureDto.map(
        (it) => it.orderSignature
      );

    const remoteCallPromise = (async () => {
      if (this.pendingLastLookResponsePromise) {
        return this.pendingLastLookResponsePromise;
      } else {
        const resultPromise = new Promise<
          AxiosResponse<PostMetaTransactionResponseDto[]>
        >((resolve, reject) => {
          setTimeout(async () => {
            try {
              const response = await this.batchedPostMetaTxResponses(options);
              resolve(response);
            } catch (err) {
              reject(err);
            }
          }, this.batchingDelay);
        });
        this.pendingLastLookResponsePromise = resultPromise;
        return resultPromise;
      }
    })();

    try {
      const response = await remoteCallPromise;
      const responseShallowCopy = { ...response };

      const correspondingResponses = orderSignaturesOfThisCall.map(
        (signature) => {
          return this.res_pendingLastLookResponse.get(signature);
        }
      );

      responseShallowCopy.data = correspondingResponses.filter(filterUndefined);
      return responseShallowCopy;
    } finally {
      orderSignaturesOfThisCall.forEach((signature) => {
        this.res_pendingLastLookResponse.delete(signature);
      });
    }
  }

  private async batchedPostMetaTxResponses(options?: AxiosRequestConfig) {
    const responses = this.req_pendingLastLookResponse.splice(
      0,
      this.req_pendingLastLookResponse.length
    );
    // this is needed otherwise subsequent requests will reuse previous response
    this.pendingLastLookResponsePromise = undefined;

    const response = await super.postMetaTransactionResponses(
      { lastLookResponseWithOrderSignatureDto: responses },
      options
    );
    response.data.forEach((it) =>
      this.res_pendingLastLookResponse.set(it.orderSignature, it)
    );
    return response;
  }
}
