/**
 * Jalali (Shamsi) Date Calculation Algorithms & Utilities
 * Exact mathematical calendar conversion based on astronomical tables
 */

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

function div(a: number, b: number): number {
  return ~~(a / b);
}

function mod(a: number, b: number): number {
  return a - ~~(a / b) * b;
}

export function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;
  let i = 0;

  for (i = 1; i < bl; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  const n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

export function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

export function d2g(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

export function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

export function d2j(jdn: number): JalaliDate {
  const gy = d2g(jdn).gy;
  const jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k = k - 186;
  } else {
    const prevJy = jy - 1;
    k = k + 179;
    if (r.leap === 1) k = k + 1;
    return d2j(jdn);
  }

  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

export function toJalaali(gy: number, gm: number, gd: number): JalaliDate {
  return d2j(g2d(gy, gm, gd));
}

export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd));
}

export function isLeapJY(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

export function monthLen(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJY(jy) ? 30 : 29;
}

export function jWeekday(jy: number, jm: number, jd: number): number {
  const g = toGregorian(jy, jm, jd);
  return (new Date(g.gy, g.gm - 1, g.gd).getDay() + 1) % 7;
}

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export const WD_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const WD_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toFaDigits(n: number | string): string {
  if (n === null || n === undefined) return '';
  return String(n).replace(/\d/g, (d) => FA_DIGITS[parseInt(d, 10)]);
}

export function fromFaDigits(str: string): string {
  if (!str) return '';
  return str.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

export function padFa(n: number): string {
  return toFaDigits((n < 10 ? '0' : '') + n);
}

export function formatWordsJalali(jy: number, jm: number, jd: number): string {
  return `${WD_FULL[jWeekday(jy, jm, jd)]} ${toFaDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toFaDigits(jy)}`;
}

export function parseJalaliDate(str: string | null | undefined): JalaliDate | null {
  if (!str) return null;
  const normalized = fromFaDigits(str).trim();
  const parts = normalized.split(/[/ -]/);
  if (parts.length !== 3) return null;
  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
  if (jm < 1 || jm > 12 || jd < 1 || jd > monthLen(jy, jm)) return null;
  return { jy, jm, jd };
}

export function getTodayJalali(): JalaliDate {
  const now = new Date();
  return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatJalaliString(date: JalaliDate | null): string {
  if (!date) return '';
  const mm = date.jm < 10 ? `0${date.jm}` : `${date.jm}`;
  const dd = date.jd < 10 ? `0${date.jd}` : `${date.jd}`;
  return `${date.jy}/${mm}/${dd}`;
}

export function formatJalaliDisplayFa(date: JalaliDate | null): string {
  if (!date) return '';
  return `${toFaDigits(date.jy)}/${padFa(date.jm)}/${padFa(date.jd)}`;
}
