import { RollaApiClient } from '../../RollaApiClient';
import { MarketMakerQuoteResponseDto } from '../../output';

export async function postSuccessfulMetaTxResponses(client: RollaApiClient) {
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
  return [metaTxResponses, metaTxResponses2];
}

export async function postSuccessfulQuoteResponses(client: RollaApiClient) {
  const createQuoteResponse = (
    quoteRequestId: string
  ): MarketMakerQuoteResponseDto => {
    return <MarketMakerQuoteResponseDto>{
      allowedSender: '',
      maker: '',
      makerAsset: '',
      makingAmount: '',
      optionAttributes: {
        // todo
      },
      orderCreationTimestamp: '',
      orderExpirationTimestamp: '',
      signature: '',
      taker: '',
      takingAmount: '',
      whitelist: '',
      quoteRequestId,
    };
  };
  const [response, response2] = await Promise.all([
    client.postQuoteResponses({
      marketMakerQuoteResponseDto: [createQuoteResponse('0x1')],
    }),
    client.postQuoteResponses({
      marketMakerQuoteResponseDto: [createQuoteResponse('0x2')],
    }),
  ]);
  return [response, response2];
}
