import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';

export interface TypedData {
  types: Record<string, TypedDataField[]>;
  domain: TypedDataDomain;
  primaryType: string;
  message: object;
}

export enum SignatureType {
  EIP712,
  EIP1271,
}

export interface Signature {
  signatureType: SignatureType;
  signatureData: string;
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
  expiryTime: string;
  isCall: boolean;
  strikePrice: string;
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
  orderTracking: OrderTracking;
  takerIsSigner: boolean;
}

export interface MetaOrder {
  functionType: number;
  nonce: number;
  deadline: string;
  from: string;
  order: Order;
  signature: Signature;
  permit: string;
}

export interface OrderWithSignature {
  order: Order;
  signature: Signature;
}

export interface MetaOrderWithSignature {
  metaOrder: MetaOrder;
  metaTxnSignature: Signature;
}

export interface OrderTracking {
  integrator: string;
  integratorPercentage: string;
  orderTag: string;
}

export interface MetaTxnObject {
  metaOrder: MetaOrder;
  r: string;
  s: string;
  v: number;
}
