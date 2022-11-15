import * as RollaClient from './index';

it('sanity check for exported methods', () => {
  expect(RollaClient).toMatchInlineSnapshot(`
    {
      "MakerOverviewDtoStatusEnum": {
        "Active": "ACTIVE",
        "Inactive": "INACTIVE",
        "Suspended": "SUSPENDED",
      },
      "PostMetaTransactionResponseDtoStatusEnum": {
        "AlreadyRespondedToTransaction": "ALREADY_RESPONDED_TO_TRANSACTION",
        "IncorrectMaker": "INCORRECT_MAKER",
        "MetaTransactionDoesntExist": "META_TRANSACTION_DOESNT_EXIST",
        "OtherFailure": "OTHER_FAILURE",
        "ResponseWindowExpired": "RESPONSE_WINDOW_EXPIRED",
        "Success": "SUCCESS",
      },
      "RollaApiClient": [Function],
      "RollaWS": [Function],
      "signOrder": [Function],
      "validateOrderSignature": [Function],
    }
  `);
});
