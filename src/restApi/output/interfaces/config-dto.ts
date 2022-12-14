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
import { ConfigDtoContractAddresses } from './config-dto-contract-addresses';
// May contain unused imports in some cases
// @ts-ignore
import { ConfigDtoFees } from './config-dto-fees';

/**
 * 
 * @export
 * @interface ConfigDto
 */
export interface ConfigDto {
    /**
     * 
     * @type {ConfigDtoContractAddresses}
     * @memberof ConfigDto
     */
    'contractAddresses': ConfigDtoContractAddresses;
    /**
     * Current chain id for the Rolla Yield API
     * @type {number}
     * @memberof ConfigDto
     */
    'chainId': number;
    /**
     * Only allow premiums to be paid in certain assets
     * @type {Array<string>}
     * @memberof ConfigDto
     */
    'supportedMakerAssets': Array<string>;
    /**
     * 
     * @type {ConfigDtoFees}
     * @memberof ConfigDto
     */
    'fees': ConfigDtoFees;
}

