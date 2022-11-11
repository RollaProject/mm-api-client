import { RollaApiClient } from '../index';

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
});
