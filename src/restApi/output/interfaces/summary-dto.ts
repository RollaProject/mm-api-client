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
import { ActiveOptionDto } from './active-option-dto';
// May contain unused imports in some cases
// @ts-ignore
import { AssetDto } from './asset-dto';
// May contain unused imports in some cases
// @ts-ignore
import { QuoteDto } from './quote-dto';
// May contain unused imports in some cases
// @ts-ignore
import { SummaryDtoConfig } from './summary-dto-config';
// May contain unused imports in some cases
// @ts-ignore
import { SummaryDtoGas } from './summary-dto-gas';
// May contain unused imports in some cases
// @ts-ignore
import { SummaryDtoPrices } from './summary-dto-prices';

/**
 * 
 * @export
 * @interface SummaryDto
 */
export interface SummaryDto {
    /**
     * Assets summary
     * @type {Array<AssetDto>}
     * @memberof SummaryDto
     */
    'assets': Array<AssetDto>;
    /**
     * Options summary
     * @type {Array<ActiveOptionDto>}
     * @memberof SummaryDto
     */
    'options': Array<ActiveOptionDto>;
    /**
     * Quotes summary
     * @type {Array<QuoteDto>}
     * @memberof SummaryDto
     */
    'quotes': Array<QuoteDto>;
    /**
     * 
     * @type {SummaryDtoPrices}
     * @memberof SummaryDto
     */
    'prices': SummaryDtoPrices;
    /**
     * 
     * @type {SummaryDtoGas}
     * @memberof SummaryDto
     */
    'gas': SummaryDtoGas;
    /**
     * 
     * @type {SummaryDtoConfig}
     * @memberof SummaryDto
     */
    'config': SummaryDtoConfig;
}

