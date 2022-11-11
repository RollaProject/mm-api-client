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
 * @interface QuoteMetaDataDto
 */
export interface QuoteMetaDataDto {
    /**
     * The database time of when the quote was seen
     * @type {string}
     * @memberof QuoteMetaDataDto
     */
    'createdDate': string;
    /**
     * The hash of the order supplied (unique identifier)
     * @type {string}
     * @memberof QuoteMetaDataDto
     */
    'orderHash': string;
    /**
     * A unique randomly generated ID which identifies the request to our quote service. This can be used to paginate through our API responses.
     * @type {string}
     * @memberof QuoteMetaDataDto
     */
    'quoteRequestId': string;
    /**
     * The address of the option that a quote was provided for
     * @type {string}
     * @memberof QuoteMetaDataDto
     */
    'optionAddress': string;
}

