export class OptionAttributesDto {
  /**
   * The address of the underlying asset on chain. The symbol can be looked up using the assets endpoint.
   * @example
   * `0x8Dc38d323530D8FF7420152632fE23fB5F6eBfDe`
   */
  underlyingAsset: string;

  /**
   * The address of the oracle on chain. This is used for settling the option post expiry
   * @example
   * `0x5551aB86F158606C06F81649831cdd09830698fA`
   */
  oracle: string;

  /**
   * The strike price of the option. This is in whole units of the stablecoin currency.
   * @example
   * `50000000000000000000000`
   */
  strikePrice: string;

  /**
   * The expiry time of the option as a unix timestamp in seconds.
   * @example
   * `1651194000`
   */
  expiryTime: string;

  /**
   * Whether the option is a call or put.
   * @example
   * `true`
   */
  isCall: boolean;
}
