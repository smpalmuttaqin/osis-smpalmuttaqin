import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SelectionCandidate } from '../types/database';
import {
  Award,
  UserPlus,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  Layers,
  Info,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const KandidatSeleksiView: React.FC = () => {
  const {
    students,
    classes,
    selectionCandidates,
    addSelectionCandidate,
    addStudentAsSelectionCandidate,
    updateSelectionCandidate,
    deleteSelectionCandidate,
    bulkAddSelectionCandidates,
    resetSelectionCandidates,
    getClassById,
    getStudentById,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRombel, setFilterRombel] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<'all' | '7' | '8'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'existing' | 'bulk' | 'new'>('existing');

  // Single Add Form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');

  // New Student Form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClassId, setNewStudentClassId] = useState<number>(classes[0]?.id || 1);

  // Bulk Add Form
  const [bulkClassId, setBulkClassId] = useState<number>(classes[0]?.id || 1);
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([]);

  // Edit Modal State
  const [editingCandidate, setEditingCandidate] = useState<SelectionCandidate | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Grade 7 & 8 classes (eligible candidate classes)
  const eligibleClasses = useMemo(() => {
    return classes.filter((c) => c.grade === 7 || c.grade === 8);
  }, [classes]);

  // Set of registered candidate student IDs
  const registeredStudentIds = useMemo(() => {
    return new Set(selectionCandidates.map((c) => c.student_id));
  }, [selectionCandidates]);

  // Available students for single add (Grade 7 & 8 not yet added)
  const availableStudentsForAdd = useMemo(() => {
    return students.filter((s) => {
      const cls = getClassById(s.class_id);
      if (!cls || (cls.grade !== 7 && cls.grade !== 8)) return false;
      return !registeredStudentIds.has(s.id);
    });
  }, [students, getClassById, registeredStudentIds]);

  // Available students for bulk add in selected class
  const availableStudentsInBulkClass = useMemo(() => {
    return students.filter((s) => {
      return s.class_id === bulkClassId && !registeredStudentIds.has(s.id);
    });
  }, [students, bulkClassId, registeredStudentIds]);

  // Candidates list mapped with student and class info
  const enrichedCandidates = useMemo(() => {
    return selectionCandidates.map((cand) => {
      const student = getStudentById(cand.student_id);
      const kelas = student ? getClassById(student.class_id) : undefined;
      return {
        ...cand,
        student,
        kelas,
      };
    });
  }, [selectionCandidates, getStudentById, getClassById]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return enrichedCandidates.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.student?.full_name.toLowerCase().includes(query);
        const notesMatch = item.notes?.toLowerCase().includes(query);
        const rombelMatch = item.kelas?.rombel.toLowerCase().includes(query);
        if (!nameMatch && !notesMatch && !rombelMatch) return false;
      }

      // Filter Rombel
      if (filterRombel !== 'all') {
        if (!item.kelas || item.kelas.rombel !== filterRombel) return false;
      }

      // Filter Grade
      if (filterGrade !== 'all') {
        const targetGrade = parseInt(filterGrade, 10);
        if (!item.kelas || item.kelas.grade !== targetGrade) return false;
      }

      // Filter Status
      if (filterStatus === 'active' && !item.is_active) return false;
      if (filterStatus === 'inactive' && item.is_active) return false;

      return true;
    });
  }, [enrichedCandidates, searchQuery, filterRombel, filterGrade, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = selectionCandidates.length;
    const active = selectionCandidates.filter((c) => c.is_active).length;
    const grade8Count = enrichedCandidates.filter((c) => c.kelas?.grade === 8 && c.is_active).length;
    const grade7Count = enrichedCandidates.filter((c) => c.kelas?.grade === 7 && c.is_active).length;

    // By Rombel
    const countsByRombel: Record<string, number> = { '7A': 0, '7B': 0, '8A': 0, '8B': 0 };
    enrichedCandidates.forEach((c) => {
      if (c.kelas && countsByRombel[c.kelas.rombel] !== undefined && c.is_active) {
        countsByRombel[c.kelas.rombel]++;
      }
    });

    return { total, active, grade8Count, grade7Count, countsByRombel };
  }, [selectionCandidates, enrichedCandidates]);

  // Handle Single Add
  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showNotification('error', 'Mohon pilih santri terlebih dahulu.');
      return;
    }

    const res = await addSelectionCandidate(selectedStudentId, candidateNotes);
    if (res.success) {
      showNotification('success', 'Bakal calon berhasil ditambahkan ke database.');
      setSelectedStudentId('');
      setCandidateNotes('');
      setIsAddModalOpen(false);
    } else {
      showNotification('error', res.error || 'Gagal menambahkan bakal calon.');
    }
  };

  // Handle New Student Add
  const handleNewStudentAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      showNotification('error', 'Nama santri tidak boleh kosong.');
      return;
    }

    const res = await addStudentAsSelectionCandidate(newStudentName, newStudentClassId, candidateNotes);
    if (res.success) {
      showNotification('success', `Santri "${newStudentName.trim()}" berhasil didaftarkan dan dimasukkan ke daftar bakal calon database.`);
      setNewStudentName('');
      setCandidateNotes('');
      setIsAddModalOpen(false);
    } else {
      showNotification('error', res.error || 'Gagal mendaftarkan santri baru.');
    }
  };

  // Handle Bulk Add
  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSelectedStudentIds.length === 0) {
      showNotification('error', 'Pilih minimal satu santri untuk ditambahkan.');
      return;
    }

    const res = await bulkAddSelectionCandidates(bulkSelectedStudentIds);
    showNotification('success', `Berhasil menambahkan ${res.addedCount} santri sebagai bakal calon ke database.`);
    setBulkSelectedStudentIds([]);
    setIsAddModalOpen(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    await updateSelectionCandidate(editingCandidate.id, {
      notes: editNotes.trim(),
      is_active: editIsActive,
    });

    showNotification('success', 'Data bakal calon berhasil diperbarui di database.');
    setEditingCandidate(null);
  };

  // Handle Delete Candidate
  const handleDeleteCandidate = async (candId: string, studentName?: string) => {
    if (confirm(`Hapus "${studentName || 'Bakal calon'}" dari daftar kandidat seleksi? (Data siswa tetap aman di database siswa).`)) {
      await deleteSelectionCandidate(candId);
      showNotification('success', 'Kandidat berhasil dihapus dari daftar seleksi database.');
    }
  };

  // Handle Reset to Default
  const handleResetToDefault = async () => {
    if (confirm('Muat ulang daftar kandidat bakal calon ke rekomendasi standar (12 kandidat terbagi rata di 7A, 7B, 8A, 8B)?')) {
      await resetSelectionCandidates();
      showNotification('success', 'Daftar bakal calon berhasil dimuat ulang ke setelan default dan disimpan ke database.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Khusus Administrator
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {stats.active} Aktif dari {stats.total} Terdaftar
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            Kandidat Bakal Calon OSIS (Tahap Seleksi)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-2xl">
            Nama santri yang didaftarkan oleh admin di menu ini adalah <strong>satu-satunya pilihan</strong> yang akan tampil di dropdown <em>Bilik Seleksi (Tahap 1)</em> sesuai aturan rombel.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            title="Muat ulang daftar kandidat rekomendasi default"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Muat Rekomendasi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddMode('existing');
              if (availableStudentsForAdd.length > 0) {
                setSelectedStudentId(availableStudentsForAdd[0].id);
              }
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kandidat</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded-md">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Bakal Calon</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.active}
            </span>
            <span className="text-[11px] text-slate-400">kandidat aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Santri Kelas 8</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {stats.grade8Count}
            </span>
            <span className="text-[11px] text-slate-400">kandidat aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Santri Kelas 7</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
              {stats.grade7Count}
            </span>
            <span className="text-[11px] text-slate-400">kandidat aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sebaran Rombel</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {['7A', '7B', '8A', '8B'].map((rombel) => (
              <span
                key={rombel}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
              >
                {rombel}: {stats.countsByRombel[rombel] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Guideline Card */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-emerald-950">
            Panduan Sinkronisasi Bakal Calon ke Bilik Seleksi:
          </p>
          <p className="text-emerald-900 leading-relaxed text-[11px]">
            1. Setiap siswa di Bilik Seleksi hanya dapat memilih 3 nama santri yang <strong>terdaftar aktif</strong> pada tabel di bawah ini.<br />
            2. Aturan seleksi rombel berjalan otomatis: Pemilih dari rombel A (7A/8A/9A) hanya dapat memilih kandidat dari rombel A (7A & 8A), dan pemilih rombel B (7B/8B/9B) hanya dari rombel B (7B & 8B).<br />
            3. Pastikan minimal terdapat 2–3 kandidat terdaftar pada masing-masing rombel (7A, 7B, 8A, dan 8B).
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama santri, catatan profil, atau kelas..."
              className="w-full text-xs bg-slate-50 text-slate-900 pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Rombel */}
          <div>
            <select
              value={filterRombel}
              onChange={(e) => setFilterRombel(e.target.value)}
              className="w-full text-xs bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Rombel (7 & 8)</option>
              <option value="7A">Kelas 7A</option>
              <option value="7B">Kelas 7B</option>
              <option value="8A">Kelas 8A</option>
              <option value="8B">Kelas 8B</option>
            </select>
          </div>

          {/* Filter Grade */}
          <div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value as any)}
              className="w-full text-xs bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Tingkat</option>
              <option value="8">Tingkat Kelas 8</option>
              <option value="7">Tingkat Kelas 7</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Bakal Calon Terdaftar ({filteredCandidates.length})
            </h3>
          </div>
          {filteredCandidates.length < selectionCandidates.length && (
            <span className="text-[11px] text-slate-500">
              Menampilkan {filteredCandidates.length} dari {selectionCandidates.length} total kandidat
            </span>
          )}
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Tidak ada kandidat yang cocok</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Coba sesuaikan kata kunci pencarian atau filter rombel yang dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterRombel('all');
                setFilterGrade('all');
                setFilterStatus('all');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-block"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Santri Bakal Calon</th>
                  <th className="py-3 px-4 w-32">Kelas & Rombel</th>
                  <th className="py-3 px-4">Profil Singkat / Catatan Prestasi</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((cand, idx) => {
                  const studentName = cand.student?.full_name || 'Santri Tidak Ditemukan';
                  const rombel = cand.kelas?.rombel || '-';
                  const grade = cand.kelas?.grade || '-';

                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !cand.is_active ? 'opacity-50 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              grade === 8
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {studentName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{studentName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: {cand.student_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                          Kelas {rombel}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Tingkat {grade}
                        </span>
                      </td>

                      {/* Notes / Profile */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-600 text-xs line-clamp-2 max-w-lg">
                          {cand.notes || <span className="italic text-slate-400">Tidak ada catatan</span>}
                        </p>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            updateSelectionCandidate(cand.id, { is_active: !cand.is_active });
                            showNotification(
                              'success',
                              `Status kandidat "${studentName}" diubah menjadi ${!cand.is_active ? 'Aktif' : 'Nonaktif'}.`
                            );
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            cand.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {cand.is_active ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-slate-500" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCandidate(cand);
                              setEditNotes(cand.notes || '');
                              setEditIsActive(cand.is_active);
                            }}
                            title="Edit Bakal Calon"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCandidate(cand.id, cand.student?.full_name)}
                            title="Hapus dari Daftar Bakal Calon"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah Bakal Calon */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Kandidat Bakal Calon</h3>
                  <p className="text-xs text-slate-500">
                    Daftarkan santri kelas 7 atau 8 sebagai opsi pilihan di Bilik Seleksi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="px-6 pt-4 border-b border-slate-100 flex items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddMode('existing')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  addMode === 'existing'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Pilih dari Data Siswa
              </button>
              <button
                type="button"
                onClick={() => setAddMode('bulk')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  addMode === 'bulk'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Pilih Massal per Rombel
              </button>
              <button
                type="button"
                onClick={() => setAddMode('new')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  addMode === 'new'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Daftarkan Santri Baru
              </button>
            </div>

            {/* Modal Content Form */}
            <div className="p-6">
              {/* Mode 1: Pilih dari Data Siswa */}
              {addMode === 'existing' && (
                <form onSubmit={handleSingleAdd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Santri (Kelas 7 & 8 Belum Terdaftar)
                    </label>
                    {availableStudentsForAdd.length === 0 ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                        Seluruh santri kelas 7 dan 8 sudah terdaftar sebagai kandidat.
                      </div>
                    ) : (
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        required
                        className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- Pilih Nama Santri --</option>
                        {availableStudentsForAdd.map((s) => {
                          const kls = getClassById(s.class_id);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.full_name} - Kelas {kls?.rombel} (Tingkat {kls?.grade})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Catatan / Profil Singkat / Prestasi (Opsional)
                    </label>
                    <textarea
                      value={candidateNotes}
                      onChange={(e) => setCandidateNotes(e.target.value)}
                      rows={3}
                      placeholder="Contoh: Hafalan Quran 2 Juz, aktif di Pramuka & PMR, berwibawa..."
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedStudentId}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs"
                    >
                      Simpan Bakal Calon
                    </button>
                  </div>
                </form>
              )}

              {/* Mode 2: Bulk Add */}
              {addMode === 'bulk' && (
                <form onSubmit={handleBulkAdd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Rombel Kelas
                    </label>
                    <select
                      value={bulkClassId}
                      onChange={(e) => {
                        const cid = Number(e.target.value);
                        setBulkClassId(cid);
                        setBulkSelectedStudentIds([]);
                      }}
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    >
                      {eligibleClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          Kelas {c.rombel} (Tingkat {c.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Centang Santri yang Ingin Ditambahkan ({availableStudentsInBulkClass.length} tersedia)
                      </label>
                      {availableStudentsInBulkClass.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (bulkSelectedStudentIds.length === availableStudentsInBulkClass.length) {
                              setBulkSelectedStudentIds([]);
                            } else {
                              setBulkSelectedStudentIds(availableStudentsInBulkClass.map((s) => s.id));
                            }
                          }}
                          className="text-[11px] text-emerald-700 hover:underline font-semibold"
                        >
                          {bulkSelectedStudentIds.length === availableStudentsInBulkClass.length
                            ? 'Batal Pilih Semua'
                            : 'Pilih Semua'}
                        </button>
                      )}
                    </div>

                    <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50">
                      {availableStudentsInBulkClass.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Semua santri di kelas ini sudah terdaftar sebagai kandidat.
                        </div>
                      ) : (
                        availableStudentsInBulkClass.map((s) => {
                          const checked = bulkSelectedStudentIds.includes(s.id);
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                checked ? 'bg-emerald-50 text-emerald-950 border border-emerald-200' : 'hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setBulkSelectedStudentIds((prev) => [...prev, s.id]);
                                  } else {
                                    setBulkSelectedStudentIds((prev) => prev.filter((id) => id !== s.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-xs font-semibold">{s.full_name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={bulkSelectedStudentIds.length === 0}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs"
                    >
                      Tambahkan {bulkSelectedStudentIds.length} Kandidat
                    </button>
                  </div>
                </form>
              )}

              {/* Mode 3: Daftarkan Santri Baru Langsung */}
              {addMode === 'new' && (
                <form onSubmit={handleNewStudentAdd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap Santri
                    </label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      required
                      placeholder="Contoh: Ahmad Raihan Saputra"
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kelas & Rombel
                    </label>
                    <select
                      value={newStudentClassId}
                      onChange={(e) => setNewStudentClassId(Number(e.target.value))}
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    >
                      {eligibleClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          Kelas {c.rombel} (Tingkat {c.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Catatan / Profil Singkat (Opsional)
                    </label>
                    <textarea
                      value={candidateNotes}
                      onChange={(e) => setCandidateNotes(e.target.value)}
                      rows={3}
                      placeholder="Contoh: Prestasi bidang akademik dan aktif di kegiatan tahfidz."
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!newStudentName.trim()}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs"
                    >
                      Daftarkan & Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Bakal Calon */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Edit Data Bakal Calon</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Santri
                </label>
                <input
                  type="text"
                  disabled
                  value={getStudentById(editingCandidate.student_id)?.full_name || 'Santri'}
                  className="w-full text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-lg p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Profil Singkat / Catatan Prestasi
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Catatan prestasi santri..."
                  className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Status Keikutsertaan</span>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    editIsActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {editIsActive ? 'Aktif di Bilik Seleksi' : 'Nonaktif (Disembunyikan)'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
