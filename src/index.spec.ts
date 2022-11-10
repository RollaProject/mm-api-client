import * as RollaClient from './index';

it('sanity check for exported methods', () => {
  expect(RollaClient).toMatchInlineSnapshot(`
    {
      "MakerOverviewDtoStatusEnum": {
        "Active": "ACTIVE",
        "Inactive": "INACTIVE",
        "Suspended": "SUSPENDED",
      },
      "RollaApiClient": [Function],
      "RollaWS": [Function],
      "signOrder": [Function],
      "validateOrderSignature": [Function],
    }
  `);
});
