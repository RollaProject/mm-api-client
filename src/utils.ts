import { Wallet } from 'ethers';

export interface IAuthentication {
  /**
   * Your private key as a market maker
   */
  privateKey: string;
  /**
   * Chain id
   */
  chainId: number;
}

export const YIELD_ENDPOINT = '/yield';

const generateMessage = ({
  address,
  chainId,
  issuedAt = new Date().toISOString(),
}: {
  address: string;
  chainId: number;
  issuedAt?: string;
}) => `RollaYieldAPI wants you to sign in with your Ethereum account:
${address}

NULL

URI: https://example.com/
Version: 1
Chain ID: ${chainId}
Nonce: 12345678
Issued At: ${issuedAt}`;

export async function getAuthenticationString(
  privateKey: string,
  options: { chainId: number; issuedAt?: string }
) {
  const wallet = new Wallet(privateKey);
  const address = wallet.address
  const message = generateMessage({ address, ...options });

  const signature = await wallet.signMessage(message);
  const auth = JSON.stringify({ message, signature });

  return auth;
}
