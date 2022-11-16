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
      "QuoteResponseReplyDtoValidityEnum": {
        "DuplicatedQuoteResponse": "DUPLICATED_QUOTE_RESPONSE",
        "InsufficientAllowance": "INSUFFICIENT_ALLOWANCE",
        "InsufficientBalance": "INSUFFICIENT_BALANCE",
        "InvalidCancellationTimestamp": "INVALID_CANCELLATION_TIMESTAMP",
        "InvalidMaker": "INVALID_MAKER",
        "InvalidMakingAmount": "INVALID_MAKING_AMOUNT",
        "InvalidQuote": "INVALID_QUOTE",
        "InvalidSignature": "INVALID_SIGNATURE",
        "MarketMakerSkipped": "MARKET_MAKER_SKIPPED",
        "NoQuoteRequestForResponse": "NO_QUOTE_REQUEST_FOR_RESPONSE",
        "OtherFailure": "OTHER_FAILURE",
        "RequestResponseMismatch": "REQUEST_RESPONSE_MISMATCH",
        "Timeout": "TIMEOUT",
        "ValidQuote": "VALID_QUOTE",
      },
      "RollaApiClient": [Function],
      "RollaWS": [Function],
      "signOrder": [Function],
      "validateOrderSignature": [Function],
    }
  `);
});
