/**
 * KPI and Ranking Engine
 * Implements strict calculation logic and tie-breaker algorithms
 * according to Sections 4 & 5 of the PRD:
 * - Top 3 Contractors (درصد عملکرد -> مبلغ وصولی -> تعداد قرارداد)
 * - Top 3 Readers (درصد وصول -> مبلغ وصول -> تعداد دستورکار)
 * - Top 3 Regions by Collection Amount (مبلغ وصول in مانده مطالبات کل)
 * - Zero fabricated guesses, strict exclusion of total/summary rows
 */

import { SheetMeta, TopContractor, TopReader, TopRegion, KPIItem } from '../types/dashboard';
import { extractNumeric, normalizePercentForSort, formatCurrencyAmount, formatPercentValue } from './numberFormat';

/**
 * Calculates top ranked contractors
 */
export function calculateTopContractors(
  sheets: Record<string, SheetMeta>,
  selectedRegion: string = 'all'
): TopContractor[] {
  const contractorsList: Array<{
    name: string;
    region: string;
    performancePercent: number;
    rawPerformanceStr: string;
    collectedAmount: number;
    workOrderAmount: number;
    contractsCount: number;
    currency: string;
  }> = [];

  // Search through all contractor sheets
  for (const sheet of Object.values(sheets)) {
    if (sheet.category !== 'contractors') continue;

    // Filter by region if chosen
    if (selectedRegion !== 'all' && sheet.region && sheet.region !== selectedRegion) {
      continue;
    }

    for (const row of sheet.rows) {
      if (row.__isSummary) continue;

      // Find name key
      const nameKey = Object.keys(row).find((k) => k.includes('پیمانکار') || k.includes('نام'));
      const contractorName = nameKey ? String(row[nameKey] || '').trim() : '';

      if (!contractorName || contractorName.includes('مجموع') || contractorName.includes('جمع')) {
        continue;
      }

      // Find performance percent key
      const perfKey = Object.keys(row).find((k) => k.includes('درصد عملکرد') || k.includes('عملکرد'));
      const rawPerf = perfKey ? row[perfKey] : null;
      const perfVal = normalizePercentForSort(rawPerf);

      // Find collected amount key
      const collKey = Object.keys(row).find((k) => k.includes('مبلغ وصول') || k.includes('وصولی'));
      const collVal = collKey ? extractNumeric(row[collKey]) || 0 : 0;

      // Find work order amount key
      const woKey = Object.keys(row).find((k) => k.includes('دستورکار تحویلی') || k.includes('دستورکار'));
      const woVal = woKey ? extractNumeric(row[woKey]) || 0 : 0;

      // Find contracts count key
      const cntKey = Object.keys(row).find((k) => k.includes('تعداد قرارداد') || k.includes('قرارداد'));
      const cntVal = cntKey ? extractNumeric(row[cntKey]) || 1 : 1;

      contractorsList.push({
        name: contractorName,
        region: sheet.region || 'سایر',
        performancePercent: perfVal,
        rawPerformanceStr: formatPercentValue(rawPerf),
        collectedAmount: collVal,
        workOrderAmount: woVal,
        contractsCount: cntVal,
        currency: sheet.currency || 'میلیون ریال'
      });
    }
  }

  // Sort: 1. performancePercent DESC, 2. collectedAmount DESC, 3. contractsCount DESC
  contractorsList.sort((a, b) => {
    if (b.performancePercent !== a.performancePercent) {
      return b.performancePercent - a.performancePercent;
    }
    if (b.collectedAmount !== a.collectedAmount) {
      return b.collectedAmount - a.collectedAmount;
    }
    return b.contractsCount - a.contractsCount;
  });

  // Assign ranks with proper tie-handling
  let currentRank = 1;
  const result: TopContractor[] = contractorsList.map((item, idx, arr) => {
    if (idx > 0) {
      const prev = arr[idx - 1];
      const isExactTie =
        prev.performancePercent === item.performancePercent &&
        prev.collectedAmount === item.collectedAmount &&
        prev.contractsCount === item.contractsCount;

      if (!isExactTie) {
        currentRank = idx + 1;
      }
    }
    return {
      rank: currentRank,
      ...item
    };
  });

  return result;
}

/**
 * Calculates top ranked meter readers
 */
