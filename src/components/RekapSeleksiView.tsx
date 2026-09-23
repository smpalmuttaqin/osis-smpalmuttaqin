import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RekapSeleksiView: React.FC = () => {
  const { classes, getTopCandidatesPerRombel, currentRole, setActivePage } = useApp();

  const topCandidates = getTopCandidatesPerRombel();
  const targetClasses = classes.filter((c) => c.grade === 7 || c.grade === 8);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Rekapitulasi Resmi Tahap 1
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">Total 12 Kandidat</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Daftar 12 Bakal Calon Teratas Lolos ke Musyawarah Pleno
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mengambil 3 perolehan suara terbanyak dari setiap rombel kelas 7 dan 8.
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'guru') && (
          <button
            onClick={() => setActivePage('pleno')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <span>Buka Musyawarah Pleno Guru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4 Rombel Grids: 7A, 7B, 8A, 8B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targetClasses.map((kelas) => {
          const rombelCandidates = topCandidates.filter((tc) => tc.kelas.id === kelas.id);

          return (
            <div key={kelas.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Kelas {kelas.rombel} (Tingkat {kelas.grade})
                  </h4>
                  <p className="text-[11px] text-slate-500">3 Calon Teratas Perolehan Suara</p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Top 3
                </span>
              </div>

              <div className="p-4 space-y-3">
                {rombelCandidates.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Belum ada perolehan suara seleksi di rombel {kelas.rombel}.
                  </div>
                ) : (
                  rombelCandidates.map((item) => {
                  const medalColors =
                    item.rankInRombel === 1
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : item.rankInRombel === 2
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-orange-50 text-orange-800 border-orange-200';

                  return (
                    <div
                      key={item.student.id}
                      className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs font-mono ${medalColors}`}
                        >
                          #{item.rankInRombel}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.student.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Siswa Kelas {item.kelas.rombel}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                          {item.voteCount}
                        </span>
                        <span className="text-[11px] text-slate-400 block">suara seleksi</span>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table of All Nominees */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Daftar Lengkap Bakal Calon Terpilih ({topCandidates.length} Siswa)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">No</th>
                <th className="py-2.5 px-4 font-semibold">Nama Siswa</th>
                <th className="py-2.5 px-4 font-semibold">Rombel</th>
                <th className="py-2.5 px-4 font-semibold">Peringkat Rombel</th>
                <th className="py-2.5 px-4 font-semibold text-right">Perolehan Suara</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status Tahap 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data bakal calon di database karena pemungutan suara tahap seleksi belum dimulai.
                  </td>
                </tr>
              ) : (
                topCandidates.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{item.student.full_name}</td>
                    <td className="py-2.5 px-4 text-slate-600">Kelas {item.kelas.rombel}</td>
                    <td className="py-2.5 px-4 text-slate-600">Peringkat #{item.rankInRombel} di {item.kelas.rombel}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {item.voteCount}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Masuk Musyawarah Pleno</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
