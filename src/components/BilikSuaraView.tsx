import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Vote,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { showVotingSuccessAlert, showToast, showErrorAlert } from '../lib/sweetalert';

export const BilikSuaraView: React.FC = () => {
  const {
    students,
    classes,
    candidates,
    checkInStudent,
    castFinalVote,
    hasStudentAttended,
    getStudentById,
    getClassById,
  } = useApp();

  // Step 1: Attendance
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Step 2: Bilik Suara state
  const [isInVotingBooth, setIsInVotingBooth] = useState(false);
  const [activeVoterName, setActiveVoterName] = useState<string>('');
  const [confirmingCandidateId, setConfirmingCandidateId] = useState<number | null>(null);
  const [voteSubmittedSuccess, setVoteSubmittedSuccess] = useState(false);

  const currentClassStudents = students.filter((s) => s.class_id === selectedClassId);
  const filteredStudents = currentClassStudents.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentAlreadyAttended = selectedStudent ? hasStudentAttended(selectedStudent.id) : false;

  // Handler to mark attendance & activate voting booth
  const handleProceedToBooth = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!selectedStudentId) {
      showErrorAlert('Pilih Siswa', 'Silakan pilih siswa yang hadir di bilik suara.');
      setStatusMessage({ type: 'error', text: 'Silakan pilih siswa yang hadir di bilik suara.' });
      return;
    }

    if (studentAlreadyAttended) {
      showErrorAlert('Sudah Memilih', 'Siswa ini sudah melakukan absensi dan hak suara telah digunakan sebelumnya!');
      setStatusMessage({
        type: 'error',
        text: 'Siswa ini sudah melakukan absensi dan hak suara telah digunakan sebelumnya!',
      });
      return;
    }

    // Check in the student
    const res = checkInStudent(selectedStudentId);
    if (!res.success) {
      showErrorAlert('Gagal Absensi', res.error || 'Gagal memproses absensi.');
      setStatusMessage({ type: 'error', text: res.error || 'Gagal memproses absensi.' });
      return;
    }

    // Launch voting booth
    const voterName = selectedStudent?.full_name || 'Siswa';
    showToast('success', `Absensi Berhasil: ${voterName} dipersilakan menuju Bilik Suara.`, 2500);
    setActiveVoterName(voterName);
    setIsInVotingBooth(true);
  };

  // Handler for casting final vote
  const handleConfirmVote = () => {
    if (confirmingCandidateId === null) return;

    const cand = candidates.find((c) => c.id === confirmingCandidateId);
    const chair = cand ? getStudentById(cand.chairman_student_id) : null;
    const vice = cand ? getStudentById(cand.vice_chairman_student_id) : null;
    const candidateName = `${chair?.full_name || 'Ketua'} & ${vice?.full_name || 'Wakil'}`;

    const res = castFinalVote(confirmingCandidateId);
    if (res.success) {
      const chosenCandId = confirmingCandidateId;
      setConfirmingCandidateId(null);
      setVoteSubmittedSuccess(true);

      // Trigger SweetAlert voting success alert
      showVotingSuccessAlert(candidateName, chosenCandId);

      // Reset back to attendance after 3s for next student
      setTimeout(() => {
        setVoteSubmittedSuccess(false);
        setIsInVotingBooth(false);
        setSelectedStudentId('');
        setActiveVoterName('');
        setStatusMessage({
          type: 'success',
          text: 'Pencoblosan selesai! Hak pilih siswa telah tercatat dan tersimpan anonim.',
        });
      }, 3000);
    }
  };

  // If inside voting booth and completed
  if (voteSubmittedSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Suara Anda Berhasil Tercatat!</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Pilihan Anda telah tersimpan secara anonim dalam basis data E-Pilketos SMP Al Muttaqin Kota Madiun.
          Sistem akan kembali ke layar antrean pemilih berikutnya secara otomatis.
        </p>
      </div>
    );
  }

  // If inside voting booth (Student voting view)
  if (isInVotingBooth) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Booth Header */}
        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Bilik Suara Digital (Luber Jurdil)
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">Pencoblosan Anonim</span>
            </div>
            <h3 className="text-base font-bold tracking-tight mt-0.5">
              Surat Suara Pemilihan Ketua & Wakil Ketua OSIS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pemilih: <strong>{activeVoterName}</strong> (SMP Al Muttaqin Kota Madiun)
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Pilihan Dijamin Tertutup</span>
          </div>
        </div>

        {/* 3 Paslon Voting Cards */}
        {candidates.length === 0 ? (
          <div className="bg-white rounded-xl border border-amber-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Belum Ada Paslon yang Ditetapkan di Database</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Saat ini data pasangan calon (Paslon 1, 2, 3) di database masih kosong.
              Silakan login sebagai Administrator untuk menetapkan pasangan calon terlebih dahulu melalui menu Penetapan Paslon.
            </p>
            <button
              onClick={() => setIsInVotingBooth(false)}
              className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Kembali ke Meja Petugas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {candidates.map((cand) => {
              const chair = getStudentById(cand.chairman_student_id);
              const vice = getStudentById(cand.vice_chairman_student_id);
              const chairKls = chair ? getClassById(chair.class_id) : null;
              const viceKls = vice ? getClassById(vice.class_id) : null;

              return (
                <div
                  key={cand.id}
                  className="bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
                >
                  {/* Number Banner */}
                  <div className="bg-slate-50 border-b border-slate-200 py-3 text-center">
                    <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                      0{cand.id}
                    </span>
                  </div>

                  {/* Candidate Content */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Pair Info */}
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Calon Ketua OSIS
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {chair?.full_name || 'Belum ditentukan'}
                        </p>
                        {chairKls && <p className="text-[11px] text-slate-500">Kelas {chairKls?.rombel}</p>}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Calon Wakil Ketua OSIS
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {vice?.full_name || 'Belum ditentukan'}
                        </p>
                        {viceKls && <p className="text-[11px] text-slate-500">Kelas {viceKls?.rombel}</p>}
                      </div>
                    </div>

                    {/* Visi & Misi Preview */}
                    <div className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto font-sans leading-relaxed whitespace-pre-line">
                      {cand.vision_mission || 'Belum ada visi misi'}
                    </div>
                  </div>

                  {/* Vote Action */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => setConfirmingCandidateId(cand.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Vote className="w-4 h-4" />
                      <span>Coblos Paslon 0{cand.id}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmingCandidateId !== null && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Vote className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Konfirmasi Pilihan Anda
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin memberikan suara kepada{' '}
                  <strong className="text-slate-900">Pasangan Calon 0{confirmingCandidateId}</strong>?
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded mt-2">
                  Pilihan tidak dapat diubah setelah tombol konfirmasi ditekan.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmingCandidateId(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVote}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  Ya, Coblos Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 1: Absensi Bilik Suara
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Notice Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-3">
        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Prosedur Absensi & Pemilihan Bilik Suara
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Petugas bilik memverifikasi kehadiran siswa pemilih melalui daftar rombel. Setelah absensi dicatat di sistem, bilik suara digital akan dibuka untuk siswa mencoblos secara rahasia.
          </p>
        </div>
      </div>

      {candidates.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Perhatian: Paslon Belum Ditetapkan</span>
            <span className="text-[11px] text-amber-700">
              Data Paslon di database saat ini masih kosong. Harap tetapkan pasangan calon terlebih dahulu melalui menu Penetapan Paslon oleh Administrator sebelum proses pencoblosan dimulai.
            </span>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Form Check-In Siswa */}
      <form onSubmit={handleProceedToBooth} className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pencarian Data Pemilih
          </h4>
          {selectedStudent && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                studentAlreadyAttended
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {studentAlreadyAttended ? 'Sudah Absen & Memilih' : 'Status: Belum Memilih'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Rombel Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(Number(e.target.value));
                setSelectedStudentId('');
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
              Cari Nama Siswa Pemilih
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama santri..."
                className="w-full text-xs bg-white text-slate-900 pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              <option value="">-- Pilih Siswa dari Daftar --</option>
              {filteredStudents.map((s) => {
                const attended = hasStudentAttended(s.id);
                return (
                  <option key={s.id} value={s.id} disabled={attended}>
                    {s.full_name} {attended ? '(Sudah Hadir & Memilih)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={!selectedStudentId || studentAlreadyAttended}
            className="py-2.5 px-6 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Konfirmasi Hadir & Buka Bilik Suara</span>
          </button>
        </div>
      </form>
    </div>
  );
};
