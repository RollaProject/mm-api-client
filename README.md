# Rolla client

This package contains

- TypeScript client for the Rolla REST api
- WebSocket client for handling quote requests
- Utilities for order signing

The REST client is generated from the OpenAPI specification, is type-safe and easy to use.

## Installation

```bash
npm install @rolla-finance/api-client
```

## Api client usage

Some of the calls that the client makes require authentication using [Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361).
For that reason we require that you provide private key and chain id that we use to generate the authentication string, or provide a function that returns the authentication string.

The client uses Axios for http requests. You can pass in an existing Axios instance as well as other axios options in the second constructor argument.

Basic api client usage is as follows:

```typescript
import { RollaApiClient } from '@rolla-finance/api-client';

const client = new RollaApiClient({
  privateKey: 'private_key',
  chainId: 96,
});

// or construct with a function that returnd the authentication string
const apiClient = new RollaApiClient(() =>
  someFunctionToGetAuthenticationString(),
);

const assetsResponse = await client.getAllAssets();
await client.getMarketMakerActiveQuotes({
    optionAddress: '0x1',
    underlyingAddress: '0x2',
})
// etc.
```

## Signing utilities usage

```typescript
import { signOrder, validateOrderSignature } from '@rolla-finance/api-client';
import { Wallet } from "ethers";

async function run() {
    const privateKey = "your private key";

    const wallet = new Wallet(privateKey);

    const order = {
        orderCreationTimestamp: "1667334929",
        orderExpirationTimestamp: "1667335048",
        makerAsset: "0x29630dA8A60c1FE60F9F2801d2B8236CDA66c33A",
        optionAttributes: {
            underlyingAsset: "0x8Dc38d323530D8FF7420152632fE23fB5F6eBfDe",
            oracle: "0xc213317D5844479fD9deD11dbcd4d5A005FCC3a1",
            strikePrice: "50001000000000000000000",
            expiryTime: "1669363200",
            isCall: true,
        },
        maker: await wallet.getAddress(),
        taker: "0x09D0750364e362D5235E1BAA15134a9C7c4164b2",
        allowedSender: "0x194c851021ABc7f64B51D11b58e251A8370d54dc",
        makingAmount: "150000000000000000",
        takingAmount: "1000000000000000000",
        whitelist: "0x0000000000000000000000000000000000000000",
    };

    const rollaOrderProtocolAddress =
        "0x00868694d84A5F979f1199419A26863086F0BCb9";
    const chainId = 97;

    const { signature } = await signOrder(
        wallet,
        order,
        rollaOrderProtocolAddress,
        chainId
    );

    const isSignatureValid: boolean = validateOrderSignature(
        order,
        rollaOrderProtocolAddress,
        chainId,
        signature
    );

    console.log("Is the signature valid: " + isSignatureValid);
}

run();
```

## WebSocket client usage

// TODO

## License

BSL-1.0

