import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Check, AlertCircle, Search, Vote } from 'lucide-react';

export const SeleksiView: React.FC = () => {
  const {
    students,
    classes,
    hasStudentVotedSelection,
    castSelectionVote,
    getClassById,
  } = useApp();

  // Voter State
  const [selectedVoterClassId, setSelectedVoterClassId] = useState<number>(classes[0]?.id || 1);
  const [voterSearch, setVoterSearch] = useState('');
  const [selectedVoterId, setSelectedVoterId] = useState<string>('');

  // 3 Nominees state (Must be from Grade 7 or 8)
  const [nominee1, setNominee1] = useState<string>('');
  const [nominee2, setNominee2] = useState<string>('');
  const [nominee3, setNominee3] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedVoter = students.find((s) => s.id === selectedVoterId);
  const selectedVoterClass = selectedVoter ? getClassById(selectedVoter.class_id) : undefined;
  const selectedVoterHasVoted = selectedVoter ? hasStudentVotedSelection(selectedVoter.id) : false;

  // Extract rombel letter/group, e.g. "A" or "B"
  const voterRombelLetter = selectedVoterClass
    ? selectedVoterClass.rombel.replace(/^[0-9]+/, '').trim().toUpperCase()
    : '';

  // Voters list for selected class
  const classVoters = useMemo(() => {
    return students.filter((s) => s.class_id === selectedVoterClassId);
  }, [students, selectedVoterClassId]);

  const filteredClassVoters = useMemo(() => {
    if (!voterSearch.trim()) return classVoters;
    return classVoters.filter((s) =>
      s.full_name.toLowerCase().includes(voterSearch.toLowerCase())
    );
  }, [classVoters, voterSearch]);

  // Pools filtered strictly according to validation rules:
  const pool1 = useMemo(() => {
    if (!selectedVoterClass) return [];
    if (selectedVoterClass.grade === 7 || selectedVoterClass.grade === 8) {
      // Pilihan 1: wajib dari kelasnya sendiri
      return students.filter((s) => s.class_id === selectedVoterClass.id);
    }
    // Kelas 9: bebas kelas 7 & 8, tetapi HANYA rombel yang sama (9A -> 7A/8A, 9B -> 7B/8B)
    return students.filter((s) => {
      const k = getClassById(s.class_id);
      if (!k || (k.grade !== 7 && k.grade !== 8)) return false;
      const r = k.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();
      return r === voterRombelLetter;
    });
  }, [selectedVoterClass, students, getClassById, voterRombelLetter]);

  const pool2 = useMemo(() => {
    if (!selectedVoterClass) return [];
    if (selectedVoterClass.grade === 7 || selectedVoterClass.grade === 8) {
      // Pilihan 2: wajib dari kelasnya sendiri
      return students.filter((s) => s.class_id === selectedVoterClass.id);
    }
    // Kelas 9: bebas kelas 7 & 8, tetapi HANYA rombel yang sama (9A -> 7A/8A, 9B -> 7B/8B)
    return students.filter((s) => {
      const k = getClassById(s.class_id);
      if (!k || (k.grade !== 7 && k.grade !== 8)) return false;
      const r = k.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();
      return r === voterRombelLetter;
    });
  }, [selectedVoterClass, students, getClassById, voterRombelLetter]);

  const pool3 = useMemo(() => {
    if (!selectedVoterClass) return [];
    if (selectedVoterClass.grade === 7) {
      // Pilihan 3: wajib dari kelas atasnya (kelas 8 sesuai rombel)
      return students.filter((s) => {
        const k = getClassById(s.class_id);
        if (!k || k.grade !== 8) return false;
        const r = k.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();
        return r === voterRombelLetter;
      });
    }
    if (selectedVoterClass.grade === 8) {
      // Pilihan 3: wajib dari kelas bawahnya (kelas 7 sesuai rombel)
      return students.filter((s) => {
        const k = getClassById(s.class_id);
        if (!k || k.grade !== 7) return false;
        const r = k.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();
        return r === voterRombelLetter;
      });
    }
    // Kelas 9: bebas kelas 7 & 8, tetapi HANYA rombel yang sama
    return students.filter((s) => {
      const k = getClassById(s.class_id);
      if (!k || (k.grade !== 7 && k.grade !== 8)) return false;
      const r = k.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();
      return r === voterRombelLetter;
    });
  }, [selectedVoterClass, students, getClassById, voterRombelLetter]);

  const handleVoterSelect = (voterId: string) => {
    setSelectedVoterId(voterId);
    setNominee1('');
    setNominee2('');
    setNominee3('');
    setNotification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!selectedVoterId) {
      setNotification({ type: 'error', message: 'Silakan pilih nama siswa pemilih terlebih dahulu.' });
      return;
    }

    if (!nominee1 || !nominee2 || !nominee3) {
      setNotification({ type: 'error', message: 'Harap pilih lengkap 3 nama bakal calon.' });
      return;
    }

    if (new Set([nominee1, nominee2, nominee3]).size !== 3) {
      setNotification({ type: 'error', message: '3 calon yang dipilih tidak boleh sama.' });
      return;
    }

    const res = castSelectionVote(selectedVoterId, [nominee1, nominee2, nominee3]);
    if (res.success) {
      setNotification({
        type: 'success',
        message: `Suara seleksi atas nama "${selectedVoter?.full_name}" berhasil disimpan.`,
      });
      // Reset choices for next student
      setSelectedVoterId('');
      setNominee1('');
      setNominee2('');
      setNominee3('');
    } else {
      setNotification({ type: 'error', message: res.error || 'Gagal menyimpan suara seleksi.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
        <Vote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-950">
            Ketentuan Tahap 1: Pemilihan Bakal Calon OSIS
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Seluruh siswa kelas 7, 8, dan 9 berhak memberikan suara dengan memilih <strong>3 nama siswa</strong> yang hanya berasal dari <strong>Kelas 7 dan Kelas 8</strong>. Tiga nama teratas dari tiap rombel (total 12 siswa) akan maju ke tahap Musyawarah Pleno Guru.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Siswa Pemilih */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Langkah 1: Identifikasi Siswa Pemilih
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih rombel kelas pemilih (7, 8, atau 9) dan pilih nama siswa
              </p>
            </div>
            {selectedVoter && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  selectedVoterHasVoted
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {selectedVoterHasVoted ? 'Sudah Memilih' : 'Hak Pilih Tersedia'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Kelas Pemilih
              </label>
              <select
                value={selectedVoterClassId}
                onChange={(e) => {
                  setSelectedVoterClassId(Number(e.target.value));
                  setSelectedVoterId('');
                }}
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.rombel} (Tingkat {c.grade})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cari & Pilih Nama Siswa
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={voterSearch}
                  onChange={(e) => setVoterSearch(e.target.value)}
                  placeholder="Ketik nama siswa untuk mempersempit daftar..."
                  className="w-full text-xs bg-white text-slate-900 pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
                />
              </div>

              <select
                value={selectedVoterId}
                onChange={(e) => handleVoterSelect(e.target.value)}
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="">-- Pilih Siswa Pemilih --</option>
                {filteredClassVoters.map((s) => {
                  const voted = hasStudentVotedSelection(s.id);
                  return (
                    <option key={s.id} value={s.id} disabled={voted}>
                      {s.full_name} {voted ? '(Sudah Memilih)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Tiga Bakal Calon yang Dipilih */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Langkah 2: Pilih 3 Nama Calon (Sensitif Rombel & Tingkat)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilihan difilter otomatis sesuai aturan pembatasan rombel dan komposisi tingkat kelas.
            </p>
          </div>

          {/* Dynamic Rule Guide Alert */}
          {selectedVoterClass ? (
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 text-xs text-indigo-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-indigo-950">
                <Vote className="w-4 h-4 text-indigo-600" />
                Aturan Pemilih Kelas {selectedVoterClass.rombel} (Rombel {voterRombelLetter}):
              </span>
              {selectedVoterClass.grade === 7 && (
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  • <strong>Pilihan 1 & 2:</strong> Wajib memilih siswa dari kelasnya sendiri (<strong>Kelas {selectedVoterClass.rombel}</strong>).<br />
                  • <strong>Pilihan 3:</strong> Wajib memilih siswa dari kelas atasnya (<strong>Kelas 8{voterRombelLetter}</strong>).
                </p>
              )}
              {selectedVoterClass.grade === 8 && (
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  • <strong>Pilihan 1 & 2:</strong> Wajib memilih siswa dari kelasnya sendiri (<strong>Kelas {selectedVoterClass.rombel}</strong>).<br />
                  • <strong>Pilihan 3:</strong> Wajib memilih siswa dari kelas bawahnya (<strong>Kelas 7{voterRombelLetter}</strong>).
                </p>
              )}
              {selectedVoterClass.grade === 9 && (
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  • <strong>Pilihan 1, 2, & 3:</strong> Bebas menentukan dari <strong>Kelas 7{voterRombelLetter}</strong> maupun <strong>Kelas 8{voterRombelLetter}</strong> (siswa kelas 9 tidak dapat dicalonkan).
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
              Silakan pilih siswa pemilih pada Langkah 1 terlebih dahulu untuk memuat daftar calon yang sesuai aturan rombel.
            </div>
          )}

          <div className="space-y-4">
            {/* Pilihan 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>
                  Pilihan Bakal Calon 1{' '}
                  {selectedVoterClass && (
                    <span className="font-mono text-emerald-700 font-semibold">
                      ({selectedVoterClass.grade === 7 || selectedVoterClass.grade === 8 ? `Wajib Kelas ${selectedVoterClass.rombel}` : `Kelas 7${voterRombelLetter} / 8${voterRombelLetter}`})
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-slate-500">Wajib diisi</span>
              </label>
              <select
                value={nominee1}
                onChange={(e) => setNominee1(e.target.value)}
                disabled={!selectedVoterId || selectedVoterHasVoted}
                required
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedVoterClass
                    ? `-- Pilih Calon 1 (${selectedVoterClass.grade === 7 || selectedVoterClass.grade === 8 ? `Kelas ${selectedVoterClass.rombel}` : `Kelas 7${voterRombelLetter} / 8${voterRombelLetter}`}) --`
                    : '-- Pilih Siswa Pemilih Dahulu --'}
                </option>
                {pool1.map((cand) => {
                  const kls = getClassById(cand.class_id);
                  const isTaken = cand.id === nominee2 || cand.id === nominee3;
                  return (
                    <option key={cand.id} value={cand.id} disabled={isTaken}>
                      {cand.full_name} - Kelas {kls?.rombel} {isTaken ? '(Sudah Dipilih di Pilihan Lain)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Pilihan 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>
                  Pilihan Bakal Calon 2{' '}
                  {selectedVoterClass && (
                    <span className="font-mono text-emerald-700 font-semibold">
                      ({selectedVoterClass.grade === 7 || selectedVoterClass.grade === 8 ? `Wajib Kelas ${selectedVoterClass.rombel}` : `Kelas 7${voterRombelLetter} / 8${voterRombelLetter}`})
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-slate-500">Wajib diisi</span>
              </label>
              <select
                value={nominee2}
                onChange={(e) => setNominee2(e.target.value)}
                disabled={!selectedVoterId || selectedVoterHasVoted}
                required
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedVoterClass
                    ? `-- Pilih Calon 2 (${selectedVoterClass.grade === 7 || selectedVoterClass.grade === 8 ? `Kelas ${selectedVoterClass.rombel}` : `Kelas 7${voterRombelLetter} / 8${voterRombelLetter}`}) --`
                    : '-- Pilih Siswa Pemilih Dahulu --'}
                </option>
                {pool2.map((cand) => {
                  const kls = getClassById(cand.class_id);
                  const isTaken = cand.id === nominee1 || cand.id === nominee3;
                  return (
                    <option key={cand.id} value={cand.id} disabled={isTaken}>
                      {cand.full_name} - Kelas {kls?.rombel} {isTaken ? '(Sudah Dipilih di Pilihan Lain)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Pilihan 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>
                  Pilihan Bakal Calon 3{' '}
                  {selectedVoterClass && (
                    <span className="font-mono text-indigo-700 font-semibold">
                      ({selectedVoterClass.grade === 7 ? `Wajib Kelas 8${voterRombelLetter}` : selectedVoterClass.grade === 8 ? `Wajib Kelas 7${voterRombelLetter}` : `Kelas 7${voterRombelLetter} / 8${voterRombelLetter}`})
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-normal text-slate-500">Wajib diisi</span>
              </label>
              <select
                value={nominee3}
                onChange={(e) => setNominee3(e.target.value)}
                disabled={!selectedVoterId || selectedVoterHasVoted}
                required
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedVoterClass
                    ? `-- Pilih Calon 3 (${selectedVoterClass.grade === 7 ? `Kelas 8${voterRombelLetter}` : selectedVoterClass.grade === 8 ? `Kelas 7${voterRombelLetter}` : `Kelas 7${voterRombelLetter} / 8${voterRombelLetter}`}) --`
                    : '-- Pilih Siswa Pemilih Dahulu --'}
                </option>
                {pool3.map((cand) => {
                  const kls = getClassById(cand.class_id);
                  const isTaken = cand.id === nominee1 || cand.id === nominee2;
                  return (
                    <option key={cand.id} value={cand.id} disabled={isTaken}>
                      {cand.full_name} - Kelas {kls?.rombel} {isTaken ? '(Sudah Dipilih di Pilihan Lain)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={!selectedVoterId || selectedVoterHasVoted || !nominee1 || !nominee2 || !nominee3}
            className="py-2.5 px-6 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Simpan Pilihan Seleksi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
