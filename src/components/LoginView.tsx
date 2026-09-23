import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/database';
import { AlMuttaqinLogo } from './AlMuttaqinLogo';
import { Building2, ShieldCheck, GraduationCap, Vote, CheckSquare, ArrowRight, AlertCircle, Database } from 'lucide-react';
import { INITIAL_TEACHERS } from '../data/initialData';

export const LoginView: React.FC = () => {
  const { users, loginAsAdmin, loginAsGuru, loginAsPetugas, supabaseStatus, setIsSupabaseModalOpen } = useApp();

  // Get active teachers from master users
  const teachers = users.filter((u) => u.role_id === 2);
  const teacherNames = teachers.map((t) => t.full_name);

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [teacherName, setTeacherName] = useState(teacherNames[0] || '');
  const [petugasUsername, setPetugasUsername] = useState('petugas.seleksi');
  const [petugasPassword, setPetugasPassword] = useState('seleksi123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'seleksi') {
      setPetugasUsername('petugas.seleksi');
      setPetugasPassword('seleksi123');
    } else if (role === 'pemilihan') {
      setPetugasUsername('petugas.pemilihan');
      setPetugasPassword('pemilihan123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedRole === 'admin') {
      if (adminUsername.trim() !== 'admin') {
        setErrorMsg('Username admin tidak cocok.');
        return;
      }
      const success = loginAsAdmin(adminPassword);
      if (!success) {
        setErrorMsg('Kata sandi admin salah. Gunakan: admin123');
      }
    } else if (selectedRole === 'guru') {
      if (!teacherName.trim()) {
        setErrorMsg('Silakan masukkan atau pilih nama lengkap guru.');
        return;
      }
      const success = loginAsGuru(teacherName);
      if (!success) {
        setErrorMsg('Nama guru tidak ditemukan dalam data master.');
      }
    } else if (selectedRole === 'seleksi') {
      const success = loginAsPetugas(petugasUsername, petugasPassword, 'seleksi');
      if (!success) {
        setErrorMsg('Username atau password petugas seleksi tidak cocok.');
      }
    } else if (selectedRole === 'pemilihan') {
      const success = loginAsPetugas(petugasUsername, petugasPassword, 'pemilihan');
      if (!success) {
        setErrorMsg('Username atau password petugas pemilihan tidak cocok.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Brand Header */}
      <div className="text-center mb-6 max-w-md flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-xl shadow-slate-950/50 mb-3 border border-slate-700/40 flex items-center justify-center">
          <AlMuttaqinLogo size="custom" className="w-16 h-16" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          SMP Al Muttaqin Kota Madiun
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Sistem Pemilihan Ketua & Wakil Ketua OSIS
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Role Selector Header */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/80 p-1 gap-1">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all ${
              selectedRole === 'admin'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
            <span className="truncate w-full text-center">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('guru')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all ${
              selectedRole === 'guru'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 mb-1 text-indigo-600" />
            <span className="truncate w-full text-center">Guru</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('seleksi')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all ${
              selectedRole === 'seleksi'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Vote className="w-4 h-4 mb-1 text-amber-600" />
            <span className="truncate w-full text-center">Seleksi</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('pemilihan')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all ${
              selectedRole === 'pemilihan'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-1 text-rose-600" />
            <span className="truncate w-full text-center">Pemilihan</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              {selectedRole === 'admin' && 'Masuk Sebagai Administrator'}
              {selectedRole === 'guru' && 'Masuk Sebagai Dewan Guru'}
              {selectedRole === 'seleksi' && 'Masuk Petugas Bilik Seleksi'}
              {selectedRole === 'pemilihan' && 'Masuk Petugas Bilik Pemilihan'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedRole === 'admin' && 'Akses penuh tanpa terkecuali ke seluruh menu dan pengaturan sistem.'}
              {selectedRole === 'guru' && 'Bisa melihat semua menu (Pleno, Dasbor, Hasil Rekap) kecuali menu administratif.'}
              {selectedRole === 'seleksi' && 'Hanya bisa membuka menu bilik seleksi (tidak bisa melihat hasilnya).'}
              {selectedRole === 'pemilihan' && 'Hanya bisa membuka menu bilik suara (tidak bisa melihat hasilnya).'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {selectedRole === 'admin' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Admin
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    placeholder="••••••••"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default: admin123</p>
                </div>
              </>
            )}

            {selectedRole === 'guru' && (
              <>
                {teacherNames.length === 0 ? (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1.5">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Belum Ada Data Dewan Guru di Database</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Database saat ini masih kosong. Silakan masuk sebagai <strong>Administrator</strong> (default: admin / admin123) untuk menambahkan data guru melalui menu "Kelola Data Dewan Guru".
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap Guru (Sesuai Data Master)
                      </label>
                      <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        required
                        list="teacher-list"
                        className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ketik atau pilih nama guru..."
                      />
                      <datalist id="teacher-list">
                        {teacherNames.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Guru masuk tanpa password, sistem mencocokkan nama dengan master guru.
                      </p>
                    </div>

                    {/* Quick teacher selector chips */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
                        Pilih Cepat Guru Terdaftar:
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {teacherNames.slice(0, 6).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTeacherName(t)}
                            className={`text-[11px] px-2 py-1 rounded border transition-colors text-left ${
                              teacherName === t
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {t.split('(')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {(selectedRole === 'seleksi' || selectedRole === 'pemilihan') && (
              <>
                {users.filter((u) => u.role_id === (selectedRole === 'seleksi' ? 3 : 4)).length === 0 && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1.5 mb-3">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Belum Ada Akun Petugas {selectedRole === 'seleksi' ? 'Seleksi' : 'Bilik Pemilihan'}</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Database saat ini belum memiliki akun petugas {selectedRole === 'seleksi' ? 'seleksi' : 'pemilihan'}. Silakan masuk sebagai <strong>Administrator</strong> untuk membuat akun petugas melalui menu "Kelola Akun Petugas".
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Petugas
                  </label>
                  <input
                    type="text"
                    value={petugasUsername}
                    onChange={(e) => setPetugasUsername(e.target.value)}
                    required
                    className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi Petugas
                  </label>
                  <input
                    type="password"
                    value={petugasPassword}
                    onChange={(e) => setPetugasPassword(e.target.value)}
                    required
                    className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Default: {selectedRole === 'seleksi' ? 'seleksi123' : 'pemilihan123'}
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Supabase Connection Status Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Database Supabase:</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{supabaseStatus?.isConnected ? '🟢 Terhubung (PostgreSQL)' : '🟡 Cek Status Database'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
