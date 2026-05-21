import { HandlerContext } from '../types';
interface CurrencyPrice {
    value: number;
    formatted: string;
}
interface Product {
    selling_price: number;
    selling_price_formatted: string;
    list_price?: number;
    list_price_formatted?: string;
    multi_currency_selling_price?: Record<string, CurrencyPrice>;
    multi_currency_list_price?: Record<string, CurrencyPrice>;
    [key: string]: unknown;
}
interface GetDisplayPriceParams {
    product: Product;
    priceField: 'selling_price' | 'list_price';
    currencyCode?: string;
}
export declare function getDisplayPriceHandler(params: GetDisplayPriceParams, context: HandlerContext): string;
export {};
