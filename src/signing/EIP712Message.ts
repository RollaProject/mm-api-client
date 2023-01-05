import { MessageTypes, TypedMessage } from '@metamask/eth-sig-util';

import { EIP712Domain as EIP712DomainType } from './types';

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

const OrderTracking = [
  { name: 'integrator', type: 'address' },
  { name: 'integratorPercentage', type: 'uint256' },
  { name: 'orderTag', type: 'bytes32' },
];

const Signature = [
  { name: 'signatureType', type: 'uint256' },
  { name: 'signatureData', type: 'bytes' },
];

const MetaOrder = [
  { name: 'functionType', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'from', type: 'address' },
  { name: 'order', type: 'Order' },
  { name: 'signature', type: 'Signature' },
  { name: 'permit', type: 'bytes' },
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
  { name: 'orderTracking', type: 'OrderTracking' },
  { name: 'takerIsSigner', type: 'bool' },
];

const OptionAttributes = [
  { name: 'underlyingAsset', type: 'address' },
  { name: 'oracle', type: 'address' },
  { name: 'expiryTime', type: 'uint88' },
  { name: 'isCall', type: 'bool' },
  { name: 'strikePrice', type: 'uint256' },
];

const getEIP712OrderMessage = (
  domain: EIP712DomainType,
  order: Record<string, unknown>
): TypedMessage<MessageTypes> => {
  return {
    types: {
      EIP712Domain,
      Order,
      OptionAttributes,
      OrderTracking,
    },
    domain,
    primaryType: 'Order',
    message: order,
  };
};

const getEIP712MetaOrderMessage = (
  domain: EIP712DomainType,
  metaOrder: Record<string, unknown>
): TypedMessage<MessageTypes> => {
  return {
    types: {
      EIP712Domain,
      MetaOrder,
      Order,
      OptionAttributes,
      OrderTracking,
      Signature,
    },
    domain,
    primaryType: 'MetaOrder',
    message: metaOrder,
  };
};

const getEIP712PermitMessage = (
  domain: EIP712DomainType,
  owner: string,
  spender: string,
  value: string,
  nonce: number,
  deadline: number
): TypedMessage<MessageTypes> => {
  return {
    types: {
      EIP712Domain,
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    domain,
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };
};

export {
  getEIP712OrderMessage,
  getEIP712MetaOrderMessage,
  getEIP712PermitMessage,
};
