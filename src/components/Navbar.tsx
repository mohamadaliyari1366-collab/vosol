import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  Terminal,
  Upload,
  Moon,
  Sun,
  Menu,
  RotateCcw,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { JalaliDatePicker } from './JalaliDatePicker';
import { downloadBatScript } from '../utils/excelParser';
import { toFaDigits } from '../utils/jalaali';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUpload: () => void;
  onPrint: () => void;
  onToggleSidebar: () => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onResetFilters: () => void;
  regionsList: string[];
  activeSheetName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenUpload,
  onPrint,
  onToggleSidebar,
  selectedRegion,
  onRegionChange,
  selectedDate,
  onDateChange,
  onResetFilters,
  regionsList,
  activeSheetName
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Right side: Sidebar toggle and Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors lg:hidden"
              title="نمایش منو"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  داشبورد مدیریتی وصول مطالبات
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                  پایش، تحلیل و کنترل وصول بر مبنای فایل وصول مطالبات.xlsx
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Filters (Region and Jalali Date Picker) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Global Region Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1"
              >
                <option value="all" className="dark:bg-slate-800">
                  همه مناطق (کل امور)
                </option>
                {regionsList.map((r) => (
                  <option key={r} value={r} className="dark:bg-slate-800">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Jalali Date Picker */}
            <div className="w-40">
              <JalaliDatePicker
                value={selectedDate}
                onChange={onDateChange}
                placeholder="انتخاب تاریخ…"
              />
            </div>

            {/* Reset Filter Button */}
            {(selectedRegion !== 'all' || selectedDate) && (
              <button
                onClick={onResetFilters}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="پاک‌کردن فیلترها"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Left side: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Upload File */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
              title="بارگذاری فایل جدید وصول مطالبات.xlsx"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">بارگذاری اکسل</span>
            </button>

            {/* BAT Startup Script Download */}
            <button
              onClick={downloadBatScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 text-xs font-bold text-amber-900 dark:text-amber-300 transition-colors shadow-2xs"
              title="دانلود فایل اجرای تک‌کلیک ویندوز (start_dashboard.bat)"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">فایل BAT</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              title="چاپ گزارش کامل یا ذخیره PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ گزارش</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={darkMode ? 'حالت روز' : 'حالت شب'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
