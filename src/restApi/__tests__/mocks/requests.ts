import { ethers } from 'ethers';

import { SignatureType } from '../../../signing/types';
import { RollaApiClient } from '../../RollaApiClient';
import { MarketMakerQuoteResponseDto } from '../../output';

export async function postSuccessfulMetaTxResponses(client: RollaApiClient) {
  const [metaTxResponses, metaTxResponses2] = await Promise.all([
    client.postMetaTransactionResponses({
      lastLookResponseWithOrderSignatureDto: [
        {
          transactionHash: '0x',
          orderSignature: {
            signatureData:
              '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
            signatureType: SignatureType.EIP712,
          },
          marketMakerAction: 'ACCEPTED',
        },
      ],
    }),
    client.postMetaTransactionResponses({
      lastLookResponseWithOrderSignatureDto: [
        {
          transactionHash: '0x',
          orderSignature: {
            signatureData:
              '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002',
            signatureType: SignatureType.EIP712,
          },
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
        underlyingAsset: ethers.Wallet.createRandom().address,
        oracle: ethers.Wallet.createRandom().address,
        strikeAsset: ethers.Wallet.createRandom().address,
        strikePrice: '140000000000000000000',
        expiryTime: '1640995200',
        isCall: true,
      },
      orderCreationTimestamp: '',
      orderExpirationTimestamp: '',
      signature: {
        signatureData:
          '0x' + Buffer.from(ethers.utils.randomBytes(65)).toString('hex'),
        signatureType: SignatureType.EIP712,
      },
      taker: '',
      takingAmount: '',
      whitelist: '',
      quoteRequestId,
      takerIsSigner: false,
      orderTracking: {
        orderTag: '0x0',
        integrator: ethers.constants.AddressZero,
        integratorPercentage: '0',
      },
    };
  };
  const [response, response2] = await Promise.all([
    client.postQuoteResponses({
      marketMakerQuoteResponseDto: [
        createQuoteResponse(
          '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001'
        ),
      ],
    }),
    client.postQuoteResponses({
      marketMakerQuoteResponseDto: [
        createQuoteResponse(
          '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002'
        ),
      ],
    }),
  ]);
  return [response, response2];
}
