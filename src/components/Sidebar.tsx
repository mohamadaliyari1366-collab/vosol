import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Building2,
  Briefcase,
  Users,
  Cpu,
  CalendarCheck,
  UserX,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  X
} from 'lucide-react';
import { SheetMeta } from '../types/dashboard';
import { toFaDigits } from '../utils/jalaali';

export type NavigationTarget =
  | 'overview'
  | 'realization'
  | 'debt_normal'
  | 'debt_demand'
  | 'debt_total'
  | 'contractors'
  | 'readers'
  | 'smart_meters'
  | 'smart_6m'
  | 'smart_debtors'
  | 'raw_tables';

interface SidebarProps {
  currentTarget: NavigationTarget;
  onSelectTarget: (target: NavigationTarget) => void;
  isOpen: boolean;
  onClose: () => void;
  sheets: Record<string, SheetMeta>;
  selectedRawSheetName: string;
  onSelectRawSheet: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTarget,
  onSelectTarget,
  isOpen,
  onClose,
  sheets,
  selectedRawSheetName,
  onSelectRawSheet
}) => {
  const menuGroups = [
    {
      groupTitle: 'دیدگاه کلان مدیریتی',
      items: [
        {
          id: 'overview' as NavigationTarget,
          title: 'نمای کلی مدیریتی',
          icon: LayoutDashboard,
          badge: 'KPIها'
        },
        {
          id: 'realization' as NavigationTarget,
          title: 'تحقق وصول ماهانه',
          icon: TrendingUp,
          badge: 'مصوب'
        }
      ]
    },
    {
      groupTitle: 'تحلیل مانده مطالبات',
      items: [
        {
          id: 'debt_normal' as NavigationTarget,
          title: 'مانده مطالبات عادی',
          icon: CreditCard,
          badge: 'مناطق'
        },
        {
          id: 'debt_demand' as NavigationTarget,
          title: 'مانده مطالبات دیماند',
          icon: Building2,
          badge: 'صنعتی'
        },
        {
          id: 'debt_total' as NavigationTarget,
          title: 'مانده کل مطالبات',
          icon: Layers,
          badge: 'تجمیعی'
        }
      ]
    },
    {
      groupTitle: 'ارزیابی و رتبه‌بندی عوامل',
      items: [
        {
          id: 'contractors' as NavigationTarget,
          title: 'عملکرد پیمانکاران',
          icon: Briefcase,
          badge: '۸ منطقه'
        },
        {
          id: 'readers' as NavigationTarget,
          title: 'عملکرد مأموران قرائت',
          icon: Users,
          badge: 'امور و مناطق'
        }
      ]
    },
    {
      groupTitle: 'کنتورهای هوشمند',
      items: [
        {
          id: 'smart_meters' as NavigationTarget,
          title: 'وضعیت کنتورهای هوشمند',
          icon: Cpu,
          badge: 'ضریب نفوذ'
        },
        {
          id: 'smart_6m' as NavigationTarget,
          title: 'نصب هوشمند شش‌ماهه',
          icon: CalendarCheck,
          badge: 'تکفاز/۳فاز'
        },
        {
          id: 'smart_debtors' as NavigationTarget,
          title: 'نصب مشترکین بدهکار',
          icon: UserX,
          badge: 'خانگی و سایر'
        }
      ]
    },
    {
      groupTitle: 'داده‌ها و شیت‌های اکسل',
      items: [
        {
          id: 'raw_tables' as NavigationTarget,
          title: 'جداول خام و شیت‌های پویا',
          icon: FileSpreadsheet,
          badge: `${toFaDigits(Object.keys(sheets).length)} شیت`
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 right-0 z-50 h-screen lg:h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between lg:hidden">
          <span className="font-black text-sm text-slate-900 dark:text-white">
            منوی گزارش‌ها و بخش‌ها
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((grp, gIdx) => (
            <div key={`group-${gIdx}`} className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                {grp.groupTitle}
              </span>
              <div className="space-y-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTarget === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTarget(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span>{item.title}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-[10px] text-slate-400 text-center">
          <div>نسخه ۱٫۰ | شرکت توزیع نیروی برق</div>
          <div className="font-semibold text-slate-500 mt-0.5">
            مبنای محاسبه: ۲۴ شیت وصول مطالبات.xlsx
          </div>
        </div>
      </aside>
    </>
  );
};