export function calculateTopReaders(
  sheets: Record<string, SheetMeta>,
  selectedRegion: string = 'all'
): TopReader[] {
  const readersList: Array<{
    name: string;
    region: string;
    collectionPercent: number;
    rawCollectionStr: string;
    claimsAmount: number;
    collectedAmount: number;
    workOrderCount: number;
    currency: string;
  }> = [];

  const seenKeys = new Set<string>();

  for (const sheet of Object.values(sheets)) {
    if (sheet.category !== 'readers') continue;

    // Filter by region if requested
    if (selectedRegion !== 'all' && sheet.region && sheet.region !== 'ستاد امور' && sheet.region !== selectedRegion) {
      continue;
    }

    for (const row of sheet.rows) {
      if (row.__isSummary) continue;

      // Find name
      const nameKey = Object.keys(row).find((k) => k.includes('مامور') || k.includes('مأمور') || k.includes('نام'));
      const readerName = nameKey ? String(row[nameKey] || '').trim() : '';

      if (!readerName || readerName.includes('مجموع') || readerName.includes('جمع')) {
        continue;
      }

      // Find collection percent
      const collPercentKey = Object.keys(row).find((k) => k.includes('درصد وصول'));
      const rawCollPercent = collPercentKey ? row[collPercentKey] : null;
      const collPercent = normalizePercentForSort(rawCollPercent);

      // Find collected amount
      const collKey = Object.keys(row).find((k) => k.includes('مبلغ وصول') || k.includes('وصول'));
      const collAmount = collKey ? extractNumeric(row[collKey]) || 0 : 0;

      // Find claims amount
      const claimsKey = Object.keys(row).find((k) => k.includes('مبلغ مطالبات') || k.includes('مطالبات'));
      const claimsAmount = claimsKey ? extractNumeric(row[claimsKey]) || 0 : 0;

      // Find work orders
      const woKey = Object.keys(row).find((k) => k.includes('تعداد دستورکار') || k.includes('دستورکار'));
      const woCount = woKey ? extractNumeric(row[woKey]) || 0 : 0;

      // Region/office label
      const regionLabel = (row['منطقه/امور'] || sheet.region || 'ستاد امور') as string;

      // Avoid double counting same reader with identical name and collection
      const uniqueKey = `${readerName}_${collAmount}`;
      if (seenKeys.has(uniqueKey)) continue;
      seenKeys.add(uniqueKey);

      readersList.push({
        name: readerName,
        region: regionLabel,
        collectionPercent: collPercent,
        rawCollectionStr: formatPercentValue(rawCollPercent),
        claimsAmount,
        collectedAmount: collAmount,
        workOrderCount: woCount,
        currency: sheet.currency || 'ریال'
      });
    }
  }

  // Sort: 1. collectionPercent DESC, 2. collectedAmount DESC, 3. workOrderCount DESC
  readersList.sort((a, b) => {
    if (b.collectionPercent !== a.collectionPercent) {
      return b.collectionPercent - a.collectionPercent;
    }
    if (b.collectedAmount !== a.collectedAmount) {
      return b.collectedAmount - a.collectedAmount;
    }
    return b.workOrderCount - a.workOrderCount;
  });

  // Assign ranks
  let currentRank = 1;
  const result: TopReader[] = readersList.map((item, idx, arr) => {
    if (idx > 0) {
      const prev = arr[idx - 1];
      const isExactTie =
        prev.collectionPercent === item.collectionPercent &&
        prev.collectedAmount === item.collectedAmount &&
        prev.workOrderCount === item.workOrderCount;

      if (!isExactTie) {
        currentRank = idx + 1;
      }
    }
    return {
      rank: currentRank,
      ...item
    };
  });

  return result;
}

/**
 * Calculates top 3 regions by collection amount
 * Source: Sheet «مانده مطالبات کـــل به تفکیک من»
 * Criterion: highest collection amount (مبلغ وصول), NOT percentage.
 */
