import React from 'react';
import { Award, Briefcase, UserCheck, MapPin, Trophy, ShieldAlert, Sparkles } from 'lucide-react';
import { TopContractor, TopReader, TopRegion } from '../types/dashboard';
import { formatCurrencyAmount, formatPercentValue } from '../utils/numberFormat';
import { toFaDigits } from '../utils/jalaali';

interface TopThreeRankingsProps {
  topContractors: TopContractor[];
  topReaders: TopReader[];
  topRegions: TopRegion[];
  activeRegion: string;
}

export const TopThreeRankings: React.FC<TopThreeRankingsProps> = ({
  topContractors,
  topReaders,
  topRegions,
  activeRegion
}) => {
  const top3Contractors = topContractors.slice(0, 3);
  const top3Readers = topReaders.slice(0, 3);
  const top3Regions = topRegions.slice(0, 3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-600 inline" />
            رتبه ۱ (برتر)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
            <Award className="w-3.5 h-3.5 text-slate-500 inline" />
            رتبه ۲
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-700 inline" />
            رتبه ۳
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            رتبه {toFaDigits(rank)}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              رتبه‌بندی عملکرد (۳ رتبه برتر)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              بر مبنای ضوابط قطعی PRD، بدون پیش‌فرض‌های تخمینی و با اعمال دقیق معیارهای رفع تساوی
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. سه پیمانکار برتر */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between break-inside-avoid">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  ۳ پیمانکار برتر وصول
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                معیار: درصد عملکرد
              </span>
            </div>

            {top3Contractors.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                اطلاعاتی برای فیلتر انتخابی موجود نیست
              </div>
            ) : (
              <div className="space-y-3">
                {top3Contractors.map((c, i) => (
                  <div
                    key={`contractor-${i}`}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {c.name}
                      </div>
                      {getRankBadge(c.rank)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.region}
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {c.rawPerformanceStr}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-slate-500 dark:text-slate-400">
                      <div>
                        <span>وصولی: </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatCurrencyAmount(c.collectedAmount)}
                        </strong>
                      </div>
                      <div className="text-left">
                        <span>دستورکار: </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatCurrencyAmount(c.workOrderAmount)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>منبع: شیتهای عملکرد پیمانکاران</span>
            <span>رفع تساوی: مبلغ وصولی و قرارداد</span>
          </div>
        </div>

        {/* 2. سه مأمور قرائت برتر */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between break-inside-avoid">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  ۳ مأمور قرائت برتر
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                معیار: درصد وصول
              </span>
            </div>

            {top3Readers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                اطلاعاتی برای فیلتر انتخابی موجود نیست
              </div>
            ) : (
              <div className="space-y-3">
                {top3Readers.map((r, i) => (
                  <div
                    key={`reader-${i}`}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.name}
                      </div>
                      {getRankBadge(r.rank)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {r.region}
                      </span>
                      <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">
                        {r.rawCollectionStr}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-slate-500 dark:text-slate-400">
                      <div>
                        <span>وصول: </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatCurrencyAmount(r.collectedAmount)}
                        </strong>
                      </div>
                      <div className="text-left">
                        <span>دستورکار: </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {toFaDigits(r.workOrderCount)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>منبع: شیتهای مأمورین قرائت</span>
            <span>واحد مبالغ: {top3Readers[0]?.currency || 'ریال'}</span>
          </div>
        </div>

        {/* 3. سه منطقه برتر از لحاظ وصول */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between break-inside-avoid">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  ۳ منطقه برتر در وصول
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                معیار: مبلغ وصول
              </span>
            </div>

            {top3Regions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                شیت مانده مطالبات کل بارگذاری نشده است
              </div>
            ) : (
              <div className="space-y-3">
                {top3Regions.map((reg, i) => (
                  <div
                    key={`region-${i}`}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {reg.name}
                      </div>
                      {getRankBadge(reg.rank)}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span>مبلغ کل وصولی:</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                        {formatCurrencyAmount(reg.collectedAmount, reg.currency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-slate-500 dark:text-slate-400">
                      <div>
                        <span>مانده مطالبات: </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatCurrencyAmount(reg.balanceAmount)}
                        </strong>
                      </div>
                      <div className="text-left">
                        <span>وصول به فروش: </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatPercentValue(reg.collectionToSalesPercent)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>منبع: شیت مانده مطالبات کل</span>
            <span>مبنا: بیشترین مبلغ وصول واقعی</span>
          </div>
        </div>
      </div>
    </div>
  );
};
