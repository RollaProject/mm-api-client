import { MessageTypes, TypedMessage } from '@metamask/eth-sig-util';

import { EIP712Domain as EIP712DomainType } from './types';

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

const Order = [
  { name: 'orderCreationTimestamp', type: 'uint64' },
  { name: 'orderExpirationTimestamp', type: 'uint64' },
  { name: 'makerAsset', type: 'address' },
  { name: 'optionAttributes', type: 'OptionAttributes' },
  { name: 'maker', type: 'address' },
  { name: 'taker', type: 'address' },
  { name: 'allowedSender', type: 'address' },
  { name: 'makingAmount', type: 'uint256' },
  { name: 'takingAmount', type: 'uint256' },
  { name: 'whitelist', type: 'address' },
];

const OptionAttributes = [
  { name: 'underlyingAsset', type: 'address' },
  { name: 'oracle', type: 'address' },
  { name: 'expiryTime', type: 'uint88' },
  { name: 'isCall', type: 'bool' },
  { name: 'strikePrice', type: 'uint256' },
];

export const getEIP712OrderMessage = (
  domain: EIP712DomainType,
  order: Record<string, unknown>
): TypedMessage<MessageTypes> => {
  return {
    types: {
      EIP712Domain,
      Order,
      OptionAttributes,
    },
    domain,
    primaryType: 'Order',
    message: order,
  };
};
