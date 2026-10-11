/**
 * داشبورد مدیریتی کنترل و تحلیل وصول مطالبات
 * بر مبنای سند نیازمندی‌های محصول (PRD) و فایل وصول مطالبات.xlsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  Layers,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Users,
  Cpu,
  RotateCcw,
  Building2,
  CalendarCheck,
  UserX,
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Terminal,
  Trophy
} from 'lucide-react';
import { SheetMeta, WorkbookAnalysis } from './types/dashboard';
import { CANONICAL_SHEETS, EXPECTED_SHEET_NAMES } from './data/canonicalDataset';
import {
  computeKPIs,
  calculateTopContractors,
  calculateTopReaders,
  calculateTopRegions
} from './utils/kpiEngine';
import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTarget } from './components/Sidebar';
import { KPISection } from './components/KPISection';
import { TopThreeRankings } from './components/TopThreeRankings';
import { OverviewCharts } from './components/Charts/OverviewCharts';
import { RawDataTable } from './components/RawDataTable';
import { FileUploadModal } from './components/FileUploadModal';
import { PrintHeader } from './components/PrintHeader';
import { downloadBatScript } from './utils/excelParser';
import { formatCurrencyAmount, formatPercentValue } from './utils/numberFormat';
import { toFaDigits } from './utils/jalaali';

const ALL_REGIONS = [
  'منطقه یک',
  'منطقه دو',
  'منطقه سه',
  'منطقه چهار',
  'منطقه پنج',
  'منطقه کارون',
  'منطقه باوی',
  'منطقه حمیدیه'
];

export default function App() {
  const [sheets, setSheets] = useState<Record<string, SheetMeta>>(CANONICAL_SHEETS);
  const [currentAnalysis, setCurrentAnalysis] = useState<WorkbookAnalysis>({
    fileName: 'وصول مطالبات.xlsx',
    fileSize: 450000,
    uploadDate: new Date().toISOString(),
    sheets: CANONICAL_SHEETS,
    detectedSheetsCount: 24,
    expectedSheetsCount: 24,
    missingSheets: [],
    warnings: []
  });

  const [currentTarget, setCurrentTarget] = useState<NavigationTarget>('overview');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRawSheetName, setSelectedRawSheetName] = useState<string>(
    'درصد تحقق وصول تکلیف شده تا 31'
  );

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Sync dark mode class with root html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived KPI and Ranking Calculations
  const kpis = useMemo(() => computeKPIs(sheets, selectedRegion), [sheets, selectedRegion]);
  const topContractors = useMemo(
    () => calculateTopContractors(sheets, selectedRegion),
    [sheets, selectedRegion]
  );
  const topReaders = useMemo(
    () => calculateTopReaders(sheets, selectedRegion),
    [sheets, selectedRegion]
  );
  const topRegions = useMemo(() => calculateTopRegions(sheets), [sheets]);

  // Target specific sheets
  const realizationSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'realization'),
    [sheets]
  );
  const debtNormalSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'debt_normal'),
    [sheets]
  );
  const debtDemandSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'debt_demand'),
    [sheets]
  );
  const debtTotalSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'debt_total'),
    [sheets]
  );
  const smartMetersSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'smart_meters'),
    [sheets]
  );
  const smart6mSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'smart_install_6m'),
    [sheets]
  );
  const smartDebtorsSheet = useMemo(
    () => Object.values(sheets).find((s) => s.category === 'smart_debtors'),
    [sheets]
  );

  // Sheets grouped for contractors and readers
  const contractorSheets = useMemo(
    () => Object.values(sheets).filter((s) => s.category === 'contractors'),
    [sheets]
  );
  const readerSheets = useMemo(
    () => Object.values(sheets).filter((s) => s.category === 'readers'),
    [sheets]
  );

  const handleApplyWorkbook = (analysis: WorkbookAnalysis) => {
    setSheets(analysis.sheets);
    setCurrentAnalysis(analysis);
    const firstSheetName = Object.keys(analysis.sheets)[0];
    if (firstSheetName) {
      setSelectedRawSheetName(firstSheetName);
    }
  };

  const handleResetToCanonical = () => {
    setSheets(CANONICAL_SHEETS);
    setCurrentAnalysis({
      fileName: 'وصول مطالبات.xlsx',
      fileSize: 450000,
      uploadDate: new Date().toISOString(),
      sheets: CANONICAL_SHEETS,
      detectedSheetsCount: 24,
      expectedSheetsCount: 24,
      missingSheets: [],
      warnings: []
    });
    setSelectedRawSheetName('درصد تحقق وصول تکلیف شده تا 31');
    setSelectedRegion('all');
    setSelectedDate('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Vazirmatn',sans-serif] text-right antialiased">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onPrint={handlePrint}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onResetFilters={() => {
          setSelectedRegion('all');
          setSelectedDate('');
        }}
        regionsList={ALL_REGIONS}
        activeSheetName={selectedRawSheetName}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <Sidebar
          currentTarget={currentTarget}
          onSelectTarget={setCurrentTarget}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sheets={sheets}
          selectedRawSheetName={selectedRawSheetName}
          onSelectRawSheet={setSelectedRawSheetName}
        />

        {/* Main Workspace */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Active Filter Announcement & Data Source Banner */}
          <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                منبع داده فعال: {currentAnalysis.fileName} ({toFaDigits(currentAnalysis.detectedSheetsCount)} شیت)
              </span>
              {selectedRegion !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-800">
                  فیلتر منطقه: {selectedRegion}
                </span>
              )}
              {selectedDate && (
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold border border-teal-200 dark:border-teal-800">
                  تاریخ مرجع: {selectedDate}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadBatScript}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold hover:bg-amber-100 transition-colors"
                title="دانلود فایل اجرای تک کلیک در محیط ویندوز"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-600" />
                دانلود start_dashboard.bat
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                چاپ این بخش
              </button>
            </div>
          </div>

          {/* VIEW 1: OVERVIEW DASHBOARD */}
          {currentTarget === 'overview' && (
            <div className="space-y-6">
              <PrintHeader
                title="نمای کلی مدیریتی کنترل و پایش وصول مطالبات"
                subTitle="خلاصه شاخص‌های کلیدی، ۳ رتبه برتر و نمودارهای تحلیلی"
                activeRegion={selectedRegion}
              />

              {/* KPI Cards */}
              <KPISection kpis={kpis} />

              {/* Top 3 Rankings (Contractors, Readers, Regions) */}
              <TopThreeRankings
                topContractors={topContractors}
                topReaders={topReaders}
                topRegions={topRegions}
                activeRegion={selectedRegion}
              />

              {/* Interactive Visualizations */}
              <OverviewCharts sheets={sheets} />

              {/* Total Debt Table Preview */}
              {debtTotalSheet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      جدول تفکیکی مانده کل مطالبات مناطق
                    </h3>
                    <button
                      onClick={() => setCurrentTarget('debt_total')}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      مشاهده صفحه کامل مطالبات ←
                    </button>
                  </div>
                  <RawDataTable sheet={debtTotalSheet} />
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: MONTHLY REALIZATION */}
          {currentTarget === 'realization' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش درصد تحقق وصول تکلیف شده"
                subTitle="مقایسه سهمیه مصوب وصول نقدی و ترانزیت و درصد عملکرد ماهانه"
                activeRegion={selectedRegion}
                currency={realizationSheet?.currency}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 block">عنوان گزارش</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">
                    درصد تحقق وصول تکلیف شده تا ۳۱
                  </strong>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 block">واحد مبالغ</span>
                  <strong className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {realizationSheet?.currency || 'میلیون ریال'}
                  </strong>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-500 block">دوره داده</span>
                  <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {realizationSheet?.datePeriod || 'شش ماهه اول ۱۴۰۳'}
                  </strong>
                </div>
              </div>

              {realizationSheet ? (
                <RawDataTable sheet={realizationSheet} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت تحقق وصول در فایل اکسل بارگذاری‌شده شناسایی نشد.
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: NORMAL DEBT */}
          {currentTarget === 'debt_normal' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش مانده مطالبات عادی به تفکیک مناطق"
                subTitle="مانده اول دوره، فروش، وصول نقدی، تهاتر و مانده نهایی"
                activeRegion={selectedRegion}
                currency={debtNormalSheet?.currency}
              />
              {debtNormalSheet ? (
                <RawDataTable sheet={debtNormalSheet} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت مانده مطالبات عادی در فایل اکسل شناسایی نشد.
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: DEMAND DEBT */}
          {currentTarget === 'debt_demand' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش مانده مطالبات دیماند به تفکیک مناطق"
                subTitle="پایش مطالبات انشعابات دیماند و صنعتی"
                activeRegion={selectedRegion}
                currency={debtDemandSheet?.currency}
              />
              {debtDemandSheet ? (
                <RawDataTable sheet={debtDemandSheet} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت مانده مطالبات دیماند در فایل اکسل شناسایی نشد.
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: TOTAL DEBT */}
          {currentTarget === 'debt_total' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش مانده کل مطالبات به تفکیک مناطق"
                subTitle="نمای تجمیعی مطالبات عادی و دیماند و رتبه‌بندی منطقه‌ای"
                activeRegion={selectedRegion}
                currency={debtTotalSheet?.currency}
              />

              {/* Top 3 regions card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    ۳ منطقه برتر از لحاظ بیشترین مبلغ وصول کل
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {topRegions.slice(0, 3).map((r, i) => (
                    <div
                      key={`top-reg-${i}`}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {r.name}
                        </strong>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          رتبه {toFaDigits(r.rank)}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white my-1">
                        {formatCurrencyAmount(r.collectedAmount, r.currency)}
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>مانده: {formatCurrencyAmount(r.balanceAmount)}</span>
                        <span>وصول به فروش: {formatPercentValue(r.collectionToSalesPercent)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {debtTotalSheet && <RawDataTable sheet={debtTotalSheet} />}
            </div>
          )}

          {/* VIEW 6: CONTRACTORS PERFORMANCE */}
          {currentTarget === 'contractors' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش عملکرد پیمانکاران وصول مطالبات"
                subTitle="رتبه‌بندی پیمانکاران بر اساس درصد عملکرد، مبالغ وصول و دستورکار"
                activeRegion={selectedRegion}
              />

              {/* Top Contractors Ranking Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      جدول جامع رتبه‌بندی کلیه پیمانکاران (۸ منطقه)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    مجموع: {toFaDigits(topContractors.length)} پیمانکار
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2.5 px-3 w-16 text-center">رتبه</th>
                        <th className="py-2.5 px-3">نام پیمانکار</th>
                        <th className="py-2.5 px-3">منطقه</th>
                        <th className="py-2.5 px-3 text-center">درصد عملکرد</th>
                        <th className="py-2.5 px-3">مبلغ وصولی</th>
                        <th className="py-2.5 px-3">مبلغ دستورکار تحویلی</th>
                        <th className="py-2.5 px-3 text-center">تعداد قرارداد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topContractors.map((c, i) => (
                        <tr
                          key={`c-row-${i}`}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            c.rank <= 3 ? 'bg-amber-50/40 dark:bg-amber-950/10 font-medium' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-black">
                            {c.rank === 1 && '🥇 '}
                            {c.rank === 2 && '🥈 '}
                            {c.rank === 3 && '🥉 '}
                            {toFaDigits(c.rank)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {c.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{c.region}</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                            {c.rawPerformanceStr}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrencyAmount(c.collectedAmount, c.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {formatCurrencyAmount(c.workOrderAmount, c.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {toFaDigits(c.contractsCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Regional contractor sheets tables */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                  جداول تفکیکی شیت‌های پیمانکاران مناطق
                </h4>
                {contractorSheets.map((s) => (
                  <RawDataTable key={s.sheetName} sheet={s} />
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: METER READERS */}
          {currentTarget === 'readers' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش عملکرد مأموران قرائت و توزیع اخطاریه"
                subTitle="رتبه‌بندی بر مبنای درصد وصول، تعداد دستورکار و مبالغ وصولی"
                activeRegion={selectedRegion}
              />

              {/* Top Readers Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      جدول جامع رتبه‌بندی مأموران قرائت
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    مجموع: {toFaDigits(topReaders.length)} مأمور
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2.5 px-3 w-16 text-center">رتبه</th>
                        <th className="py-2.5 px-3">نام مأمور</th>
                        <th className="py-2.5 px-3">منطقه/امور</th>
                        <th className="py-2.5 px-3 text-center">درصد وصول</th>
                        <th className="py-2.5 px-3">مبلغ وصول</th>
                        <th className="py-2.5 px-3">مبلغ مطالبات</th>
                        <th className="py-2.5 px-3 text-center">تعداد دستورکار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topReaders.map((r, i) => (
                        <tr
                          key={`r-row-${i}`}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            r.rank <= 3 ? 'bg-cyan-50/40 dark:bg-cyan-950/10 font-medium' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-black">
                            {r.rank === 1 && '🥇 '}
                            {r.rank === 2 && '🥈 '}
                            {r.rank === 3 && '🥉 '}
                            {toFaDigits(r.rank)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {r.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{r.region}</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-cyan-600 dark:text-cyan-400">
                            {r.rawCollectionStr}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrencyAmount(r.collectedAmount, r.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {formatCurrencyAmount(r.claimsAmount, r.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {toFaDigits(r.workOrderCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Readers Sheets */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">
                  شیت‌های جزئی مأموران قرائت
                </h4>
                {readerSheets.map((s) => (
                  <RawDataTable key={s.sheetName} sheet={s} />
                ))}
              </div>
            </div>
          )}

          {/* VIEW 8: SMART METERS PENETRATION */}
          {currentTarget === 'smart_meters' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش وضعیت کنتورهای هوشمند به تفکیک منطقه"
                subTitle="تعداد کل مشترکین، کنتورهای منصوبه و درصد هوشمندسازی"
                activeRegion={selectedRegion}
                currency={smartMetersSheet?.currency}
              />
              {smartMetersSheet ? (
                <RawDataTable sheet={smartMetersSheet} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت کنتورهای هوشمند در فایل اکسل شناسایی نشد.
                </div>
              )}
            </div>
          )}

          {/* VIEW 9: 6-MONTH SMART INSTALLATION */}
          {currentTarget === 'smart_6m' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش نصب کنتور هوشمند شش‌ماهه"
                subTitle="نصب جدید تکفاز و سه فاز و تعویض کنتورهای معیوب"
                activeRegion={selectedRegion}
                currency={smart6mSheet?.currency}
              />
              {smart6mSheet ? (
                <RawDataTable sheet={smart6mSheet} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت نصب کنتور هوشمند شش‌ماهه در فایل اکسل شناسایی نشد.
                </div>
              )}
            </div>
          )}

          {/* VIEW 10: DEBTOR SMART INSTALLATION */}
          {currentTarget === 'smart_debtors' && (
            <div className="space-y-6">
              <PrintHeader
                title="گزارش نصب هوشمند مشترکین بدهکار (یک‌ماهه)"
                subTitle="پایش اقدامات انجام‌شده برای مشترکین بدهکار خانگی و سایر مصارف"
                activeRegion={selectedRegion}
                currency={smartDebtorsSheet?.currency}
              />
              {smartDebtorsSheet ? (
                <RawDataTable sheet={smartDebtorsSheet} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت نصب هوشمند مشترکین بدهکار در فایل اکسل شناسایی نشد.
                </div>
              )}
            </div>
          )}

          {/* VIEW 11: ALL RAW SHEETS (DYNAMIC AND CUSTOM) */}
          {currentTarget === 'raw_tables' && (
            <div className="space-y-6">
              <PrintHeader
                title={`جدول خام داده‌های شیت: ${selectedRawSheetName}`}
                subTitle="مشاهده کامل ستون‌ها، جست‌وجو، فیلتر، صفحه‌بندی و استخراج اکسل"
                activeRegion={selectedRegion}
              />

              {/* Sheet selector tabs */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs no-print">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      انتخاب شیت از میان تمام {toFaDigits(Object.keys(sheets).length)} شیت موجود در فایل
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    شیتهای جدید افزوده شده نیز خودکار شناسایی می‌شوند
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  {Object.keys(sheets).map((sName) => (
                    <button
                      key={sName}
                      onClick={() => setSelectedRawSheetName(sName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedRawSheetName === sName
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of selected raw sheet */}
              {sheets[selectedRawSheetName] ? (
                <RawDataTable sheet={sheets[selectedRawSheetName]} />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  شیت مورد نظر یافت نشد. لطفاً از لیست بالا شیتی را انتخاب فرمایید.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyWorkbook={handleApplyWorkbook}
        onResetToCanonical={handleResetToCanonical}
        currentAnalysis={currentAnalysis}
      />
    </div>
  );
}
