import React, { useState } from 'react';
import { BarChart3, TrendingUp, Cpu, PieChart, Layers, CheckCircle } from 'lucide-react';
import { SheetMeta } from '../../types/dashboard';
import { formatCurrencyAmount, formatPercentValue, extractNumeric } from '../../utils/numberFormat';
import { toFaDigits } from '../../utils/jalaali';

interface OverviewChartsProps {
  sheets: Record<string, SheetMeta>;
}

export const OverviewCharts: React.FC<OverviewChartsProps> = ({ sheets }) => {
  const [activeTab, setActiveTab] = useState<'realization' | 'regions' | 'smart' | 'debtors'>('realization');

  // 1. Data for Realization Chart
  const realSheet = Object.values(sheets).find((s) => s.category === 'realization');
  const realizationData = (realSheet?.rows || []).map((r) => {
    const month = String(r['ماه'] || '');
    const quota = extractNumeric(r['سهمیه مصوب وصول'] || r['سهمیه مصوب']) || 0;
    const collected = extractNumeric(r['وصول نقدی و ترانزیت'] || r['وصول']) || 0;
    const perf = extractNumeric(r['درصد تحقق عملکرد'] || r['درصد']) || 0;
    return {
      month,
      quota,
      collected,
      perf: perf > 1 ? perf : perf * 100
    };
  });

  const maxRealVal = Math.max(...realizationData.map((d) => Math.max(d.quota, d.collected)), 1);

  // 2. Data for Regional Total Collection & Remaining Balance
  const totalDebtSheet = Object.values(sheets).find((s) => s.category === 'debt_total');
  const regionalData = (totalDebtSheet?.rows || []).map((r) => {
    const name = String(r['نام منطقه'] || r['منطقه'] || '');
    const collected = extractNumeric(r['مبلغ وصول کل'] || r['وصول']) || 0;
    const balance = extractNumeric(r['مانده تا تاریخ گزارش کل'] || r['مانده']) || 0;
    const salesRatio = extractNumeric(r['درصد وصول به فروش کل'] || r['درصد']) || 0;
    return {
      name,
      collected,
      balance,
      salesRatio: salesRatio > 1 ? salesRatio : salesRatio * 100
    };
  });

  const maxRegionalVal = Math.max(...regionalData.map((d) => Math.max(d.collected, d.balance)), 1);

  // 3. Data for Smart Meters
  const smartSheet = Object.values(sheets).find((s) => s.category === 'smart_meters');
  const smartData = (smartSheet?.rows || []).map((r) => {
    const name = String(r['نام منطقه'] || '');
    const totalSubs = extractNumeric(r['تعداد کل مشترکین']) || 0;
    const smartMeters = extractNumeric(r['تعداد کنتور هوشمند منصوبه']) || 0;
    const ratio = extractNumeric(r['درصد هوشمندسازی']) || 0;
    return {
      name,
      totalSubs,
      smartMeters,
      ratio: ratio > 1 ? ratio : ratio * 100
    };
  });

  // 4. Data for Smart Debtor Installations
  const debtorSheet = Object.values(sheets).find((s) => s.category === 'smart_debtors');
  const debtorData = (debtorSheet?.rows || []).map((r) => {
    const name = String(r['نام منطقه'] || '');
    const totalTarget = extractNumeric(r['جمع کل بدهکاران هدف']) || 0;
    const totalDone = extractNumeric(r['جمع کل انجام شده']) || 0;
    const actionPct = extractNumeric(r['درصد اقدام']) || 0;
    return {
      name,
      totalTarget,
      totalDone,
      actionPct: actionPct > 1 ? actionPct : actionPct * 100
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs break-inside-avoid">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              نمودارها و تحلیل‌های بصری شاخص‌ها
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مطابق بند ۶ PRD: مقایسه سهمیه، وصول، مانده مطالبات و ضریب هوشمندسازی
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold no-print">
          <button
            onClick={() => setActiveTab('realization')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'realization'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            تحقق وصول ماهانه
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'regions'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            وصول و مانده به تفکیک منطقه
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'smart'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            کنتورهای هوشمند
          </button>
          <button
            onClick={() => setActiveTab('debtors')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'debtors'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            مشترکین بدهکار
          </button>
        </div>
      </div>

      <div className="pt-6">
        {/* TAB 1: Realization Chart */}
        {activeTab === 'realization' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
              <span>مقایسه سهمیه مصوب وصول با وصول نقدی و ترانزیت (واحد: {realSheet?.currency || 'میلیون ریال'})</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block" />
                  سهمیه مصوب
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                  وصول محقق‌شده
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {realizationData.map((item, idx) => (
                <div key={`real-${idx}`} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.month}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        سهمیه: {formatCurrencyAmount(item.quota)} | وصول: {formatCurrencyAmount(item.collected)}
                      </span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40">
                        {toFaDigits(item.perf.toFixed(1))}٪
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="grid grid-cols-1 gap-1">
                    {/* Quota bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-slate-400/80 dark:bg-slate-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.quota / maxRealVal) * 100)}%` }}
                      />
                    </div>
                    {/* Collected bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.collected / maxRealVal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Regional Debt & Collection */}
        {activeTab === 'regions' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
              <span>مقایسه مبلغ کل وصول و مانده تا تاریخ گزارش (واحد: {totalDebtSheet?.currency || 'میلیون ریال'})</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                  مبلغ وصول کل
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                  مانده مطالبات
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {regionalData.map((reg, idx) => (
                <div key={`reg-${idx}`} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {reg.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        وصول: {formatCurrencyAmount(reg.collected)} | مانده: {formatCurrencyAmount(reg.balance)}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        وصول به فروش: {toFaDigits(reg.salesRatio.toFixed(1))}٪
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Collected bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-4 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-lg transition-all duration-500"
                        style={{ width: `${Math.min(100, (reg.collected / maxRegionalVal) * 100)}%` }}
                      />
                    </div>
                    {/* Balance bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-4 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-lg transition-all duration-500"
                        style={{ width: `${Math.min(100, (reg.balance / maxRegionalVal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Smart Meters */}
        {activeTab === 'smart' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
              <span>درصد هوشمندسازی و تعداد کنتورهای منصوبه به تفکیک منطقه</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">واحد: دستگاه</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartData.map((item, idx) => (
                <div
                  key={`smart-${idx}`}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="font-black text-sm text-teal-600 dark:text-teal-400">
                      {toFaDigits(item.ratio.toFixed(1))}٪
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden mb-2">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.ratio)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>کنتور هوشمند: {toFaDigits(item.smartMeters.toLocaleString())}</span>
                    <span>کل مشترکین: {toFaDigits(item.totalSubs.toLocaleString())}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Debtors */}
        {activeTab === 'debtors' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
              <span>پیشرفت اقدام نصب کنتور هوشمند برای مشترکین بدهکار (یک‌ماهه)</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">هدف vs اقدام‌شده</span>
            </div>

            <div className="space-y-3.5">
              {debtorData.map((item, idx) => (
                <div key={`debtor-${idx}`} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        انجام شده: {toFaDigits(item.totalDone)} از {toFaDigits(item.totalTarget)} مشترک
                      </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">
                        {toFaDigits(item.actionPct.toFixed(1))}٪
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.actionPct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
