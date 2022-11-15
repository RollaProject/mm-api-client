import {  AxiosResponse } from 'axios';

function filterUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}


export class RequestBatcher<ReqParam , Res> {
  private req_pendingLastLookResponse: ReqParam[] =
    [];
  private res_pendingLastLookResponse: Map<
    string,
    Res
    > = new Map();

  constructor(private readonly batchingDelay = 100) {
  }

  private pendingLastLookResponsePromise:
    | Promise<AxiosResponse<Res[]>>
    | undefined = undefined;

  public async makeBatchedRequest(
    requestParameters: ReqParam[],
    makeRequest: (params: ReqParam[]) => Promise<AxiosResponse<Res[]>>,
    extractRequestId: (params: ReqParam) => string,
    extractResponseId: (params: Res) => string
  ) {
    this.req_pendingLastLookResponse.push(
      ...requestParameters
    );
    const orderSignaturesOfThisCall =
      requestParameters.map(
        (it) => extractRequestId(it)
      );

    const remoteCallPromise = (async () => {
      if (this.pendingLastLookResponsePromise) {
        return this.pendingLastLookResponsePromise;
      } else {
        const resultPromise = new Promise<
          AxiosResponse<Res[]>
          >((resolve, reject) => {
          setTimeout(async () => {
            try {
              const response = await this.batchedPostMetaTxResponses(makeRequest, extractResponseId);
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

  private async batchedPostMetaTxResponses(makeRequest: (params: ReqParam[]) => Promise<AxiosResponse<Res[]>>, extractResponseId: (response: Res)=>string): Promise<AxiosResponse<Res[]>> {
    const responses = this.req_pendingLastLookResponse.splice(
      0,
      this.req_pendingLastLookResponse.length
    );
    // this is needed otherwise subsequent requests will reuse previous response
    this.pendingLastLookResponsePromise = undefined;

    const response = await makeRequest(responses)
    response.data.forEach((it) =>
      this.res_pendingLastLookResponse.set(extractResponseId(it), it)
    );
    return response;
  }
}
