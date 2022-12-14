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
 * @interface StatsDto
 */
export interface StatsDto {
    /**
     * entry timestamp
     * @type {string}
     * @memberof StatsDto
     */
    'timestamp': string;
    /**
     * the key of the stats entry
     * @type {string}
     * @memberof StatsDto
     */
    'data': string;
    /**
     * the stats data associated with the key
     * @type {string}
     * @memberof StatsDto
     */
    'key': string;
}

