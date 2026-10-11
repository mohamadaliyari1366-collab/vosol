import React, { useState, useEffect, useRef } from 'react';
import {
  JalaliDate,
  getTodayJalali,
  monthLen,
  jWeekday,
  toFaDigits,
  padFa,
  formatWordsJalali,
  parseJalaliDate,
  formatJalaliString,
  JALALI_MONTHS,
  WD_SHORT
} from '../utils/jalaali';

interface JalaliDatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'انتخاب تاریخ…',
  className = '',
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const [selectedDate, setSelectedDate] = useState<JalaliDate | null>(parseJalaliDate(value));

  const today = getTodayJalali();
  const [viewYear, setViewYear] = useState<number>(selectedDate ? selectedDate.jy : today.jy);
  const [viewMonth, setViewMonth] = useState<number>(selectedDate ? selectedDate.jm : today.jm);
  const [yearRangeStart, setYearRangeStart] = useState<number>(viewYear - 6);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDate(parseJalaliDate(value));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (view === 'days') {
      if (viewMonth === 1) {
        setViewMonth(12);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (view === 'months') {
      setViewYear(viewYear - 1);
    } else if (view === 'years') {
      setYearRangeStart(yearRangeStart - 12);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (view === 'days') {
      if (viewMonth === 12) {
        setViewMonth(1);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (view === 'months') {
      setViewYear(viewYear + 1);
    } else if (view === 'years') {
      setYearRangeStart(yearRangeStart + 12);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate: JalaliDate = { jy: viewYear, jm: viewMonth, jd: day };
    setSelectedDate(newDate);
    const dateStr = formatJalaliString(newDate);
    if (onChange) onChange(dateStr);
    setTimeout(() => setIsOpen(false), 160);
  };

  const handleGoToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = getTodayJalali();
    setViewYear(t.jy);
    setViewMonth(t.jm);
    setView('days');
    setSelectedDate(t);
    const dateStr = formatJalaliString(t);
    if (onChange) onChange(dateStr);
    setTimeout(() => setIsOpen(false), 160);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    if (onChange) onChange('');
  };

  const displayInputValue = selectedDate
    ? `${toFaDigits(selectedDate.jy)}/${padFa(selectedDate.jm)}/${padFa(selectedDate.jd)}`
    : '';

  // Calculate day cells
  const daysInMonth = monthLen(viewYear, viewMonth);
  const firstDayWeekday = jWeekday(viewYear, viewMonth, 1); // 0 = Sat, 6 = Fri

  return (
    <div className={`jp-wrap relative text-right inline-block ${isOpen ? 'open' : ''} ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</label>}

      <div className="jp-field relative">
        <input
          type="text"
          readOnly
          value={displayInputValue}
          placeholder={placeholder}
          onClick={() => {
            if (!isOpen) {
              setView('days');
              if (selectedDate) {
                setViewYear(selectedDate.jy);
                setViewMonth(selectedDate.jm);
              } else {
                setViewYear(today.jy);
                setViewMonth(today.jm);
              }
              setYearRangeStart((selectedDate ? selectedDate.jy : today.jy) - 6);
            }
            setIsOpen(!isOpen);
          }}
          className="jp-input text-sm cursor-pointer select-none"
        />

        <svg
          className="jp-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <rect x="3.5" y="5" width="17" height="16" rx="3" />
          <path d="M3.5 10h17M8 2.8v4M16 2.8v4M8 14.5h2M14 14.5h2M8 17.5h2M14 17.5h2" />
        </svg>

        <div className={`jp-picker ${isOpen ? 'open' : ''}`} role="dialog">
          {/* Header */}
          <div className="jp-head">
            <button type="button" className="jp-nav jp-prev" onClick={handlePrev} title="قبلی">
              <svg viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="jp-title">
              <button
                type="button"
                className="jp-title-month"
                onClick={(e) => {
                  e.stopPropagation();
                  setView('months');
                }}
              >
                {JALALI_MONTHS[viewMonth - 1]}
              </button>
              <button
                type="button"
                className="jp-title-year"
                onClick={(e) => {
                  e.stopPropagation();
                  setYearRangeStart(viewYear - 6);
                  setView('years');
                }}
              >
                {toFaDigits(viewYear)}
              </button>
            </div>

            <button type="button" className="jp-nav jp-next" onClick={handleNext} title="بعدی">
              <svg viewBox="0 0 24 24">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="jp-body">
            {view === 'days' && (
              <>
                <div className="jp-wd">
                  {WD_SHORT.map((w, idx) => (
                    <span key={idx} className={idx === 6 ? 'fr' : ''}>
                      {w}
                    </span>
                  ))}
                </div>
                <div className="jp-grid">
                  {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                    <div key={`pad-${idx}`} className="jp-pad" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const col = (firstDayWeekday + idx) % 7;
                    const isFriday = col === 6;
                    const isToday = day === today.jd && viewMonth === today.jm && viewYear === today.jy;
                    const isSelected =
                      selectedDate &&
                      selectedDate.jy === viewYear &&
                      selectedDate.jm === viewMonth &&
                      selectedDate.jd === day;

                    let cls = 'jp-day';
                    if (isFriday) cls += ' fr';
                    if (isToday) cls += ' today';
                    if (isSelected) cls += ' sel';

                    return (
                      <button
                        type="button"
                        key={`day-${day}`}
                        className={cls}
                        onClick={() => handleSelectDay(day)}
                      >
                        {toFaDigits(day)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {view === 'months' && (
              <div className="jp-months-grid">
                {JALALI_MONTHS.map((mName, idx) => {
                  const mNum = idx + 1;
                  const isTodayMonth = mNum === today.jm && viewYear === today.jy;
                  const isSelMonth = selectedDate && viewMonth === mNum && selectedDate.jy === viewYear;

                  let cls = 'jp-month';
                  if (isTodayMonth) cls += ' today';
                  if (isSelMonth) cls += ' sel';

                  return (
                    <button
                      type="button"
                      key={`m-${mNum}`}
                      className={cls}
                      onClick={() => {
                        setViewMonth(mNum);
                        setView('days');
                      }}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            )}

            {view === 'years' && (
              <div className="jp-years-grid">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const y = yearRangeStart + idx;
                  const isTodayYear = y === today.jy;
                  const isSelYear = selectedDate && selectedDate.jy === y;

                  let cls = 'jp-year';
                  if (isTodayYear) cls += ' today';
                  if (isSelYear) cls += ' sel';

                  return (
                    <button
                      type="button"
                      key={`y-${y}`}
                      className={cls}
                      onClick={() => {
                        setViewYear(y);
                        setView('months');
                      }}
                    >
                      {toFaDigits(y)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="jp-foot">
            <span className="jp-today-label">
              امروز: {formatWordsJalali(today.jy, today.jm, today.jd)}
            </span>
            <div className="jp-actions">
              <button type="button" className="jp-btn jp-ghost" onClick={handleClear}>
                پاک‌کردن
              </button>
              <button type="button" className="jp-btn jp-solid" onClick={handleGoToday}>
                امروز
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
