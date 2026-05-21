import { HandlerContext } from '../types';
interface FormatCurrencyParams {
    value: number;
    currencyCode?: string;
    locale?: string;
}
export declare function formatCurrencyHandler(params: FormatCurrencyParams, context: HandlerContext): string;
/**
 * 통화 심볼만 반환합니다.
 *
 * @param currencyCode - 통화 코드
 * @returns 통화 심볼
 */
export declare function getCurrencySymbol(currencyCode: string): string;
export {};
