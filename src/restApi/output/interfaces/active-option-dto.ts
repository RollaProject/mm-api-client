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
import { OptionDtoOptionAttributes } from './option-dto-option-attributes';

/**
 * 
 * @export
 * @interface ActiveOptionDto
 */
export interface ActiveOptionDto {
    /**
     * Unique option identifier. Address of option smart contract on chain
     * @type {string}
     * @memberof ActiveOptionDto
     */
    'optionAddress': string;
    /**
     * The ID of the CollateralToken associated with the option
     * @type {string}
     * @memberof ActiveOptionDto
     */
    'collateralTokenId': string;
    /**
     * 
     * @type {OptionDtoOptionAttributes}
     * @memberof ActiveOptionDto
     */
    'optionAttributes': OptionDtoOptionAttributes;
    /**
     * Full name of the option token i.e. what the on-chain name function returns
     * @type {string}
     * @memberof ActiveOptionDto
     */
    'optionName': string;
    /**
     * Symbol of the option token i.e. what the on-chain symbol function returns
     * @type {string}
     * @memberof ActiveOptionDto
     */
    'optionSymbol': string;
    /**
     * Whether or not the option exists or not. This doesn\'t have to be true for a taker to get a quote and take the quote as if it doesn\'t exist the option will be created on the fly when the quote is taken on chain.
     * @type {boolean}
     * @memberof ActiveOptionDto
     */
    'isOptionCreatedOnChain': boolean;
}
