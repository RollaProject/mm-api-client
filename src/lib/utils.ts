import { Wallet } from 'ethers';

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
  const address = wallet.address.toString();
  const message = generateMessage({ address, ...options });

  const signature = await wallet.signMessage(message);
  const auth = JSON.stringify({ message, signature });

  return auth;
}
