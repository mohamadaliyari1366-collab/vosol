/**
 * Excel Parser & Exporter using SheetJS
 * Client-side only with complete privacy and zero server transmission
 */

import * as XLSX from 'xlsx';
import { SheetCategory, SheetMeta, SheetRow, WorkbookAnalysis } from '../types/dashboard';
import { EXPECTED_SHEET_NAMES, CANONICAL_SHEETS } from '../data/canonicalDataset';
import { isSummaryRow } from './numberFormat';

/**
 * Normalizes Persian and Arabic text for reliable matching
 */
export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/\u200C/g, ' ') // zero-width non-joiner to space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect sheet category and region
 */
export function categorizeSheet(sheetName: string): { category: SheetCategory; region?: string } {
  const norm = normalizePersianText(sheetName);

  if (norm.includes('درصد تحقق وصول')) {
    return { category: 'realization' };
  }
  if (norm.includes('مانده مطالبات عادی')) {
    return { category: 'debt_normal' };
  }
  if (norm.includes('مانده مطالبات دیماند')) {
    return { category: 'debt_demand' };
  }
  if (norm.includes('مانده مطالبات کل') || norm.includes('مانده مطالبات کـــل')) {
    return { category: 'debt_total' };
  }

  // Contractors
  if (norm.includes('عملکرد پیمانکاران')) {
    let region = '';
    if (norm.includes('یک') || norm.includes('1')) region = 'منطقه یک';
    else if (norm.includes('دو') || norm.includes('2')) region = 'منطقه دو';
    else if (norm.includes('سه') || norm.includes('3')) region = 'منطقه سه';
    else if (norm.includes('چهار') || norm.includes('4')) region = 'منطقه چهار';
    else if (norm.includes('پنج') || norm.includes('5')) region = 'منطقه پنج';
    else if (norm.includes('کارون')) region = 'منطقه کارون';
    else if (norm.includes('باوی')) region = 'منطقه باوی';
    else if (norm.includes('حمیدیه')) region = 'منطقه حمیدیه';
    return { category: 'contractors', region };
  }

  // Meter readers
  if (norm.includes('مامورین قرائت') || norm.includes('مأمورین قرائت')) {
    let region = '';
    if (norm.includes('امور') || norm.includes('ستاد')) region = 'ستاد امور';
    else if (norm.includes('یک') || norm.includes('1')) region = 'منطقه یک';
    else if (norm.includes('دو') || norm.includes('2')) region = 'منطقه دو';
    else if (norm.includes('سه') || norm.includes('3')) region = 'منطقه سه';
    else if (norm.includes('چهار') || norm.includes('4')) region = 'منطقه چهار';
    else if (norm.includes('پنج') || norm.includes('5')) region = 'منطقه پنج';
    else if (norm.includes('کارون')) region = 'منطقه کارون';
    else if (norm.includes('باوی')) region = 'منطقه باوی';
    else if (norm.includes('حمیدیه')) region = 'منطقه حمیدیه';
    return { category: 'readers', region };
  }

  // Smart meters
  if (norm.includes('کنتورهای هوشمند به تفکیک منطقه')) {
    return { category: 'smart_meters' };
  }
  if (norm.includes('نصب کنتورهوشمند') && norm.includes('شش ماهه')) {
    return { category: 'smart_install_6m' };
  }
  if (norm.includes('مشترکین بدهکار') || norm.includes('بدهکاریک ماه')) {
    return { category: 'smart_debtors' };
  }

  return { category: 'custom' };
}

/**
 * Detect currency from headers or sheet name
 */
export function detectCurrency(headers: string[], sheetName: string): string {
  const allText = `${sheetName} ${headers.join(' ')}`;
  if (allText.includes('میلیارد ریال')) return 'میلیارد ریال';
  if (allText.includes('میلیون ریال')) return 'میلیون ریال';
  if (allText.includes('تومان')) return 'تومان';
  if (allText.includes('دستگاه') || allText.includes('کنتور')) return 'دستگاه';
  if (allText.includes('ریال')) return 'ریال';
  return 'میلیون ریال';
}

