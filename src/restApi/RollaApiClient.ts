import { AxiosInstance } from 'axios';

import rollaApiConfig from '../rollaApi.config.json';
import {
  getAuthenticationString,
  IAuthentication,
  YIELD_ENDPOINT,
} from '../utils';

import { Configuration, ConfigurationParameters, DefaultApi } from './output';

export type Auth = IAuthentication | (() => Promise<string>) | (() => string);

export interface AxiosConfig {
  axiosInstance?: AxiosInstance;
  basePath?: ConfigurationParameters['basePath'];
  baseOptions?: ConfigurationParameters['baseOptions'];
}

export class RollaApiClient extends DefaultApi {
  public readonly baseApiPath: string;

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
}
