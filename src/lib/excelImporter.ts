import * as XLSX from 'xlsx';
import { Kelas } from '../types/database';

export interface ParsedStudentRow {
  rowNumber: number;
  fullName: string;
  rombelRaw: string;
  normalizedRombel: string;
  grade: 7 | 8 | 9;
  isValid: boolean;
  errorMessage?: string;
}

export interface ExcelParseResult {
  fileName: string;
  totalRows: number;
  validRows: ParsedStudentRow[];
  invalidRows: ParsedStudentRow[];
  detectedRombels: {
    rombel: string;
    grade: 7 | 8 | 9;
    studentCount: number;
    isNew: boolean;
  }[];
}

/**
 * Normalizes user-entered rombel and extracts standard rombel string + grade (7, 8, or 9)
 * Handles: "7A", "7 A", "7-A", "VII A", "VII-A", "Kelas 7A", "8B", "VIII B", "9A", "IX-A", etc.
 */
export function normalizeRombel(input: string | number | undefined): { rombel: string; grade: 7 | 8 | 9 } {
  if (!input) {
    return { rombel: '7A', grade: 7 };
  }

  let str = String(input).trim().toUpperCase();
  // Remove words like "KELAS", "KLS", "ROOM", "CLASS", "TINGKAT"
  str = str.replace(/^(KELAS|KLS|CLASS|TINGKAT)\s*/i, '').trim();

  let grade: 7 | 8 | 9 = 7;
  let suffix = '';

  if (str.startsWith('VIII')) {
    grade = 8;
    suffix = str.slice(4).replace(/^[-_\s]+/, '');
  } else if (str.startsWith('VII')) {
    grade = 7;
    suffix = str.slice(3).replace(/^[-_\s]+/, '');
  } else if (str.startsWith('IX')) {
    grade = 9;
    suffix = str.slice(2).replace(/^[-_\s]+/, '');
  } else if (str.startsWith('7')) {
    grade = 7;
    suffix = str.slice(1).replace(/^[-_\s]+/, '');
  } else if (str.startsWith('8')) {
    grade = 8;
    suffix = str.slice(1).replace(/^[-_\s]+/, '');
  } else if (str.startsWith('9')) {
    grade = 9;
    suffix = str.slice(1).replace(/^[-_\s]+/, '');
  } else {
    // Fallback: search for first digit
    const match = str.match(/([789])/);
    if (match) {
      grade = Number(match[1]) as 7 | 8 | 9;
      suffix = str.replace(/[^A-Z]/gi, '');
    } else {
      grade = 7;
      suffix = str.replace(/[^A-Z]/gi, '') || 'A';
    }
  }

  // Clean suffix (take first letters, default to 'A' if empty)
  suffix = suffix.trim() || 'A';
  const cleanRombel = `${grade}${suffix}`;

  return { rombel: cleanRombel, grade };
}

/**
 * Finds column key case-insensitively from a row object
 */
function findValueByHeaderKeywords(row: Record<string, any>, keywords: string[]): any {
  const keys = Object.keys(row);
  for (const key of keys) {
    const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
    for (const kw of keywords) {
      const cleanKw = kw.trim().toLowerCase().replace(/[\s_-]+/g, '');
      if (cleanKey === cleanKw || cleanKey.includes(cleanKw)) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
          return row[key];
        }
      }
    }
  }
  return undefined;
}

/**
 * Parses an uploaded Excel (.xlsx, .xls, .csv) file
 */
