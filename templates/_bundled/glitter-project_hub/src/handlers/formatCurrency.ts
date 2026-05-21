

import { HandlerContext } from '../types';

interface FormatCurrencyParams {
  value: number;
  currencyCode?: string;
  locale?: string;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  decimals: number;
}


const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  KRW: { code: 'KRW', symbol: '₩', locale: 'ko-KR', decimals: 0 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', decimals: 0 },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', decimals: 2 },
};


export function formatCurrencyHandler(
  params: FormatCurrencyParams,
  context: HandlerContext
): string {
  const { value, currencyCode, locale: customLocale } = params;
  const currency = currencyCode || context.getState('_global.preferredCurrency') || 'KRW';

  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.KRW;
  const locale = customLocale || config.locale;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(value);
  } catch {
    
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    return `${config.symbol}${formatted}`;
  }
}

/**
 * 통화 심볼만 반환합니다.
 *
 * @param currencyCode - 통화 코드
 * @returns 통화 심볼
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_CONFIGS[currencyCode]?.symbol || currencyCode;
}
