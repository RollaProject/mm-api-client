import { OptionAttributesDto } from './optionAttributes.dto';

export type QuoteRequestDto = {
  /**
   * The timestamp when the order expires. If the block timestamp is after this timestamp when the order is submitted to the chain by the taker, the order will fail.
   * @example
   * `1649071507`
   */
  orderExpirationTimestamp: string;

  /**
   * The address of the taker of the order (seller of options)
   * @example
   * `0x0000000000000000000000000000000000000000`
   */
  taker: string;

  /**
   * The amount of options being sold in whole units - qTokens have 18 decimals
   * @example
   * `1000000000000000000`
   */
  takingAmount: string;

  /**
   * The attributes of the option to be sold adhering to struct format above
   */
  optionAttributes: OptionAttributesDto;

  /**
   * The address of the asset that the option is being purchased with
   * @example
   * `0x1B86e5322A589f065bD40F0114664Ca40D78164B`
   */
  makerAsset: string;
};
