import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Upload,
} from 'lucide-react';
import { ExcelImportModal } from './ExcelImportModal';
import { downloadExcelTemplate } from '../lib/excelImporter';

export const ManajemenDataView: React.FC = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent, getClassById } = useApp();

  const [filterRombel, setFilterRombel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClassId, setNewClassId] = useState<number>(classes[0]?.id || 1);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editClassId, setEditClassId] = useState<number>(1);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const kls = getClassById(s.class_id);
      if (filterRombel !== 'all' && kls?.rombel !== filterRombel) return false;
      if (searchQuery && !s.full_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [students, filterRombel, searchQuery, getClassById]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addStudent(newName.trim(), newClassId);
    setNewName('');
    setIsAdding(false);
  };

  const handleStartEdit = (studentId: string, currentName: string, currentClassId: number) => {
    setEditingId(studentId);
    setEditName(currentName);
    setEditClassId(currentClassId);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    updateStudent(editingId, editName.trim(), editClassId);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Master Data Sekolah
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Manajemen Data Siswa & Rombel Kelas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data siswa dan rombel kelas. Anda dapat menginput manual atau mengimpor file Excel secara massal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
            title="Unduh Format Spreadsheet (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Format Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import dari Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner with Quick Import CTA */}
      {students.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Database Siswa Saat Ini Masih Kosong</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed max-w-xl">
                Unggah data seluruh siswa dan kelas secara otomatis menggunakan template Excel, atau tambahkan siswa satu per satu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Template</span>
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAddStudent}
          className="bg-white p-5 rounded-xl border border-emerald-300 ring-2 ring-emerald-500/10 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Input Siswa Baru
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="Contoh: Muhammad Rizky Pratama"
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rombel Kelas
              </label>
              <select
                value={newClassId}
                onChange={(e) => setNewClassId(Number(e.target.value))}
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.rombel} (Tingkat {c.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
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
              Simpan Siswa
            </button>
          </div>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa..."
                className="w-full text-xs bg-white text-slate-900 pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterRombel}
              onChange={(e) => setFilterRombel(e.target.value)}
              className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Rombel (Kelas 7, 8, 9)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.rombel}>
                  Kelas {c.rombel}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
            Total <strong>{filteredStudents.length}</strong> Siswa
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-12">No</th>
                <th className="py-2.5 px-4 font-semibold">Nama Lengkap Siswa</th>
                <th className="py-2.5 px-4 font-semibold">Rombel</th>
                <th className="py-2.5 px-4 font-semibold text-right w-32">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data siswa di database. Klik "Tambah Siswa Baru" untuk menambahkan siswa.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                const isEditing = editingId === student.id;
                const kls = getClassById(student.class_id);

                if (isEditing) {
                  return (
                    <tr key={student.id} className="bg-emerald-50/40">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-xs bg-white border border-emerald-400 rounded px-2 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={editClassId}
                          onChange={(e) => setEditClassId(Number(e.target.value))}
                          className="text-xs bg-white border border-emerald-400 rounded px-2 py-1"
                        >
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              Kelas {c.rombel}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                            title="Simpan"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{student.full_name}</td>
                    <td className="py-2.5 px-4 text-slate-600">Kelas {kls?.rombel} (Tingkat {kls?.grade})</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(student.id, student.full_name, student.class_id)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Ubah Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus siswa "${student.full_name}"?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
