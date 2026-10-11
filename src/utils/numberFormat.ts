/**
 * Strict formatting and normalization utilities
 * Adheres strictly to the PRD guidelines:
 * - No guessing
 * - Percentages never double-multiplied by 100
 * - Unit preserved (Rial/Toman)
 * - Empty/invalid shown as "داده موجود نیست"
 * - Comma-separated Persian numerals
 */

import { toFaDigits } from './jalaali';

/**
 * Format raw numbers with Persian digits and 3-digit comma separators
 */
export function formatCurrencyAmount(
  val: number | string | null | undefined,
  currencyUnit?: string
): string {
  if (val === null || val === undefined || val === '') {
    return 'داده موجود نیست';
  }

  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, '').trim());
  if (isNaN(num)) {
    return String(val);
  }

  // Round to 2 decimal places if has decimals, otherwise whole integer
  const parts = num.toLocaleString('en-US', { maximumFractionDigits: 2 }).split('.');
  const integerPart = toFaDigits(parts[0]);
  const decimalPart = parts[1] ? `٫${toFaDigits(parts[1])}` : '';

  const formattedNum = `${integerPart}${decimalPart}`;
  return currencyUnit ? `${formattedNum} ${currencyUnit}` : formattedNum;
}

/**
 * Parse and format percentage values strictly without double multiplying
 */
export function formatPercentValue(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') {
    return 'داده موجود نیست';
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.includes('%') || trimmed.includes('٪')) {
      return toFaDigits(trimmed);
    }
  }

  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[%٪,]/g, '').trim());
  if (isNaN(num)) {
    return String(val);
  }

  // If the cell was stored as decimal (e.g. 0.854), convert to percent representation 85.4
  // If it was already stored as 85.4, keep 85.4
  let percentValue = num;
  if (num > 0 && num <= 1) {
    percentValue = num * 100;
  }

  const rounded = Math.round(percentValue * 10) / 10;
  return `${toFaDigits(rounded.toFixed(1).replace('.0', ''))}٪`;
}

/**
 * Extracts numeric value for calculation
 */
export function extractNumeric(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  const clean = String(val)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[,،%٪\s]/g, '')
    .trim();

  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

/**
 * Normalize percentage to a 0-100 scale for comparison and sorting
 */
export function normalizePercentForSort(val: any): number {
  const num = extractNumeric(val);
  if (num === null) return -999999;
  if (num > 0 && num <= 1) return num * 100;
  return num;
}

/**
 * Check if a row is a summary / total row that should be excluded from aggregations
 */
export function isSummaryRow(row: Record<string, any>): boolean {
  if (row.__isSummary) return true;
  const values = Object.values(row);
  for (const v of values) {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (
        trimmed === 'جمع' ||
        trimmed === 'مجموع' ||
        trimmed === 'جمع کل' ||
        trimmed === 'مجموع کل' ||
        trimmed === 'TOTAL' ||
        trimmed === 'Total' ||
        trimmed.startsWith('جمع کل') ||
        trimmed.startsWith('مجموع')
      ) {
        return true;
      }
    }
  }
  return false;
}