export function calculateTopRegions(sheets: Record<string, SheetMeta>): TopRegion[] {
  // Find total debt sheet
  const totalDebtSheet = Object.values(sheets).find((s) => s.category === 'debt_total');
  if (!totalDebtSheet) return [];

  const regionList: TopRegion[] = [];

  for (const row of totalDebtSheet.rows) {
    if (row.__isSummary) continue;

    const nameKey = Object.keys(row).find((k) => k.includes('منطقه') || k.includes('نام'));
    const regionName = nameKey ? String(row[nameKey] || '').trim() : '';

    if (!regionName || regionName.includes('جمع') || regionName.includes('مجموع')) {
      continue;
    }

    // Collection amount
    const collKey = Object.keys(row).find((k) => k.includes('مبلغ وصول کل') || k.includes('وصول'));
    const collVal = collKey ? extractNumeric(row[collKey]) || 0 : 0;

    // Balance amount
    const balKey = Object.keys(row).find((k) => k.includes('مانده تا تاریخ') || k.includes('مانده'));
    const balVal = balKey ? extractNumeric(row[balKey]) || 0 : 0;

    // Percent
    const pctKey = Object.keys(row).find((k) => k.includes('درصد وصول به فروش') || k.includes('درصد'));
    const pctVal = pctKey ? normalizePercentForSort(row[pctKey]) : 0;

    regionList.push({
      rank: 0,
      name: regionName,
      collectedAmount: collVal,
      balanceAmount: balVal,
      collectionToSalesPercent: pctVal,
      currency: totalDebtSheet.currency || 'میلیون ریال'
    });
  }

  // Sort by collectedAmount descending
  regionList.sort((a, b) => b.collectedAmount - a.collectedAmount);

  // Assign ranks
  let currentRank = 1;
  return regionList.map((item, idx, arr) => {
    if (idx > 0 && arr[idx - 1].collectedAmount !== item.collectedAmount) {
      currentRank = idx + 1;
    }
    return {
      ...item,
      rank: currentRank
    };
  });
}

/**
 * Computes executive KPI summary indicators
 */
