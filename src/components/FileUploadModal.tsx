import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { WorkbookAnalysis } from '../types/dashboard';
import { parseExcelWorkbook } from '../utils/excelParser';
import { CANONICAL_SHEETS } from '../data/canonicalDataset';
import { toFaDigits } from '../utils/jalaali';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWorkbook: (analysis: WorkbookAnalysis) => void;
  onResetToCanonical: () => void;
  currentAnalysis: WorkbookAnalysis | null;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyWorkbook,
  onResetToCanonical,
  currentAnalysis
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tempAnalysis, setTempAnalysis] = useState<WorkbookAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('لطفاً یک فایل معتبر اکسل با پسوند .xlsx یا .xls انتخاب فرمایید.');
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg(null);
      const buffer = await file.arrayBuffer();
      const analysis = parseExcelWorkbook(buffer, file.name);
      setTempAnalysis(analysis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`خطا در بازخوانی فایل اکسل: ${err?.message || 'فایل آسیب‌دیده است'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSampleWorkbook = () => {
    const wb = XLSX.utils.book_new();
    for (const [sName, sData] of Object.entries(CANONICAL_SHEETS)) {
      const cleanRows = [...sData.rows, ...sData.summaryRows].map((r) => {
        const obj: Record<string, any> = {};
        for (const h of sData.headers) {
          obj[h] = r[h] !== undefined ? r[h] : '';
        }
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(cleanRows);
      XLSX.utils.book_append_sheet(wb, ws, sName.slice(0, 31));
    }
    XLSX.writeFile(wb, 'وصول_مطالبات_نمونه_۲۴_شیت.xlsx');
  };

  const activeData = tempAnalysis || currentAnalysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                بارگذاری و پایش فایل اکسل «وصول مطالبات»
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پردازش کاملاً امن در مرورگر، بدون ارسال به سرور
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-2.5">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  فایل اکسل خود (.xlsx) را اینجا رها کنید، یا کلیک نمایید
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  پشتیبانی از هر ۲۴ شیت استاندارد مصوب وصول مطالبات
                </p>
              </div>
              {analyzing && (
                <div className="text-xs text-blue-600 font-bold animate-pulse mt-2">
                  در حال بازخوانی ساختار شیت‌ها و صحه‌گذاری ستون‌ها…
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Analysis Results */}
          {activeData && (
            <div className="space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>وضعیت شناسایی شیت‌های فایل ({activeData.fileName})</span>
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  {toFaDigits(activeData.detectedSheetsCount)} شیت شناسایی شد
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">تعداد شیت‌های استاندارد:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">
                    {toFaDigits(24)} شیت
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">شیت‌های منطبق:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    {toFaDigits(24 - activeData.missingSheets.length)} شیت
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">شیت‌های نامنطبق/مفقود:</span>
                  <strong
                    className={`font-extrabold text-sm ${
                      activeData.missingSheets.length > 0 ? 'text-amber-600' : 'text-slate-600'
                    }`}
                  >
                    {toFaDigits(activeData.missingSheets.length)}
                  </strong>
                </div>
              </div>

              {activeData.missingSheets.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                  <p className="font-bold mb-1">شیت‌های احتمالی خارج از الگو یا تغییرنام‌یافته:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {activeData.missingSheets.slice(0, 5).map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions / Download Sample */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleDownloadSampleWorkbook}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود فایل اکسل نمونه استاندارد ۲۴ شیتی
            </button>

            <button
              onClick={() => {
                onResetToCanonical();
                setTempAnalysis(null);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              بازنشانی به داده‌های اصلی فایل وصول مطالبات
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            انصراف
          </button>
          {tempAnalysis && (
            <button
              onClick={() => {
                onApplyWorkbook(tempAnalysis);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              اعمال فایل جدید و به‌روزرسانی داشبورد
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
