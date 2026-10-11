import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Search,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { SheetMeta, SheetRow } from '../types/dashboard';
import { exportTableToExcel } from '../utils/excelParser';
import {
  formatCurrencyAmount,
  formatPercentValue,
  extractNumeric,
  isSummaryRow
} from '../utils/numberFormat';
import { toFaDigits } from '../utils/jalaali';

interface RawDataTableProps {
  sheet: SheetMeta;
}

const ITEMS_PER_PAGE = 15;

export const RawDataTable: React.FC<RawDataTableProps> = ({ sheet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Combine rows and summary rows for display, but keep them distinct
  const allRows = useMemo(() => {
    return [...sheet.rows, ...sheet.summaryRows];
  }, [sheet]);

  // Filtering
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return allRows;
    const term = searchTerm.trim().toLowerCase();

    return allRows.filter((row) => {
      return Object.entries(row).some(([key, val]) => {
        if (key.startsWith('__')) return false;
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [allRows, searchTerm]);

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortField) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      // Always keep summary rows at the bottom
      if (a.__isSummary && !b.__isSummary) return 1;
      if (!a.__isSummary && b.__isSummary) return -1;

      const valA = a[sortField];
      const valB = b[sortField];

      const numA = extractNumeric(valA);
      const numB = extractNumeric(valB);

      if (numA !== null && numB !== null) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA || '');
      const strB = String(valB || '');
      return sortOrder === 'asc'
        ? strA.localeCompare(strB, 'fa')
        : strB.localeCompare(strA, 'fa');
    });
  }, [filteredRows, sortField, sortOrder]);

  // Pagination (PRD: default 15 records per page)
  const totalPages = Math.ceil(sortedRows.length / ITEMS_PER_PAGE) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedRows.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedRows, currentPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportTableToExcel(sheet.sheetName, sheet.headers, sortedRows);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderCellContent = (col: string, val: any, isSummary: boolean) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-400 text-xs italic">داده موجود نیست</span>;
    }

    const colLower = col.toLowerCase();
    const isPercent =
      colLower.includes('درصد') ||
      colLower.includes('تحقق') ||
      (typeof val === 'string' && (val.includes('%') || val.includes('٪')));

    if (isPercent) {
      return (
        <span
          className={`font-bold ${
            isSummary ? 'text-blue-900 dark:text-blue-200' : 'text-blue-700 dark:text-blue-300'
          }`}
        >
          {formatPercentValue(val)}
        </span>
      );
    }

    const isAmount =
      colLower.includes('مبلغ') ||
      colLower.includes('وصول') ||
      colLower.includes('فروش') ||
      colLower.includes('مانده') ||
      colLower.includes('سهمیه') ||
      colLower.includes('مطالبات');

    if (isAmount && typeof val === 'number') {
      return (
        <span
          className={`font-semibold ${
            isSummary ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {formatCurrencyAmount(val)}
        </span>
      );
    }

    if (typeof val === 'number') {
      return <span>{toFaDigits(val.toLocaleString())}</span>;
    }

    return <span>{toFaDigits(String(val))}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {sheet.sheetName}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{toFaDigits(sheet.rowCount)} ردیف</span>
              <span>•</span>
              <span>{toFaDigits(sheet.columnCount)} ستون</span>
              {sheet.currency && (
                <>
                  <span>•</span>
                  <span>واحد: {sheet.currency}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions & Search */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="جست‌وجو در داده‌ها…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="خروجی فایل اکسل با مقادیر اصلی"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            خروجی Excel
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="چاپ بهینه‌شده جدول"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            چاپ جدول
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-3 w-12 text-center border-l border-slate-200 dark:border-slate-700">
                ردیف
              </th>
              {sheet.headers.map((h) => (
                <th
                  key={h}
                  onClick={() => handleSort(h)}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors border-l border-slate-200 dark:border-slate-700 select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>{h}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-70" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={sheet.headers.length + 1}
                  className="py-12 text-center text-slate-400 text-xs"
                >
                  دادهای برای فیلتر یا جست‌وجوی انجام‌شده یافت نشد.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const isSummary = !!row.__isSummary;
                return (
                  <tr
                    key={`r-${idx}`}
                    className={`transition-colors ${
                      isSummary
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 font-bold border-t-2 border-b-2 border-amber-300 dark:border-amber-700/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium border-l border-slate-100 dark:border-slate-800 whitespace-nowrap">
                      {isSummary ? (
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300">
                          مجموع
                        </span>
                      ) : (
                        toFaDigits((currentPage - 1) * ITEMS_PER_PAGE + idx + 1)
                      )}
                    </td>
                    {sheet.headers.map((h) => (
                      <td
                        key={h}
                        className="py-2.5 px-3 text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-800 whitespace-nowrap"
                      >
                        {renderCellContent(h, row[h], isSummary)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Summary Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/20 no-print">
        <div className="text-slate-500 dark:text-slate-400">
          نمایش{' '}
          <strong className="text-slate-900 dark:text-white">
            {toFaDigits(paginatedRows.length)}
          </strong>{' '}
          رکورد از مجموع{' '}
          <strong className="text-slate-900 dark:text-white">
            {toFaDigits(sortedRows.length)}
          </strong>{' '}
          رکورد منطبق (صفحه {toFaDigits(currentPage)} از {toFaDigits(totalPages)})
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="صفحه قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-200">
            {toFaDigits(currentPage)} / {toFaDigits(totalPages)}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="صفحه بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
