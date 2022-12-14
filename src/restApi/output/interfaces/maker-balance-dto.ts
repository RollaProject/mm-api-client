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



/**
 * 
 * @export
 * @interface MakerBalanceDto
 */
export interface MakerBalanceDto {
    /**
     * The address of the maker asset token
     * @type {string}
     * @memberof MakerBalanceDto
     */
    'tokenAddress': string;
    /**
     * Balance in whole units. e.g. 1000000000000000000 for a token with 18 decimals means 1
     * @type {string}
     * @memberof MakerBalanceDto
     */
    'balance': string;
    /**
     * The time we last fetched the balance
     * @type {string}
     * @memberof MakerBalanceDto
     */
    'lastUpdated': string;
}

