import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { BigNumberish } from 'ethers';

export interface TypedData {
  types: Record<string, TypedDataField[]>;
  domain: TypedDataDomain;
  primaryType: string;
  message: object;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface OptionAttributes {
  underlyingAsset: string;
  oracle: string;
  strikePrice: string;
  expiryTime: string;
  isCall: boolean;
}

export interface Order {
  orderCreationTimestamp: string;
  orderExpirationTimestamp: string;
  makerAsset: string;
  optionAttributes: OptionAttributes;
  maker: string;
  taker: string;
  allowedSender: string;
  makingAmount: string;
  takingAmount: string;
  whitelist: string;
}

export interface OrderWithSignature {
  order: Order;
  signature: string;
}

export interface OrderTracking {
  integrator: string;
  integratorPercentage: BigNumberish;
  orderTag: string;
}

export interface OrderTracking {
  integrator: string;
  integratorPercentage: BigNumberish;
  orderTag: string;
}
