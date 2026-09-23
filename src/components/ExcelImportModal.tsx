import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Users,
  AlertTriangle,
  Loader2,
  FileCheck,
} from 'lucide-react';
import {
  parseExcelFile,
  downloadExcelTemplate,
  ExcelParseResult,
} from '../lib/excelImporter';
import { showSuccessAlert, showErrorAlert } from '../lib/sweetalert';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { classes, importStudentsAndClasses } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Import mode
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  // Submit status
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setParseError(null);
    setParseResult(null);
    setImportSuccessMessage(null);
    setImportErrorMessage(null);
    setIsProcessingFile(true);

    try {
      const result = await parseExcelFile(file, classes);
      if (result.validRows.length === 0) {
        setParseError('Tidak ditemukan baris data siswa yang valid dalam file Excel tersebut.');
      } else {
        setParseResult(result);
      }
    } catch (err: any) {
      setParseError(err?.message || 'Gagal memproses file Excel.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    setIsImporting(true);
    setImportErrorMessage(null);

    try {
      const itemsToImport = parseResult.validRows.map((r) => ({
        fullName: r.fullName,
        rombel: r.normalizedRombel,
        grade: r.grade,
      }));

      const res = await importStudentsAndClasses(itemsToImport, importMode);

      if (res.success) {
        let msg = `Berhasil mengimpor ${res.importedStudentsCount} siswa ke database Supabase!`;
        if (res.createdClassesCount > 0) {
          msg += ` (${res.createdClassesCount} rombel kelas baru berhasil dibuat otomatis).`;
        }
        setImportSuccessMessage(msg);
        showSuccessAlert('Impor Data Siswa Berhasil!', msg, 3000);

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        showErrorAlert('Gagal Impor Data', res.error || 'Gagal menyimpan data import.');
        setImportErrorMessage(res.error || 'Gagal menyimpan data import.');
      }
    } catch (err: any) {
      showErrorAlert('Error Sistem', err?.message || 'Terjadi kesalahan sistem saat proses import.');
      setImportErrorMessage(err?.message || 'Terjadi kesalahan sistem saat proses import.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetSelection = () => {
    setParseResult(null);
    setParseError(null);
    setImportSuccessMessage(null);
    setImportErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Import Data Siswa & Kelas dari Excel
              </h3>
              <p className="text-[11px] text-slate-500">
                Mendukung format .xlsx, .xls, dan .csv dengan deteksi kelas otomatis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Top Download Template Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Format Excel Standar Sekolah
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Gunakan kolom <strong>Nama Lengkap Siswa</strong> dan <strong>Kelas / Rombel</strong> (contoh: 7A, 7B, 8A, 8B, 9A, 9B).
              </p>
            </div>

            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>

          {/* Success / Error Messages */}
          {importSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Proses Import Berhasil!</span>
                <span className="text-[11px] text-emerald-800">{importSuccessMessage}</span>
              </div>
            </div>
          )}

          {importErrorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal Mengimpor Data</span>
                <span className="text-[11px] text-rose-800">{importErrorMessage}</span>
              </div>
            </div>
          )}

          {parseError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">File Excel Tidak Dapat Diproses</span>
                <span className="text-[11px] text-amber-800">{parseError}</span>
              </div>
            </div>
          )}

          {/* Dropzone Area (if no file parsed yet) */}
          {!parseResult && !importSuccessMessage && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                {isProcessingFile ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <span className="font-bold text-slate-800 block text-sm">
                {isProcessingFile
                  ? 'Sedang membaca file Excel...'
                  : 'Klik atau Tarik File Excel (.xlsx, .xls) ke Sini'}
              </span>
              <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
                Sistem akan membaca kolom nama dan rombel kelas siswa secara otomatis serta memeriksa kesiapan data.
              </p>
            </div>
          )}

          {/* Preview & Confirmation Area */}
          {parseResult && !importSuccessMessage && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-100/80 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">{parseResult.fileName}</span>
                  <span className="text-[10px] text-slate-500">
                    ({parseResult.totalRows} baris terdeteksi)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetSelection}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Ganti File
                </button>
              </div>

              {/* Stats Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Siswa Siap Diimport
                  </span>
                  <span className="text-lg font-extrabold text-emerald-900 font-mono">
                    {parseResult.validRows.length} Siswa
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Rombel Kelas Terdeteksi
                  </span>
                  <span className="text-lg font-extrabold text-indigo-900 font-mono">
                    {parseResult.detectedRombels.length} Rombel
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Rombel Baru (Auto-Create)
                  </span>
                  <span className="text-lg font-extrabold text-amber-900 font-mono">
                    {parseResult.detectedRombels.filter((r) => r.isNew).length} Rombel
                  </span>
                </div>
              </div>

              {/* Detected Classes Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rombel Kelas yang Ditemukan di Excel:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {parseResult.detectedRombels.map((r) => (
                    <div
                      key={r.rombel}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                        r.isNew
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="font-bold">Kelas {r.rombel}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({r.studentCount} siswa)
                      </span>
                      {r.isNew ? (
                        <span className="text-[9px] bg-amber-200/80 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Kelas Baru
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                          Tersedia
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pratinjau Data Siswa (10 Baris Pertama)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Menampilkan 10 dari {parseResult.validRows.length} siswa
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 w-12 font-mono">No</th>
                        <th className="px-3 py-2">Nama Lengkap</th>
                        <th className="px-3 py-2">Rombel Asli</th>
                        <th className="px-3 py-2">Rombel Terbaca</th>
                        <th className="px-3 py-2">Tingkat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.validRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-1.5 font-medium text-slate-900">{row.fullName}</td>
                          <td className="px-3 py-1.5 text-slate-500 font-mono">{row.rombelRaw}</td>
                          <td className="px-3 py-1.5 font-bold text-indigo-700 font-mono">
                            {row.normalizedRombel}
                          </td>
                          <td className="px-3 py-1.5 text-slate-500">Kelas {row.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Opsi Metode Penyimpanan:
                </span>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        Tambahkan ke data siswa yang sudah ada (Append)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Data siswa yang diimpor akan ditambahkan ke daftar yang ada tanpa menghapus data sebelumnya.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-semibold text-rose-900 block">
                        Ganti / Timpa seluruh data siswa lama (Replace All)
                      </span>
                      <span className="text-[11px] text-rose-700 block">
                        Daftar siswa lama di database akan dibersihkan dan diganti dengan data baru dari Excel ini.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Batal
          </button>

          {parseResult && !importSuccessMessage && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || parseResult.validRows.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database Supabase...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    Proses Import {parseResult.validRows.length} Siswa
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
