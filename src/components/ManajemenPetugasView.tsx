import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Plus, Trash2, X } from 'lucide-react';
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
} from '../lib/sweetalert';

export const ManajemenPetugasView: React.FC = () => {
  const { users, roles, addPetugas, deletePetugas } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<3 | 4>(3);

  // Filter operator users (Role 3 & 4)
  const operatorUsers = users.filter((u) => u.role_id === 3 || u.role_id === 4);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !password.trim()) {
      showErrorAlert('Data Tidak Lengkap', 'Silakan isi username, nama lengkap, dan kata sandi petugas.');
      return;
    }

    // Check username collision
    if (users.some((u) => u.username?.toLowerCase() === username.trim().toLowerCase())) {
      showErrorAlert('Username Terpakai', 'Username tersebut sudah digunakan oleh akun lain.');
      return;
    }

    const enteredFullName = fullName.trim();
    await addPetugas(username.trim(), enteredFullName, password.trim(), roleId);
    showSuccessAlert('Akun Petugas Dibuat!', `Akun untuk "${enteredFullName}" berhasil didaftarkan.`, 2500);
    setUsername('');
    setFullName('');
    setPassword('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Hak Akses & Otorisasi
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Manajemen Akun Petugas Seleksi & Pemilihan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin membuat dan mengelola akun operator khusus untuk bilik suara tahap seleksi dan bilik pemilihan utama.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Akun Petugas Baru</span>
        </button>
      </div>

      {/* Add Modal/Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-5 rounded-xl border border-emerald-300 ring-2 ring-emerald-500/10 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pembuatan Akun Petugas Baru
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peran Petugas
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value) as 3 | 4)}
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={3}>Petugas Tahap Seleksi (Role 3)</option>
                <option value={4}>Petugas Bilik Pemilihan (Role 4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Petugas
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Contoh: Petugas Bilik Suara 2"
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Login
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Contoh: bilik.suara2"
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Terbitkan Akun
            </button>
          </div>
        </form>
      )}

      {/* Operator Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Daftar Akun Petugas Aktif
          </h4>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {operatorUsers.length} Akun Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-12">No</th>
                <th className="py-2.5 px-4 font-semibold">Nama Petugas</th>
                <th className="py-2.5 px-4 font-semibold">Username</th>
                <th className="py-2.5 px-4 font-semibold">Peran Akses</th>
                <th className="py-2.5 px-4 font-semibold">Kata Sandi</th>
                <th className="py-2.5 px-4 font-semibold text-right w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operatorUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada akun petugas di database. Klik "Tambah Akun Petugas" untuk membuat akun baru.
                  </td>
                </tr>
              ) : (
                operatorUsers.map((user, idx) => {
                const roleName = roles.find((r) => r.id === user.role_id)?.name;
                const isSeleksi = user.role_id === 3;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{user.full_name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{user.username}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                          isSeleksi
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isSeleksi ? 'Petugas Tahap Seleksi' : 'Petugas Bilik Pemilihan'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {user.password || '••••••••'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          const isConfirmed = await showConfirmDialog(
                            'Hapus Akun Petugas?',
                            `Yakin ingin menghapus akun petugas "${user.full_name}" (${user.username})? Petugas tidak dapat login kembali.`,
                            'Ya, Hapus',
                            'Batal'
                          );
                          if (isConfirmed) {
                            await deletePetugas(user.id);
                            showSuccessAlert('Akun Dihapus', `Akun petugas "${user.full_name}" berhasil dihapus.`, 2000);
                          }
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
