import {
  PostMetaTransactionResponseDtoStatusEnum,
  QuoteResponseReplyDtoValidityEnum,
  RollaApiClient,
} from '../index';

import {
  postSuccessfulMetaTxResponses,
  postSuccessfulQuoteResponses,
} from './mocks/requests';
import { server } from './mocks/server';

describe('RollaApiClient', () => {
  const client = new RollaApiClient(() => 'SIWE test token');

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
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
    it.each([
      [
        postSuccessfulMetaTxResponses,
        {
          result1: [
            {
              orderSignature: '0x1',
              status: PostMetaTransactionResponseDtoStatusEnum.Success,
            },
          ],
          result2: [
            {
              orderSignature: '0x2',
              status: PostMetaTransactionResponseDtoStatusEnum.Success,
            },
          ],
        },
      ],
      [
        postSuccessfulQuoteResponses,
        {
          result1: [
            {
              validity: QuoteResponseReplyDtoValidityEnum.ValidQuote,
              quoteRequestId: '0x1',
            },
          ],
          result2: [
            {
              validity: QuoteResponseReplyDtoValidityEnum.ValidQuote,
              quoteRequestId: '0x2',
            },
          ],
        },
      ],
    ])(
      'postMetaTransactionResponses/postQuoteResponses batches requests together',
      async (input, expected) => {
        const [response1, response2] = await input(client);

        // parts of the returned object are the same because the requests are batched together
        expect(response1.request).toBe(response2.request);
        expect(response1.headers).toBe(response2.headers);
        expect(response1.data).not.toBe(response2.data);

        expect(response1.status).toBe(200);
        expect(response1.data).toStrictEqual(expected.result1);
        expect(response2.status).toBe(200);
        expect(response2.data).toStrictEqual(expected.result2);
      }
    );

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
      const [metaTxResponses, metaTxResponses2] =
        await postSuccessfulMetaTxResponses(client);
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
