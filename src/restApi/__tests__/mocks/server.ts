import { rest } from 'msw';
import { setupServer } from 'msw/node';

import rollaApiRoot from '../../../rollaApi.config.json';
import {
  AssetDto,
  LastLookResponseWithOrderSignatureDto,
  MarketMakerQuoteResponseDto,
  PostMetaTransactionResponseDto,
  PostMetaTransactionResponseDtoStatusEnum,
  QuoteResponseReplyDto,
} from '../../output';

// This configures a request mocking server with the given request handlers.
export const server = setupServer(
  rest.get(rollaApiRoot.rollaApiRoot + '/yield/v1/assets', (_req, res, ctx) => {
    const assets: Array<AssetDto> = [
      {
        tokenAddress: '0x19872A2ACc7c183A4d9B95a4cFE9c81e6765557E',
        name: 'Wrapped BNB',
        symbol: 'WBNB',
        assetName: 'BNB',
        assetSymbol: 'BNB',
        coinGeckoID: 'binancecoin',
        decimals: 18,
        isStablecoin: false,
      },
      {
        tokenAddress: '0x5b99171e5a31233aF41f7c6Efa5c406A2CfAba59',
        name: 'Ethereum Token',
        symbol: 'ETH',
        assetName: 'Ethereum',
        assetSymbol: 'ETH',
        coinGeckoID: 'ethereum',
        decimals: 18,
        isStablecoin: false,
      },
      {
        tokenAddress: '0x8Dc38d323530D8FF7420152632fE23fB5F6eBfDe',
        name: 'BTCB Token',
        symbol: 'BTCB',
        assetName: 'Bitcoin',
        assetSymbol: 'BTC',
        coinGeckoID: 'bitcoin',
        decimals: 18,
        isStablecoin: false,
      },
      {
        tokenAddress: '0x29630dA8A60c1FE60F9F2801d2B8236CDA66c33A',
        name: 'USD Coin',
        symbol: 'USDC',
        assetName: 'USDC',
        assetSymbol: 'USDC',
        coinGeckoID: 'usd-coin',
        decimals: 18,
        isStablecoin: true,
      },
      {
        tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        name: 'BNB',
        symbol: 'BNB',
        assetName: 'BNB',
        assetSymbol: 'BNB',
        coinGeckoID: 'binancecoin',
        decimals: 18,
        isStablecoin: false,
        wrappedAddress: '0x19872A2ACc7c183A4d9B95a4cFE9c81e6765557E',
      },
    ];
    return res(ctx.status(200), ctx.json(assets));
  }),
  rest.get(
    rollaApiRoot.rollaApiRoot + '/yield/v1/quotes/active',
    (req, res, ctx) => {
      if (req.headers.get('Authorization') !== 'SIWE test token') {
        return res(ctx.status(401));
      }
      return res(ctx.status(200), ctx.json([]));
    }
  ),
  rest.post(
    rollaApiRoot.rollaApiRoot + '/yield/v1/metatransaction/responses',
    async (req, res, ctx) => {
      if (req.headers.get('Authorization') !== 'SIWE test token') {
        return res(ctx.status(401));
      }
      const reqBody: LastLookResponseWithOrderSignatureDto[] = await req.json();
      const body: PostMetaTransactionResponseDto[] = reqBody.map((item) => {
        return {
          orderSignature: item.orderSignature,
          status: PostMetaTransactionResponseDtoStatusEnum.Success,
        };
      });
      return res(ctx.status(200), ctx.json(body));
    }
  ),
  rest.post(
    rollaApiRoot.rollaApiRoot + '/yield/v1/quotes/responses',
    async (req, res, ctx) => {
      if (req.headers.get('Authorization') !== 'SIWE test token') {
        return res(ctx.status(401));
      }
      const reqBody: MarketMakerQuoteResponseDto[] = await req.json();
      const body: QuoteResponseReplyDto[] = reqBody.map((item) => {
        return {
          validity: 'VALID_QUOTE',
          quoteRequestId: item.quoteRequestId,
        };
      });
      return res(ctx.status(200), ctx.json(body));
    }
  )
);