export function computeKPIs(
  sheets: Record<string, SheetMeta>,
  selectedRegion: string = 'all'
): KPIItem[] {
  const kpis: KPIItem[] = [];

  // 1. کل مبلغ وصول (Total Collection Amount) from total debt sheet
  const totalDebtSheet = Object.values(sheets).find((s) => s.category === 'debt_total');
  if (totalDebtSheet) {
    let totalColl = 0;
    let found = false;

    for (const r of totalDebtSheet.rows) {
      if (r.__isSummary) continue;
      const regKey = Object.keys(r).find((k) => k.includes('منطقه') || k.includes('نام'));
      const regName = regKey ? String(r[regKey] || '') : '';
      if (selectedRegion !== 'all' && regName !== selectedRegion) continue;

      const collKey = Object.keys(r).find((k) => k.includes('مبلغ وصول کل') || k.includes('وصول'));
      if (collKey && r[collKey] !== null) {
        totalColl += extractNumeric(r[collKey]) || 0;
        found = true;
      }
    }

    kpis.push({
      id: 'total_collection',
      title: 'مبلغ وصول کل مطالبات',
      value: found ? totalColl : null,
      formattedValue: found ? formatCurrencyAmount(totalColl) : 'داده موجود نیست',
      unit: totalDebtSheet.currency || 'میلیون ریال',
      period: totalDebtSheet.datePeriod || 'پایان شهریور ۱۴۰۳',
      source: totalDebtSheet.sheetName,
      isAvailable: found,
      notes: 'تجمیع فقط بین رکوردهای جزئی مناطق و بدون احتساب ردیف جمع'
    });
  }

  // 2. درصد تحقق وصول تکلیف شده (Realization %)
  const realSheet = Object.values(sheets).find((s) => s.category === 'realization');
  if (realSheet) {
    // If summary row has overall percentage, or last row
    let overallPerf: any = null;
    if (realSheet.summaryRows.length > 0) {
      const sumRow = realSheet.summaryRows[0];
      const perfKey = Object.keys(sumRow).find((k) => k.includes('درصد تحقق') || k.includes('عملکرد'));
      if (perfKey) overallPerf = sumRow[perfKey];
    } else if (realSheet.rows.length > 0) {
      const lastRow = realSheet.rows[realSheet.rows.length - 1];
      const perfKey = Object.keys(lastRow).find((k) => k.includes('درصد تحقق') || k.includes('عملکرد'));
      if (perfKey) overallPerf = lastRow[perfKey];
    }

    kpis.push({
      id: 'realization_rate',
      title: 'درصد تحقق وصول مصوب',
      value: overallPerf,
      formattedValue: overallPerf !== null ? formatPercentValue(overallPerf) : 'داده موجود نیست',
      unit: 'درصد عملکرد',
      period: realSheet.datePeriod || 'دوره مصوب',
      source: realSheet.sheetName,
      isAvailable: overallPerf !== null,
      notes: 'بر مبنای سهمیه مصوب وصول نقدی و ترانزیت'
    });
  }

  // 3. مانده مطالبات کل (Total Remaining Claims)
  if (totalDebtSheet) {
    let totalBal = 0;
    let found = false;

    for (const r of totalDebtSheet.rows) {
      if (r.__isSummary) continue;
      const regKey = Object.keys(r).find((k) => k.includes('منطقه') || k.includes('نام'));
      const regName = regKey ? String(r[regKey] || '') : '';
      if (selectedRegion !== 'all' && regName !== selectedRegion) continue;

      const balKey = Object.keys(r).find((k) => k.includes('مانده تا تاریخ') || k.includes('مانده'));
      if (balKey && r[balKey] !== null) {
        totalBal += extractNumeric(r[balKey]) || 0;
        found = true;
      }
    }

    kpis.push({
      id: 'total_balance',
      title: 'مانده کل مطالبات تا تاریخ گزارش',
      value: found ? totalBal : null,
      formattedValue: found ? formatCurrencyAmount(totalBal) : 'داده موجود نیست',
      unit: totalDebtSheet.currency || 'میلیون ریال',
      period: totalDebtSheet.datePeriod || 'پایان شهریور ۱۴۰۳',
      source: totalDebtSheet.sheetName,
      isAvailable: found,
      notes: 'مانده قطعی بدهی مشترکین عادی و دیماند'
    });
  }

  // 4. نسبت درصد وصول به فروش کل
  if (totalDebtSheet) {
    let salesSum = 0;
    let collSum = 0;
    let found = false;

    for (const r of totalDebtSheet.rows) {
      if (r.__isSummary) continue;
      const regKey = Object.keys(r).find((k) => k.includes('منطقه') || k.includes('نام'));
      const regName = regKey ? String(r[regKey] || '') : '';
      if (selectedRegion !== 'all' && regName !== selectedRegion) continue;

      const salesKey = Object.keys(r).find((k) => k.includes('فروش'));
      const collKey = Object.keys(r).find((k) => k.includes('وصول'));
      if (salesKey && collKey) {
        salesSum += extractNumeric(r[salesKey]) || 0;
        collSum += extractNumeric(r[collKey]) || 0;
        found = true;
      }
    }

    const ratio = salesSum > 0 ? (collSum / salesSum) * 100 : null;

    kpis.push({
      id: 'collection_to_sales_ratio',
      title: 'نسبت کل وصول به فروش',
      value: ratio,
      formattedValue: ratio !== null ? formatPercentValue(ratio) : 'داده موجود نیست',
      unit: 'درصد وصول',
      period: totalDebtSheet.datePeriod || 'دوره گزارش',
      source: totalDebtSheet.sheetName,
      isAvailable: found,
      notes: 'محاسبه شده از نسبت مبالغ جزئی مناطق'
    });
  }

  // 5. ضریب هوشمندسازی کنتورها (Smart Meters %)
  const smartSheet = Object.values(sheets).find((s) => s.category === 'smart_meters');
  if (smartSheet) {
    let totalSubs = 0;
    let totalSmart = 0;
    let found = false;

    for (const r of smartSheet.rows) {
      if (r.__isSummary) continue;
      const regKey = Object.keys(r).find((k) => k.includes('منطقه') || k.includes('نام'));
      const regName = regKey ? String(r[regKey] || '') : '';
      if (selectedRegion !== 'all' && regName !== selectedRegion) continue;

      const subKey = Object.keys(r).find((k) => k.includes('مشترکین'));
      const smartKey = Object.keys(r).find((k) => k.includes('هوشمند') && !k.includes('درصد'));
      if (subKey && smartKey) {
        totalSubs += extractNumeric(r[subKey]) || 0;
        totalSmart += extractNumeric(r[smartKey]) || 0;
        found = true;
      }
    }

    const pct = totalSubs > 0 ? (totalSmart / totalSubs) * 100 : null;

    kpis.push({
      id: 'smart_meter_ratio',
      title: 'ضریب نفوذ کنتورهای هوشمند',
      value: pct,
      formattedValue: pct !== null ? formatPercentValue(pct) : 'داده موجود نیست',
      unit: 'درصد پوشش',
      period: smartSheet.datePeriod || 'شهریور ۱۴۰۳',
      source: smartSheet.sheetName,
      isAvailable: found,
      notes: `تعداد کل کنتورهای هوشمند: ${formatCurrencyAmount(totalSmart)} دستگاه`
    });
  }

  return kpis;
}
