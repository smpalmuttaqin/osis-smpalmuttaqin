import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types/database';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  X,
  LogIn,
  Info,
  Building2,
  BookOpen,
} from 'lucide-react';

export const ManajemenGuruView: React.FC = () => {
  const { users, addTeacher, updateTeacher, deleteTeacher, loginAsGuru, plenoEvaluations } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [titleOrSubject, setTitleOrSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editFullName, setEditFullName] = useState('');

  // Filter teachers (role_id === 2)
  const teachers = users.filter((u) => u.role_id === 2);

  const filteredTeachers = teachers.filter((t) =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    // Check duplicate
    const checkName = fullName.trim().toLowerCase();
    if (teachers.some((t) => t.full_name.toLowerCase().includes(checkName))) {
      alert('Nama guru dengan kemiripan tersebut sudah terdaftar.');
      return;
    }

    addTeacher(fullName.trim(), titleOrSubject.trim());
    setFullName('');
    setTitleOrSubject('');
    setIsAdding(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editFullName.trim()) return;

    updateTeacher(editingTeacher.id, editFullName.trim());
    setEditingTeacher(null);
    setEditFullName('');
  };

  const handleDelete = (teacher: User) => {
    if (
      confirm(
        `Yakin ingin menghapus data "${teacher.full_name}" dari daftar Dewan Guru?\nGuru bersangkutan tidak akan dapat login lagi ke Musyawarah Pleno.`
      )
    ) {
      deleteTeacher(teacher.id);
    }
  };

  const handleQuickLogin = (teacher: User) => {
    const success = loginAsGuru(teacher.full_name);
    if (!success) {
      alert('Gagal melakukan login otomatis.');
    }
  };

  // Check how many teachers have participated in pleno
  const participatingTeacherIds = new Set(plenoEvaluations.map((pe) => pe.teacher_user_id));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Data Master & Otorisasi
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Manajemen Data Dewan Guru
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar Dewan Guru SMP Al Muttaqin Kota Madiun yang berwenang memberikan evaluasi pada Tahap 2: Musyawarah Pleno.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingTeacher(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 self-start md:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Guru Baru</span>
        </button>
      </div>

      {/* Info Notice Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-950">
            Mekanisme Login Dewan Guru (Autentikasi Berbasis Nama)
          </h4>
          <p className="text-indigo-800 leading-relaxed">
            Guru di SMP Al Muttaqin <strong>tidak memerlukan kata sandi</strong> untuk masuk. Saat login, sistem mencocokkan input nama dengan data master di bawah ini. Guru yang terdaftar langsung dapat mengakses halaman <strong>Tahap 2: Musyawarah Pleno</strong> untuk menuliskan catatan dan menandai 6 kandidat terbaik.
          </p>
        </div>
      </div>

      {/* Add New Teacher Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-5 rounded-xl border border-emerald-300 ring-2 ring-emerald-500/10 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pendaftaran Dewan Guru Baru
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Contoh: Ustadz M. Ridwan, M.Pd."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Nama ini yang akan diketik/dipilih oleh guru saat masuk ke sistem.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan / Mata Pelajaran (Opsional)
              </label>
              <input
                type="text"
                value={titleOrSubject}
                onChange={(e) => setTitleOrSubject(e.target.value)}
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Contoh: Waka Kurikulum / Guru Bahasa Arab"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Akan ditampilkan dalam tanda kurung sebagai keterangan tambahan.
              </p>
            </div>
          </div>

          {fullName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500 text-[11px] block">Pratinjau Format Terdaftar:</span>
              <span className="font-semibold text-slate-900">
                {fullName.trim()} {titleOrSubject.trim() ? `(${titleOrSubject.trim()})` : ''}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              Simpan Data Guru
            </button>
          </div>
        </form>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <form
          onSubmit={handleUpdate}
          className="bg-white p-5 rounded-xl border border-indigo-300 ring-2 ring-indigo-500/10 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ubah Data Guru
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setEditingTeacher(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Keterangan Guru
            </label>
            <input
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              required
              className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingTeacher(null)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              Perbarui Data
            </button>
          </div>
        </form>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
              Total Dewan Guru
            </span>
            <span className="text-xl font-bold text-slate-900">{teachers.length} Guru</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
              Akses Hak Pleno
            </span>
            <span className="text-xl font-bold text-indigo-600">100% Aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
              Telah Berpartisipasi
            </span>
            <span className="text-xl font-bold text-amber-600">
              {participatingTeacherIds.size} Guru
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama guru atau mata pelajaran..."
          className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Reset
          </button>
        )}
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Dewan Guru SMP Al Muttaqin ({filteredTeachers.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">Role ID: 2 (Guru)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">No</th>
                <th className="px-5 py-3">Nama Lengkap & Gelar</th>
                <th className="px-5 py-3">ID Pengguna</th>
                <th className="px-5 py-3">Status Hak Akses</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                    {teachers.length === 0
                      ? 'Belum ada data dewan guru di database. Klik "Tambah Guru Baru" untuk menambahkan.'
                      : 'Tidak ditemukan data guru yang cocok dengan pencarian.'}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, idx) => {
                  const hasParticipated = participatingTeacherIds.has(teacher.id);
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {teacher.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {teacher.full_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Otoritas: Evaluasi Catatan & Seleksi Paslon
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                        {teacher.id}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Musyawarah Pleno</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleQuickLogin(teacher)}
                            title="Simulasi Masuk sebagai Guru Ini ke Pleno"
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors font-medium border border-emerald-200"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Simulasi Masuk</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingTeacher(teacher);
                              setEditFullName(teacher.full_name);
                              setIsAdding(false);
                            }}
                            title="Ubah nama"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            title="Hapus guru"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Query Reference */}
      <div className="bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-emerald-400 font-mono text-[11px]">
            SINKRONISASI DATABASE SUPABASE POSTGRESQL & LARAVEL
          </span>
          <span className="text-slate-500 font-mono text-[10px]">Tabel: users (role_id = 2)</span>
        </div>
        <p className="text-slate-400 text-xs">
          Di lingkungan produksi Laravel, penambahan guru ini setara dengan menjalankan query SQL:
        </p>
        <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto">
          <code>{`INSERT INTO users (id, full_name, role_id, created_at)
VALUES (gen_random_uuid(), 'Nama Lengkap Guru, Gelar (Jabatan)', 2, NOW());`}</code>
        </pre>
      </div>
    </div>
  );
};
