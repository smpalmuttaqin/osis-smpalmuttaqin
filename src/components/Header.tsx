import React from 'react';
import { useApp } from '../context/AppContext';
import { PageView } from '../types/database';
import { RotateCcw, Database, PanelLeft, Menu, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    activePage,
    currentRole,
    resetAllData,
    supabaseStatus,
    setIsSupabaseModalOpen,
    isSidebarCollapsed,
    toggleSidebar,
    logout,
  } = useApp();

  const getPageTitle = (page: PageView) => {
    switch (page) {
      case 'dashboard':
        return {
          title: 'Dashboard Hasil & Statistik Real-Time',
          subtitle: 'Perolehan suara dan visualisasi grafik donat Pilketos SMP Al Muttaqin',
        };
      case 'seleksi':
        return {
          title: 'Tahap 1: Bilik Pemilihan Bakal Calon',
          subtitle: 'Input 3 nama bakal calon perwakilan kelas 7 & 8',
        };
      case 'rekap_seleksi':
        return {
          title: 'Rekapitulasi Hasil Tahap Seleksi',
          subtitle: 'Daftar 12 kandidat teratas (3 perolehan suara terbanyak per rombel 7A, 7B, 8A, 8B)',
        };
      case 'pleno':
        return {
          title: 'Tahap 2: Musyawarah Pleno Dewan Guru',
          subtitle: 'Evaluasi catatan kualitatif dan penandaan 6 bakal calon terbaik',
        };
      case 'paslon':
        return {
          title: 'Penetapan Pasangan Calon (Paslon 1, 2, 3)',
          subtitle: 'Formasi Ketua & Wakil Ketua OSIS beserta visi & misi',
        };
      case 'bilik_suara':
        return {
          title: 'Tahap 3: Bilik Suara E-Voting & Absensi',
          subtitle: 'Absensi kehadiran pemilih dan eksekusi pencoblosan suara final secara tertutup',
        };
      case 'absensi':
        return {
          title: 'Rekap Absensi Kehadiran Pemilih',
          subtitle: 'Daftar seluruh siswa yang telah menggunakan hak suara (Khusus Administrator)',
        };
      case 'manajemen_siswa':
        return {
          title: 'Manajemen Data Siswa & Rombel',
          subtitle: 'Kelola data siswa pemilih dan kelas 7, 8, 9',
        };
      case 'manajemen_guru':
        return {
          title: 'Manajemen Data Dewan Guru',
          subtitle: 'Daftar guru berwenang untuk penilaian & evaluasi Musyawarah Pleno',
        };
      case 'manajemen_petugas':
        return {
          title: 'Manajemen Akun Petugas',
          subtitle: 'Kelola akun login untuk Petugas Seleksi dan Petugas Bilik Pemilihan',
        };
      case 'laravel_code':
        return {
          title: 'Arsitektur Kode Laravel & Supabase PostgreSQL',
          subtitle: 'Salinan siap pakai Controller, Model, Migration, Middleware, dan Blade Views',
        };
      default:
        return { title: 'Sistem Pemilihan OSIS', subtitle: 'SMP Al Muttaqin Kota Madiun' };
    }
  };

  const info = getPageTitle(activePage);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Buka Navigasi Sidebar"
            className="p-2 -ml-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-slate-200 shadow-2xs transition-colors shrink-0"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">
            {info.title}
          </h2>
          <p className="text-xs text-slate-500 truncate">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            supabaseStatus?.isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Buka panel status database Supabase"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Supabase:</span>
          {supabaseStatus?.isConnected ? (
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Terhubung</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Cek DB</span>
            </span>
          )}
        </button>

        {/* Sinkron DB only visible for Administrator */}
        {currentRole === 'admin' && (
          <button
            onClick={() => {
              if (confirm('Sinkronkan ulang seluruh data aplikasi langsung dari database Supabase?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
            title="Muat ulang dan sinkronkan data dari database Supabase (Khusus Admin)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sinkron DB</span>
          </button>
        )}

        {/* Beralih Akun Button */}
        <button
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mengakhiri sesi dan beralih akun?')) {
              logout();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg transition-colors shadow-2xs"
          title="Akhiri sesi dan beralih akun"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Beralih Akun</span>
        </button>
      </div>
    </header>
  );
};
