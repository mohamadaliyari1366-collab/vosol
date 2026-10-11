import React from 'react';
import { DollarSign, Percent, AlertCircle, Cpu, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { KPIItem } from '../types/dashboard';

interface KPISectionProps {
  kpis: KPIItem[];
}

export const KPISection: React.FC<KPISectionProps> = ({ kpis }) => {
  const getKpiIcon = (id: string) => {
    switch (id) {
      case 'total_collection':
        return <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'realization_rate':
        return <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'total_balance':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'collection_to_sales_ratio':
        return <Percent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'smart_meter_ratio':
        return <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-slate-500" />;
    }
  };

  const getKpiTheme = (id: string) => {
    switch (id) {
      case 'total_collection':
        return 'from-emerald-500/10 to-transparent border-emerald-200 dark:border-emerald-800/60';
      case 'realization_rate':
        return 'from-blue-500/10 to-transparent border-blue-200 dark:border-blue-800/60';
      case 'total_balance':
        return 'from-rose-500/10 to-transparent border-rose-200 dark:border-rose-800/60';
      case 'collection_to_sales_ratio':
        return 'from-indigo-500/10 to-transparent border-indigo-200 dark:border-indigo-800/60';
      case 'smart_meter_ratio':
        return 'from-teal-500/10 to-transparent border-teal-200 dark:border-teal-800/60';
      default:
        return 'from-slate-500/10 to-transparent border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border bg-gradient-to-b ${getKpiTheme(
            kpi.id
          )} shadow-xs flex flex-col justify-between break-inside-avoid`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {kpi.title}
              </span>
              <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 shadow-2xs">
                {getKpiIcon(kpi.id)}
              </div>
            </div>

            <div className="my-2">
              {kpi.isAvailable ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {kpi.formattedValue}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {kpi.unit}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  داده موجود نیست
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-2 text-[10px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>منبع:</span>
              <span className="truncate max-w-[130px] font-medium text-slate-500 dark:text-slate-400" title={kpi.source}>
                {kpi.source}
              </span>
            </div>
            <div className="flex justify-between">
              <span>دوره داده:</span>
              <span className="font-medium text-slate-500 dark:text-slate-400">{kpi.period}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
