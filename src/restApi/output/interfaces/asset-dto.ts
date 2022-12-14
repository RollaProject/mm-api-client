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
 * @interface AssetDto
 */
export interface AssetDto {
    /**
     * The asset token address
     * @type {string}
     * @memberof AssetDto
     */
    'tokenAddress': string;
    /**
     * The name of the asset on chain (result of ERC20 name() method)
     * @type {string}
     * @memberof AssetDto
     */
    'name': string;
    /**
     * The symbol of the asset on chain (result of ERC20 symbol() method)
     * @type {string}
     * @memberof AssetDto
     */
    'symbol': string;
    /**
     * The name of the coin
     * @type {string}
     * @memberof AssetDto
     */
    'assetName': string;
    /**
     * The symbol of the coin
     * @type {string}
     * @memberof AssetDto
     */
    'assetSymbol': string;
    /**
     * The number of erc20 decimals of the asset (result of ERC20 symbol() method)
     * @type {number}
     * @memberof AssetDto
     */
    'decimals': number;
    /**
     * True if the asset is a stablecoin asset
     * @type {boolean}
     * @memberof AssetDto
     */
    'isStablecoin': boolean;
    /**
     * The address of the associated wrapped asset. If it\'s defined then this asset is a native token asset.
     * @type {string}
     * @memberof AssetDto
     */
    'wrappedAddress'?: string;
    /**
     * The ID of the asset on coingecko
     * @type {string}
     * @memberof AssetDto
     */
    'coinGeckoID'?: string;
}

