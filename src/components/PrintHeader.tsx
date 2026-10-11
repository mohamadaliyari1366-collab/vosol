import React from 'react';
import { formatWordsJalali, getTodayJalali, toFaDigits } from '../utils/jalaali';

interface PrintHeaderProps {
  title: string;
  subTitle?: string;
  activeRegion?: string;
  activeMonth?: string;
  currency?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  title,
  subTitle = 'گزارش رسمی و تحلیلی وصول مطالبات',
  activeRegion = 'همه مناطق',
  activeMonth = 'تمامی دوره‌ها',
  currency = 'میلیون ریال'
}) => {
  const today = getTodayJalali();
  const dateStr = formatWordsJalali(today.jy, today.jm, today.jd);

  return (
    <div className="print-only mb-6 border-b-2 border-slate-800 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            سامانه مدیریتی کنترل و تحلیل وصول مطالبات
          </h1>
          <h2 className="text-sm font-bold text-slate-700 mt-1">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subTitle}</p>
        </div>

        <div className="text-left text-xs text-slate-700 space-y-1">
          <div><span className="font-bold">تاریخ چاپ:</span> {dateStr}</div>
          <div><span className="font-bold">فیلتر منطقه:</span> {activeRegion === 'all' ? 'همه مناطق' : activeRegion}</div>
          <div><span className="font-bold">واحد مبالغ:</span> {currency}</div>
          <div><span className="font-bold">صفحه:</span> ۱ از ۱</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
        <span>مبنای داده: فایل اکسل مصوب وصول مطالبات | بدون ارقام فرضی</span>
        <span>سامانه کنترل مالی و عملیاتی شرکت توزیع نیروی برق</span>
      </div>
    </div>
  );
};
