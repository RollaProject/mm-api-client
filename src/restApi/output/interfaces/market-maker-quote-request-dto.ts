/* tslint:disable */
/* eslint-disable */
/**
 * Rolla Yield API - Market Maker
 * Rolla Yield API provides a RESTful API for fetching assets, options and quotes
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { QuoteDtoOptionAttributes } from './quote-dto-option-attributes';

/**
 * 
 * @export
 * @interface MarketMakerQuoteRequestDto
 */
export interface MarketMakerQuoteRequestDto {
    /**
     * The timestamp when the order expires. If the block timestamp is after this timestamp when the order is submitted to the chain by the taker, the order will fail.
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'orderExpirationTimestamp': string;
    /**
     * The address of the taker of the order (seller of options)
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'taker': string;
    /**
     * The amount of options being sold in whole units - qTokens have 18 decimals
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'takingAmount': string;
    /**
     * 
     * @type {QuoteDtoOptionAttributes}
     * @memberof MarketMakerQuoteRequestDto
     */
    'optionAttributes': QuoteDtoOptionAttributes;
    /**
     * The address of the asset that the option is being purchased with
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'makerAsset': string;
    /**
     * The user who can submit the order to the chain. Zero address means anyone.
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'allowedSender': string;
    /**
     * If the OrderProtocol contract is being called by a contract address and not directly by an EOA, the contract used to call the order protocol must be in the whitelist specified. If the whitelist is the zero address, any contract is allowed. Note, this doesnt prevent transitive calls i.e. contract B can call contract A which is whitelisted in whitelist and the order would succeed.
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'whitelist': string;
    /**
     * The unique id of this quote request
     * @type {string}
     * @memberof MarketMakerQuoteRequestDto
     */
    'quoteRequestId': string;
}