export async function parseExcelFile(file: File, existingClasses: Kelas[]): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Read the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
  }

  const worksheet = workbook.Sheets[sheetName];
  // Convert sheet to array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('File Excel kosong atau tidak memiliki baris data.');
  }

  const validRows: ParsedStudentRow[] = [];
  const invalidRows: ParsedStudentRow[] = [];
  const rombelCounts: Record<string, { grade: 7 | 8 | 9; count: number }> = {};

  const nameKeywords = [
    'namalengkap',
    'namasiswa',
    'nama',
    'fullname',
    'studentname',
    'pesertadidik',
    'siswa',
  ];

  const rombelKeywords = [
    'kelas',
    'rombel',
    'rombonganbelajar',
    'class',
    'tingkat',
  ];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const rawName = findValueByHeaderKeywords(row, nameKeywords);
    const rawRombel = findValueByHeaderKeywords(row, rombelKeywords);

    // If whole row is empty, skip
    const isRowEmpty = Object.values(row).every((v) => !v || String(v).trim() === '');
    if (isRowEmpty) return;

    const fullName = rawName ? String(rawName).trim() : '';
    const rombelRawStr = rawRombel ? String(rawRombel).trim() : '';

    if (!fullName) {
      invalidRows.push({
        rowNumber: rowNum,
        fullName: '',
        rombelRaw: rombelRawStr,
        normalizedRombel: '',
        grade: 7,
        isValid: false,
        errorMessage: 'Nama siswa kosong pada baris ini.',
      });
      return;
    }

    const { rombel, grade } = normalizeRombel(rombelRawStr);

    validRows.push({
      rowNumber: rowNum,
      fullName,
      rombelRaw: rombelRawStr || rombel,
      normalizedRombel: rombel,
      grade,
      isValid: true,
    });

    if (!rombelCounts[rombel]) {
      rombelCounts[rombel] = { grade, count: 0 };
    }
    rombelCounts[rombel].count += 1;
  });

  const existingRombelSet = new Set(existingClasses.map((c) => c.rombel.toUpperCase()));

  const detectedRombels = Object.entries(rombelCounts)
    .map(([rombel, data]) => ({
      rombel,
      grade: data.grade,
      studentCount: data.count,
      isNew: !existingRombelSet.has(rombel.toUpperCase()),
    }))
    .sort((a, b) => a.rombel.localeCompare(b.rombel, undefined, { numeric: true }));

  return {
    fileName: file.name,
    totalRows: validRows.length + invalidRows.length,
    validRows,
    invalidRows,
    detectedRombels,
  };
}

/**
 * Generates and triggers download of a standardized Excel template for student & class data
 */
export function downloadExcelTemplate() {
  const templateData = [
    {
      No: 1,
      'Nama Lengkap Siswa': 'Ahmad Fauzan Syahputra',
      'Kelas / Rombel': '7A',
      Keterangan: 'Tingkat 7 Rombel A',
    },
    {
      No: 2,
      'Nama Lengkap Siswa': 'Alya Nur Azizah',
      'Kelas / Rombel': '7A',
      Keterangan: 'Tingkat 7 Rombel A',
    },
    {
      No: 3,
      'Nama Lengkap Siswa': 'Bagus Dwi Cahyono',
      'Kelas / Rombel': '7B',
      Keterangan: 'Tingkat 7 Rombel B',
    },
    {
      No: 4,
      'Nama Lengkap Siswa': 'Citra Kirana Maharani',
      'Kelas / Rombel': '8A',
      Keterangan: 'Tingkat 8 Rombel A',
    },
    {
      No: 5,
      'Nama Lengkap Siswa': 'Dimas Prasetyo',
      'Kelas / Rombel': '8B',
      Keterangan: 'Tingkat 8 Rombel B',
    },
    {
      No: 6,
      'Nama Lengkap Siswa': 'Fathur Rahman Al Ghozali',
      'Kelas / Rombel': '9A',
      Keterangan: 'Tingkat 9 Rombel A',
    },
    {
      No: 7,
      'Nama Lengkap Siswa': 'Ghaida Putri Zahira',
      'Kelas / Rombel': '9B',
      Keterangan: 'Tingkat 9 Rombel B',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama Lengkap Siswa
    { wch: 16 }, // Kelas / Rombel
    { wch: 25 }, // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

  XLSX.writeFile(workbook, 'Template_Import_Siswa_Kelas_SMP_AlMuttaqin.xlsx');
}
