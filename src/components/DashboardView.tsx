import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DonutChart, DonutItem } from './DonutChart';
import { AlMuttaqinLogo } from './AlMuttaqinLogo';
import { Award, Users, Vote, CheckCircle2, Trophy } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    candidates,
    finalVotes,
    students,
    votingAttendances,
    selectionVotes,
    plenoEvaluations,
    classes,
    getStudentById,
    getClassById,
  } = useApp();

  const [activeRombelFilter, setActiveRombelFilter] = useState<'7A' | '7B' | '8A' | '8B'>('7A');

  // 1. Pemilihan Akhir (Final Votes per candidate)
  const candidateColors = ['#059669', '#4f46e5', '#d97706']; // emerald, indigo, amber
  const totalFinalVotes = finalVotes.length;

  const finalVotesData: DonutItem[] = candidates.map((cand, idx) => {
    const votesForCand = finalVotes.filter((fv) => fv.candidate_id === cand.id).length;
    const chair = getStudentById(cand.chairman_student_id)?.full_name || 'Ketua';
    const vice = getStudentById(cand.vice_chairman_student_id)?.full_name || 'Wakil';

    return {
      id: cand.id,
      label: `Paslon 0${cand.id}`,
      subLabel: `${chair.split(' ')[0]} & ${vice.split(' ')[0]}`,
      value: votesForCand,
      color: candidateColors[idx % candidateColors.length],
    };
  });

  // Find leader in final votes
  const sortedFinal = [...finalVotesData].sort((a, b) => b.value - a.value);
  const leadingPaslon = totalFinalVotes > 0 && sortedFinal[0].value > 0 ? sortedFinal[0] : null;

  // 2. Partisipasi Kehadiran Siswa
  const totalStudents = students.length;
  const attendedCount = votingAttendances.length;
  const absentCount = Math.max(0, totalStudents - attendedCount);
  const participationData: DonutItem[] = [
    {
      id: 'hadir',
      label: 'Sudah Hadir',
      value: attendedCount,
      color: '#059669',
    },
    {
      id: 'belum',
      label: 'Belum Hadir',
      value: absentCount,
      color: '#cbd5e1',
    },
  ];

  // 3. Hasil Musyawarah Pleno Guru
  const recommendedCandidates = plenoEvaluations.filter((pe) => pe.is_selected_for_paslon);
  const unrecommendedCandidates = plenoEvaluations.filter((pe) => !pe.is_selected_for_paslon);
  const plenoData: DonutItem[] = [
    {
      id: 'rekomendasi',
      label: 'Direkomendasikan (Top 6)',
      subLabel: 'Siap diajukan sebagai Paslon',
      value: recommendedCandidates.length,
      color: '#4f46e5',
    },
    {
      id: 'evaluasi',
      label: 'Catatan Evaluasi Guru',
      subLabel: 'Belum ditandai sebagai paslon',
      value: unrecommendedCandidates.length,
      color: '#94a3b8',
    },
  ];

  // 4. Seleksi Bakal Calon per Rombel (7A, 7B, 8A, 8B)
  const targetKelas = classes.find((c) => c.rombel === activeRombelFilter);
  const classStudents = targetKelas ? students.filter((s) => s.class_id === targetKelas.id) : [];

  // Count selection votes for each student in this rombel
  const candidateSelectionTallies = classStudents.map((std) => {
    const count = selectionVotes.filter((sv) => sv.nominated_student_id === std.id).length;
    return {
      student: std,
      count,
    };
  }).sort((a, b) => b.count - a.count);

  const rombelColors = ['#059669', '#0891b2', '#4f46e5', '#7c3aed', '#d97706', '#ea580c', '#e11d48', '#64748b'];

  const seleksiRombelData: DonutItem[] = candidateSelectionTallies.map((item, idx) => ({
    id: item.student.id,
    label: item.student.full_name,
    subLabel: `Kelas ${activeRombelFilter}`,
    value: item.count,
    color: rombelColors[idx % rombelColors.length],
  }));

  const totalVotesInRombel = seleksiRombelData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Al Muttaqin Logo */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-emerald-700/30">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
            <AlMuttaqinLogo size="custom" className="w-13 h-13" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Pondok Pesantren & SMP Al Muttaqin
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Dasbor Pemilihan Ketua & Wakil Ketua OSIS
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Pemantauan perolehan suara bilik seleksi, evaluasi musyawarah pleno, dan e-voting secara real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Suara Masuk</span>
            <Vote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalFinalVotes}
            </span>
            <span className="text-xs text-slate-500">suara pemilih</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Pemilihan Utama Bilik Suara
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tingkat Partisipasi</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalStudents > 0 ? ((attendedCount / totalStudents) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({attendedCount}/{totalStudents})
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Siswa yang sudah absensi hadir
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Suara Seleksi Bakal Calon</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {selectionVotes.length}
            </span>
            <span className="text-xs text-slate-500">nominasi tercatat</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Hasil voting tahap 1 (Kelas 7 & 8)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kandidat Pleno Guru</span>
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {recommendedCandidates.length}
            </span>
            <span className="text-xs text-slate-500">dari 12 kandidat</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Telah ditandai siap dipasangkan
          </div>
        </div>
      </div>

      {/* Main Real-Time Donut Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Pemilihan Akhir Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Hasil Pemilihan Akhir E-Voting
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perolehan suara riil Pasangan Calon 01, 02, dan 03 (Anonim)
              </p>
            </div>
            {leadingPaslon && (
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Memimpin: {leadingPaslon.label}</span>
              </div>
            )}
          </div>

          <DonutChart
            data={finalVotesData}
            centerLabel="Suara Masuk"
            centerValue={totalFinalVotes}
            size={220}
            strokeWidth={30}
          />
        </div>

        {/* 2. Partisipasi Absensi Pemilih */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Tingkat Partisipasi Pemilih
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan siswa yang telah hadir di bilik suara vs belum hadir
              </p>
            </div>
          </div>

          <DonutChart
            data={participationData}
            centerLabel="Total Siswa"
            centerValue={totalStudents}
            size={220}
            strokeWidth={30}
          />
        </div>
      </div>

      {/* 3 & 4. Pleno and Seleksi per rombel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pleno Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="pb-3 border-b border-slate-100 mb-5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Hasil Musyawarah Pleno Dewan Guru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekomendasi 6 bakal calon terbaik hasil musyawarah dan masukan guru
            </p>
          </div>

          <DonutChart
            data={plenoData}
            centerLabel="Evaluasi"
            centerValue={plenoEvaluations.length}
            size={220}
            strokeWidth={30}
          />

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Kandidat Terpilih Rekomendasi Guru (Siap Paslon):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recommendedCandidates.slice(0, 6).map((item) => {
                const std = getStudentById(item.student_id);
                const kls = std ? getClassById(std.class_id) : null;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-900 truncate">{std?.full_name}</p>
                      <p className="text-[11px] text-slate-500">Kelas {kls?.rombel}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Seleksi Bakal Calon Per Rombel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-5 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Hasil Seleksi Calon per Rombel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perolehan suara bakal calon di rombel Kelas 7 & 8
              </p>
            </div>

            {/* Rombel Switcher Buttons (allowed as functional interactive filter control) */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 shrink-0 self-start sm:self-auto">
              {(['7A', '7B', '8A', '8B'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRombelFilter(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeRombelFilter === r
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <DonutChart
            data={seleksiRombelData}
            centerLabel={`Suara ${activeRombelFilter}`}
            centerValue={totalVotesInRombel}
            size={220}
            strokeWidth={30}
          />
        </div>
      </div>
    </div>
  );
};