/**
 * Parse an Excel file ArrayBuffer into structured sheets
 */
export function parseExcelWorkbook(
  arrayBuffer: ArrayBuffer,
  fileName: string
): WorkbookAnalysis {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheets: Record<string, SheetMeta> = {};
  const warnings: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Convert sheet to json array of objects
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false
    });

    if (!jsonData || jsonData.length === 0) {
      warnings.push(`شیت «${sheetName}» فاقد داده یا ردیف‌های معتبر است.`);
      continue;
    }

    // Extract headers from first non-empty object
    const headers = Object.keys(jsonData[0] || {}).filter((k) => !k.startsWith('__'));
    const { category, region } = categorizeSheet(sheetName);
    const currency = detectCurrency(headers, sheetName);

    const normalRows: SheetRow[] = [];
    const summaryRows: SheetRow[] = [];

    jsonData.forEach((row, idx) => {
      const isSummary = isSummaryRow(row);
      const formattedRow: SheetRow = {
        ...row,
        __rowNum: idx + 1,
        __isSummary: isSummary
      };

      if (isSummary) {
        summaryRows.push(formattedRow);
      } else {
        normalRows.push(formattedRow);
      }
    });

    sheets[sheetName] = {
      sheetName,
      originalName: sheetName,
      category,
      region,
      headers,
      rows: normalRows,
      summaryRows,
      rowCount: jsonData.length,
      columnCount: headers.length,
      currency
    };
  }

  // Compare with expected sheets
  const detectedNames = Object.keys(sheets).map((s) => normalizePersianText(s));
  const missingSheets: string[] = [];

  for (const exp of EXPECTED_SHEET_NAMES) {
    const normExp = normalizePersianText(exp);
    const found = detectedNames.some((d) => d.includes(normExp) || normExp.includes(d));
    if (!found) {
      missingSheets.push(exp);
    }
  }

  return {
    fileName,
    fileSize: arrayBuffer.byteLength,
    uploadDate: new Date().toISOString(),
    sheets,
    detectedSheetsCount: Object.keys(sheets).length,
    expectedSheetsCount: EXPECTED_SHEET_NAMES.length,
    missingSheets,
    warnings
  };
}

/**
 * Export table data to an Excel file (.xlsx)
 */
export function exportTableToExcel(
  title: string,
  headers: string[],
  rows: Record<string, any>[]
) {
  // Format clean data without internal properties
  const cleanData = rows.map((r) => {
    const obj: Record<string, any> = {};
    for (const h of headers) {
      obj[h] = r[h] !== undefined && r[h] !== null ? r[h] : '';
    }
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(cleanData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));

  XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Downloads the starter BAT file
 */
export function downloadBatScript() {
  const batContent = `@echo off
chcp 65001 >nul
title سامانه داشبورد مدیریتی وصول مطالبات
cls
echo ===================================================================
echo     سامانه داشبورد مدیریتی کنترل و تحلیل وصول مطالبات
echo ===================================================================
echo.
echo در حال بررسی پیش‌نیازها و راه‌اندازی سرور محلی...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [خطا] نرم‌افزار Node.js روی سیستم شما نصب نیست.
    echo لطفاً ابتدا Node.js را از https://nodejs.org نصب کنید.
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo پوشه کتابخانه‌ها یافت نشد. در حال نصب خودکار وابستگی‌ها (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [خطا] نصب وابستگی‌ها با مشکل مواجه شد.
        pause
        exit /b 1
    )
)

echo در حال اجرای سامانه بر روی پورت 3000...
echo مرورگر شما تا چند ثانیه دیگر به صورت خودکار باز خواهد شد.
echo آدرس سامانه: http://localhost:3000
echo برای متوقف کردن سرور، کلیدهای Ctrl+C را فشار دهید.
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

call npm run dev

pause
`;

  const blob = new Blob([batContent], { type: 'application/x-bat' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'start_dashboard.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
