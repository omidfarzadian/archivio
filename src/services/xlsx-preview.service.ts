import { base64ToUint8Array } from './file-bytes.service';

export interface ExcelPreviewData {
  sheetName: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
  totalCols: number;
}

const MAX_PREVIEW_ROWS = 100;
const MAX_PREVIEW_COLS = 12;

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  return String(value).trim();
}

export async function parseExcelPreview(
  data: Uint8Array | string,
): Promise<ExcelPreviewData | null> {
  try {
    const XLSX = await import('xlsx');
    const bytes = typeof data === 'string' ? base64ToUint8Array(data) : data;
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return null;

    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: '',
    });

    if (raw.length === 0) {
      return { sheetName, headers: [], rows: [], totalRows: 0, totalCols: 0 };
    }

    const maxCols = raw.reduce((max, row) => Math.max(max, row.length), 0);
    const normalized = raw.map((row) => {
      const filled = [...row];
      while (filled.length < maxCols) filled.push('');
      return filled.map(cellToString);
    });

    const headers = normalized[0]?.slice(0, MAX_PREVIEW_COLS) ?? [];
    const rows = normalized.slice(1, MAX_PREVIEW_ROWS + 1).map((row) => row.slice(0, MAX_PREVIEW_COLS));

    return {
      sheetName,
      headers,
      rows,
      totalRows: normalized.length - 1,
      totalCols: maxCols,
    };
  } catch {
    return null;
  }
}

export function isExcelFile(mimeType: string, name: string): boolean {
  const lower = `${mimeType} ${name}`.toLowerCase();
  return (
    lower.includes('spreadsheet') ||
    lower.includes('excel') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls')
  );
}
