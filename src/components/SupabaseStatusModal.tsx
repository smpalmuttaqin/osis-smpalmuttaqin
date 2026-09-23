import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldAlert,
  DownloadCloud,
  UploadCloud,
} from 'lucide-react';
import { SUPABASE_URL } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    supabaseStatus,
    isTestingSupabase,
    checkSupabaseHealth,
    syncDataToSupabase,
    isSyncingWithSupabase,
    loadDataFromSupabase,
    isLoadingFromSupabase,
  } = useApp();

  const [copiedSql, setCopiedSql] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const rlsFixSql = `-- JALANKAN QUERY INI DI SQL EDITOR SUPABASE UNTUK MEMBUKA AKSES WEB CLIENT:
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS selection_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pleno_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS voting_attendances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS final_votes DISABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsFixSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(null as any), 2500);
  };

  const handleSyncNow = async () => {
    setSyncFeedback(null);
    const res = await syncDataToSupabase();
    setSyncFeedback(res);
  };

  const handlePullFromSupabase = async () => {
    setSyncFeedback(null);
    const res = await loadDataFromSupabase();
    setSyncFeedback(res);
    await checkSupabaseHealth();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Status Database Supabase PostgreSQL
                </h3>
                {supabaseStatus?.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Terkendala
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-md">
                {SUPABASE_URL}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Connection Summary Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kredensial Aktif
                </span>
                <span className="font-semibold text-slate-900 text-xs font-mono">
                  Project: avrudqubtdtasaaugtjx.supabase.co
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={checkSupabaseHealth}
                  disabled={isTestingSupabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                  title="Periksa koneksi dan hitung data tabel Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi</span>
                </button>

                <button
                  onClick={handlePullFromSupabase}
                  disabled={isLoadingFromSupabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  title="Ambil data dari tabel Supabase dan tampilkan di aplikasi"
                >
                  <DownloadCloud className={`w-3.5 h-3.5 ${isLoadingFromSupabase ? 'animate-bounce' : ''}`} />
                  <span>{isLoadingFromSupabase ? 'Memuat...' : 'Tarik dari Supabase'}</span>
                </button>

                <button
                  onClick={handleSyncNow}
                  disabled={isSyncingWithSupabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  title="Kirim dan simpan data master aplikasi ke tabel database Supabase"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncingWithSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWithSupabase ? 'Mengirim...' : 'Kirim ke Supabase'}</span>
                </button>
              </div>
            </div>

            {syncFeedback && (
              <div
                className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  syncFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-medium text-xs">{syncFeedback.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Table Diagnostics Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Pemeriksaan 9 Tabel Database Supabase:</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Dicek pada: {supabaseStatus?.checkedAt || 'Baru saja'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {supabaseStatus?.tables &&
                Object.entries(supabaseStatus.tables).map(([tableName, info]) => (
                  <div
                    key={tableName}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-mono font-semibold text-slate-800 block truncate">
                        {tableName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {info.count} baris data
                      </span>
                    </div>

                    {info.exists ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* RLS Notice & Query Box */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-900 text-xs">
                  Penting: Izin Row Level Security (RLS) di Supabase
                </h5>
                <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                  Secara default, Supabase mengaktifkan RLS sehingga API publik (anon key) tidak diizinkan menulis data kecuali RLS dinonaktifkan atau policy diatur. Jika Anda melihat pesan error RLS saat menyimpan, salin dan jalankan script SQL ini di{' '}
                  <strong>Supabase Dashboard &gt; SQL Editor</strong>:
                </p>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-[11px] font-mono overflow-x-auto selection:bg-emerald-800 selection:text-white">
                {rlsFixSql}
              </pre>
              <button
                onClick={handleCopySql}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-medium transition-colors border border-slate-700"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Salin SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <a
            href="https://supabase.com/dashboard/project/avrudqubtdtasaaugtjx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            <span>Buka Dashboard Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
