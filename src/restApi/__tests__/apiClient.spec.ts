import {
  PostMetaTransactionResponseDtoStatusEnum,
  RollaApiClient,
} from '../index';

import { server } from './mocks/server';

describe('RollaApiClient', () => {
  const client = new RollaApiClient(() => 'SIWE test token');

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('baseApiPath is present', () => {
    expect(client.baseApiPath).toBe(
      'https://bsc-testnet-dev.rolla.finance/yield'
    );
  });

  it('can fetch assets', async () => {
    const assets = await client.getAllAssets();
    expect(assets.status).toBe(200);
    expect(assets.data.map((it) => it.symbol)).toStrictEqual([
      'WBNB',
      'ETH',
      'BTCB',
      'USDC',
      'BNB',
    ]);
  });

  it('can call an authenticated endpoint', async () => {
    const quotes = await client.getMarketMakerActiveQuotes({
      optionAddress: '0x1',
      underlyingAddress: '0x2',
    });
    expect(quotes.status).toBe(200);
    expect(quotes.data).toStrictEqual([]);
  });

  describe('batched endpoints', () => {
    async function postSuccessfulMetaTxResponses() {
      const [metaTxResponses, metaTxResponses2] = await Promise.all([
        client.postMetaTransactionResponses({
          lastLookResponseWithOrderSignatureDto: [
            {
              transactionHash: '0x',
              orderSignature: '0x1',
              marketMakerAction: 'ACCEPTED',
            },
          ],
        }),
        client.postMetaTransactionResponses({
          lastLookResponseWithOrderSignatureDto: [
            {
              transactionHash: '0x',
              orderSignature: '0x2',
              marketMakerAction: 'ACCEPTED',
            },
          ],
        }),
      ]);
      return { metaTxResponses, metaTxResponses2 };
    }

    it('postMetaTransactionResponses batches requests together', async () => {
      const { metaTxResponses, metaTxResponses2 } =
        await postSuccessfulMetaTxResponses();

      // parts of the returned object are the same because the requests are batched together
      // TODO should the parts that are the same be cloned so that they are not shared?
      expect(metaTxResponses.headers).toBe(metaTxResponses2.headers);
      expect(metaTxResponses.request).toBe(metaTxResponses2.request);
      expect(metaTxResponses.data).not.toBe(metaTxResponses2.data);

      expect(metaTxResponses.status).toBe(200);
      expect(metaTxResponses.data).toStrictEqual([
        {
          orderSignature: '0x1',
          status: PostMetaTransactionResponseDtoStatusEnum.Success,
        },
      ]);
      expect(metaTxResponses2.status).toBe(200);
      expect(metaTxResponses2.data).toStrictEqual([
        {
          orderSignature: '0x2',
          status: PostMetaTransactionResponseDtoStatusEnum.Success,
        },
      ]);
    });

    it('failures: when first request fails, second (batched) also fails', async () => {
      const invalidAuthHeader = { Authorization: 'invalid' };
      const [failed1, failed2] = await Promise.allSettled([
        client.postMetaTransactionResponses(
          {
            lastLookResponseWithOrderSignatureDto: [
              // doesn't matter what the body is, it will fail because of the invalid auth header
            ],
          },
          { headers: invalidAuthHeader }
        ),
        client.postMetaTransactionResponses({
          lastLookResponseWithOrderSignatureDto: [
            // doesn't matter what the body is, it will fail because of the invalid auth header ^
          ],
        }),
      ]);

      if ('reason' in failed1 && 'reason' in failed2) {
        expect(failed1.reason.response.status).toBe(401);
        expect(failed2.reason.response.status).toBe(401);
      } else {
        throw new Error('expected both promises to be rejected');
      }

      // after that, the batching works again
      const { metaTxResponses, metaTxResponses2 } =
        await postSuccessfulMetaTxResponses();
      expect(metaTxResponses.data).toStrictEqual([
        {
          orderSignature: '0x1',
          status: PostMetaTransactionResponseDtoStatusEnum.Success,
        },
      ]);
      expect(metaTxResponses2.status).toBe(200);
      expect(metaTxResponses2.data).toStrictEqual([
        {
          orderSignature: '0x2',
          status: PostMetaTransactionResponseDtoStatusEnum.Success,
        },
      ]);
    });
  });
});
