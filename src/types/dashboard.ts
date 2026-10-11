/**
 * Types and interfaces for the Collection Management Dashboard
 */

export type SheetCategory =
  | 'realization'
  | 'debt_normal'
  | 'debt_demand'
  | 'debt_total'
  | 'contractors'
  | 'readers'
  | 'smart_meters'
  | 'smart_install_6m'
  | 'smart_debtors'
  | 'custom';

export interface SheetRow {
  __rowNum: number;
  __isSummary?: boolean;
  [key: string]: any;
}

export interface SheetMeta {
  sheetName: string;
  originalName: string;
  category: SheetCategory;
  region?: string;
  headers: string[];
  rows: SheetRow[];
  summaryRows: SheetRow[];
  rowCount: number;
  columnCount: number;
  currency: string;
  datePeriod?: string;
  unitNotes?: string;
}

export interface TopContractor {
  rank: number;
  name: string;
  region: string;
  performancePercent: number;
  collectedAmount: number;
  workOrderAmount: number;
  contractsCount: number;
  currency: string;
  rawPerformanceStr: string;
}

export interface TopReader {
  rank: number;
  name: string;
  region: string;
  collectionPercent: number;
  claimsAmount: number;
  collectedAmount: number;
  workOrderCount: number;
  currency: string;
  rawCollectionStr: string;
}

export interface TopRegion {
  rank: number;
  name: string;
  collectedAmount: number;
  balanceAmount: number;
  collectionToSalesPercent: number;
  currency: string;
}

export interface KPIItem {
  id: string;
  title: string;
  value: number | string | null;
  formattedValue: string;
  unit: string;
  period: string;
  source: string;
  isAvailable: boolean;
  notes?: string;
}

export interface FilterState {
  region: string;
  month: string;
  searchContractor: string;
  searchReader: string;
  selectedDate: string;
}

export interface WorkbookAnalysis {
  fileName: string;
  fileSize: number;
  uploadDate: string;
  sheets: Record<string, SheetMeta>;
  detectedSheetsCount: number;
  expectedSheetsCount: number;
  missingSheets: string[];
  warnings: string[];
}
