import { Provider, Web3Provider } from '@ethersproject/providers';
import {
  MessageTypes,
  recoverTypedSignature,
  SignTypedDataVersion,
  TypedMessage,
} from '@metamask/eth-sig-util';
import { BigNumber, ethers, Wallet } from 'ethers';

import { getEIP712OrderMessage } from './EIP712Message';
import RollaOrderProtocolAbi from './abis/RollaOrderProtocol.json';
import { NAME_ROP, VERSION_ROP } from './constants';
import { RollaOrderProtocol } from './typechain/RollaOrderProtocol';
import {
  EIP712Domain,
  MetaOrder,
  MetaTxnObject,
  OptionAttributes,
  Order,
  OrderTracking,
  OrderWithSignature,
  Signature,
  SignatureType,
} from './types';

function convertTypedObjectToRecord<T>(
  typedObject: T
): Record<string, unknown> {
  return <Record<string, unknown>>(<unknown>typedObject);
}

export const getDefaultDeadline = () => {
  return BigNumber.from(
    Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
  ).toString();
};

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
  { name: 'signatureType', type: 'uint8' },
  { name: 'signatureData', type: 'bytes' },
];

const MetaOrder = [
  { name: 'functionType', type: 'uint8' },
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

function buildMetaTxnData(
  chainId: number,
  verifyingContract: string,
  metaOrder: MetaOrder
) {
  return {
    primaryType: 'MetaOrder',
    types: {
      EIP712Domain,
      MetaOrder,
      Order,
      OptionAttributes,
      OrderTracking,
      Signature,
    },
    domain: {
      name: NAME_ROP,
      version: VERSION_ROP,
      chainId,
      verifyingContract,
    },
    message: metaOrder,
  };
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
  const signature: Signature = await signMessage(walletProvider, typedData);

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
): Promise<Signature> => {
  let signedMessage: string;

  if ('getSigner' in walletProvider) {
    const account = await walletProvider.getSigner().getAddress();
    signedMessage = await walletProvider.send('eth_signTypedData_v4', [
      account,
      JSON.stringify(typedData),
    ]);
  } else {
    const { EIP712Domain, ...otherTypes } = typedData.types;
    const typedDataTypes = { ...otherTypes };
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

  return { signatureType: SignatureType.EIP712, signatureData: signedMessage };
};

/**
 * Check if the signature provided is valid for the given signer
 * @param signedDataHash bytes32 hash of the signed data
 * @param signature bytes signature of the signed data
 * @param signer address of the signer
 * @param provider optional provider to use to query the signing contract if the signature is EIP1271
 * @returns true if the signature is valid, false otherwise
 */
export const validateSignature = async (
  signedDataHash: TypedMessage<MessageTypes>,
  signature: Signature,
  signer: string,
  provider?: Provider
): Promise<boolean> => {
  if (signature.signatureType === SignatureType.EIP712) {
    return (
      ethers.utils.getAddress(
        recoverTypedSignature({
          data: signedDataHash,
          signature: signature.signatureData,
          version: SignTypedDataVersion.V4,
        })
      ) === ethers.utils.getAddress(signer)
    );
  } else if (signature.signatureType === SignatureType.EIP1271) {
    const EIP1271_MAGIC_VALUE = '0x1626ba7e';

    const eip1271Interface = new ethers.utils.Interface([
      'function isValidSignature(bytes32 hash, bytes memory signature) view returns (bytes4 magicValue)',
    ]);

    const signingContract = new ethers.Contract(
      signer,
      eip1271Interface,
      provider
    );

    try {
      const result = await signingContract.isValidSignature(
        signedDataHash,
        signature.signatureData
      );
      return result === EIP1271_MAGIC_VALUE;
    } catch (_) {
      // Some contracts like the Gnosis Safe will revert if the signature length is wrong (GS020)
      // or if the derived signers are not the safe owners (GS026).
      return false;
    }
  }

  // invalid signature type
  return false;
};

/**
 * Check if the signature provided matches the expected signature of the order
 * @param order order to validate the signature for
 * @param rollaOrderProtocolAddress rolla order protocol contract address
 * @param chainId chain id on which the contract is deployed
 * @param signature provided signature of the order
 * @param provider optional provider to use to query the signing contract if the signature is EIP1271
 * @returns true if the signature is correct, false otherwise
 */
export const validateOrderSignature = async (
  order: Order,
  rollaOrderProtocolAddress: string,
  chainId: number,
  signature: Signature,
  provider?: Provider
): Promise<boolean> => {
  const domain: EIP712Domain = {
    name: NAME_ROP,
    version: VERSION_ROP,
    chainId,
    verifyingContract: rollaOrderProtocolAddress,
  };

  const data = getEIP712OrderMessage(domain, convertTypedObjectToRecord(order));

  const signer = order.takerIsSigner ? order.taker : order.maker;

  return validateSignature(data, signature, signer, provider);
};

/**
 * Check if the signature provided matches the expected signature of the meta txn
 * @param signerAddress signer of the meta order
 * @param rollaOrderProtocolAddress rolla order protocol contract address
 * @param metaOrder meta order to validate the signature for
 * @param signature provided signature of the meta order
 * @param chainId chain id on which the contract is deployed
 * @param provider optional provider to use to query the signing contract if the signature is EIP1271
 * @returns true if the signature is correct, false otherwise
 */
export const validateMetaOrderSignature = async (
  signerAddress: string,
  rollaOrderProtocolAddress: string,
  metaOrder: MetaOrder,
  signature: Signature,
  chainId: number,
  provider?: Provider
): Promise<boolean> => {
  const data: any = buildMetaTxnData(
    chainId,
    rollaOrderProtocolAddress,
    metaOrder
  );

  return validateSignature(data, signature, signerAddress, provider);
};

/**
 * Get meta-txn signature for fillOrder, fillWithPermit, cancelOrder or cancelOrdersUpTo
 * @param walletProvider wallet provider to sign the meta-txn
 * @param rollaOrderProtocolAddress rolla order protocol contract address
 * @param order order to be filled
 * @param chainId chain id on which the contract is deployed
 * @param functionType enum value for fillOrder, fillWithPermit, cancelOrder or cancelOrdersUpTo
 * @param signature signature of the order
 * @param permit permit signature in case of fillWithPemit
 * @param metaDeadline expiry timestamp for the meta-txn signature
 * @param nonce nonce for the meta-txn signer
 * @returns meta-order along with r, s, v of the meta-txn signature
 */
export const signOrderMetaTxn = async (
  walletProvider: Wallet | Web3Provider,
  rollaOrderProtocolAddress: string,
  order: Order,
  chainId: number,
  functionType: number,
  signature: Signature,
  permit = '0x00',
  metaDeadline: string = getDefaultDeadline(),
  nonce?: number
): Promise<MetaTxnObject> => {
  const signer =
    'getSigner' in walletProvider ? walletProvider.getSigner() : walletProvider;
  const rollaOrderProtocol = <RollaOrderProtocol>(
    new ethers.Contract(
      rollaOrderProtocolAddress,
      RollaOrderProtocolAbi,
      signer
    )
  );
  const signerAddress = await signer.getAddress();

  const metaOrder = {
    functionType,
    nonce:
      typeof nonce === 'undefined'
        ? (await rollaOrderProtocol.getNonce(signerAddress)).toNumber()
        : nonce,
    deadline: metaDeadline,
    from: signerAddress,
    order: order,
    signature,
    permit,
  };

  const metaTxnData: any = buildMetaTxnData(
    chainId,
    rollaOrderProtocolAddress,
    metaOrder
  );

  const metaTxnSignature = await signMessage(walletProvider, metaTxnData);
  const { r, s, v } = ethers.utils.splitSignature(
    metaTxnSignature.signatureData
  );
  return { metaOrder, r, s, v };
};
