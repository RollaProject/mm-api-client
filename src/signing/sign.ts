import { Web3Provider } from '@ethersproject/providers';
import {
  MessageTypes,
  recoverTypedSignature,
  SignTypedDataVersion,
  TypedMessage,
} from '@metamask/eth-sig-util';
import { ethers, Wallet } from 'ethers';

import { getEIP712OrderMessage } from './EIP712Message';
import { NAME_ROP, VERSION_ROP } from './constants';
import { EIP712Domain, Order, OrderWithSignature } from './types';

function convertTypedObjectToRecord<T>(
  typedObject: T
): Record<string, unknown> {
  return <Record<string, unknown>>(<unknown>typedObject);
}

/**
 * Sign an order with a given wallet
 * @param walletProvider wallet to sign the order
 * @param order order to create a signature for
 * @param rollaOrderProtocolAddress rolla order protocol contract address
 * @param chainId chain id on which the contract is deployed
 * @returns order with signature
 */
export const signOrder = async (
  walletProvider: Wallet | Web3Provider,
  order: Order,
  rollaOrderProtocolAddress: string,
  chainId: number
): Promise<OrderWithSignature> => {
  const domain = {
    name: NAME_ROP,
    version: VERSION_ROP,
    chainId,
    verifyingContract: rollaOrderProtocolAddress,
  };
  const typedData = getEIP712OrderMessage(
    domain,
    convertTypedObjectToRecord(order)
  );
  const signature: string = await signMessage(walletProvider, typedData);

  return {
    order,
    signature,
  };
};

/**
 * Sign an EIP712 message
 * @param walletProvider wallet to sign the order
 * @param typedData EIP712 order typed data
 * @returns order signature signed by the wallet
 */
const signMessage = async (
  walletProvider: Wallet | Web3Provider,
  typedData: TypedMessage<MessageTypes>
): Promise<string> => {
  let signedMessage: string;

  if ('getSigner' in walletProvider) {
    const account = await walletProvider.getSigner().getAddress();
    signedMessage = await walletProvider.send('eth_signTypedData_v4', [
      account,
      JSON.stringify(typedData),
    ]);
  } else {
    const { EIP712Domain, ...typedDataTypes } = typedData.types;
    const typedDataDomain: any = typedData.domain;

    if (typedDataDomain.salt) {
      typedDataDomain.salt = String.fromCharCode.apply(
        null,
        new Uint16Array(typedDataDomain.salt) as any
      );
    }

    signedMessage = await walletProvider._signTypedData(
      typedDataDomain,
      typedDataTypes,
      typedData.message
    );
  }

  return signedMessage;
};

/**
 * Check if the signature provided matches the expected signature of the order
 * @param order order to validate the signature for
 * @param rollaOrderProtocolAddress rolla order protocol contract address
 * @param chainId chain id on which the contract is deployed
 * @param signature provided signature of the order
 * @returns true if the signature is correct, false otherwise
 */
export const validateOrderSignature = (
  order: Order,
  rollaOrderProtocolAddress: string,
  chainId: number,
  signature: string
): boolean => {
  const domain: EIP712Domain = {
    name: NAME_ROP,
    version: VERSION_ROP,
    chainId,
    verifyingContract: rollaOrderProtocolAddress,
  };
  const data = getEIP712OrderMessage(domain, convertTypedObjectToRecord(order));
  return (
    ethers.utils.getAddress(
      recoverTypedSignature({
        data,
        signature,
        version: SignTypedDataVersion.V4,
      })
    ) === ethers.utils.getAddress(order.maker)
  );
};
