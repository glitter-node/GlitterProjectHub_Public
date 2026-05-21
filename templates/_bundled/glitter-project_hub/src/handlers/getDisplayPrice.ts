

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


export function getDisplayPriceHandler(
  params: GetDisplayPriceParams,
  context: HandlerContext
): string {
  const { product, priceField, currencyCode } = params;
  const preferredCurrency = currencyCode || context.getState('_global.preferredCurrency') || 'KRW';

  const multiCurrencyField = `multi_currency_${priceField}` as keyof Product;
  const multiCurrencyData = product[multiCurrencyField] as Record<string, CurrencyPrice> | undefined;

  if (multiCurrencyData && multiCurrencyData[preferredCurrency]) {
    return multiCurrencyData[preferredCurrency].formatted;
  }

  // 폴백: 기본 통화
  const formattedField = `${priceField}_formatted` as keyof Product;
  return (product[formattedField] as string) || String(product[priceField]);
}
