import React from 'react';
import { AppProvider, useApp, ROLE_PERMISSIONS } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { SeleksiView } from './components/SeleksiView';
import { RekapSeleksiView } from './components/RekapSeleksiView';
import { PlenoView } from './components/PlenoView';
import { PaslonAdminView } from './components/PaslonAdminView';
import { BilikSuaraView } from './components/BilikSuaraView';
import { AbsensiAdminView } from './components/AbsensiAdminView';
import { ManajemenDataView } from './components/ManajemenDataView';
import { ManajemenGuruView } from './components/ManajemenGuruView';
import { ManajemenPetugasView } from './components/ManajemenPetugasView';
import { LaravelExportView } from './components/LaravelExportView';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { ShieldAlert, ArrowRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activePage,
    setActivePage,
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
  } = useApp();

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <SupabaseStatusModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  const permissions = currentRole ? ROLE_PERMISSIONS[currentRole] : null;
  const isPageAllowed = permissions ? permissions.allowedPages.includes(activePage) : false;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Bar */}
        <Header />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {!isPageAllowed ? (
              <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Akses Terbatas</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Akun Anda ({permissions?.label || 'Pengguna'}) tidak memiliki izin untuk membuka halaman ini.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {permissions?.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => permissions && setActivePage(permissions.defaultPage)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Buka Menu Utama</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {activePage === 'dashboard' && <DashboardView />}
                {activePage === 'seleksi' && <SeleksiView />}
                {activePage === 'rekap_seleksi' && <RekapSeleksiView />}
                {activePage === 'pleno' && <PlenoView />}
                {activePage === 'paslon' && <PaslonAdminView />}
                {activePage === 'bilik_suara' && <BilikSuaraView />}
                {activePage === 'absensi' && <AbsensiAdminView />}
                {activePage === 'manajemen_siswa' && <ManajemenDataView />}
                {activePage === 'manajemen_guru' && <ManajemenGuruView />}
                {activePage === 'manajemen_petugas' && <ManajemenPetugasView />}
                {activePage === 'laravel_code' && <LaravelExportView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Supabase Status & Diagnostics Modal */}
      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
