import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Check, CheckCircle2, Award, ArrowRight, MessageSquareQuote } from 'lucide-react';

export const PlenoView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    getTopCandidatesPerRombel,
    plenoEvaluations,
    savePlenoNote,
    setActivePage,
  } = useApp();

  const topCandidates = getTopCandidatesPerRombel();

  // Local state for editing notes per candidate
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    plenoEvaluations.forEach((pe) => {
      initial[pe.student_id] = pe.teacher_notes || '';
    });
    return initial;
  });

  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Count how many are selected
  const selectedCount = plenoEvaluations.filter((pe) => pe.is_selected_for_paslon).length;

  const handleNoteChange = (studentId: string, value: string) => {
    setEditingNotes((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleToggleSelected = (studentId: string) => {
    const existing = plenoEvaluations.find((pe) => pe.student_id === studentId);
    const currentlySelected = existing?.is_selected_for_paslon ?? false;

    if (!currentlySelected && selectedCount >= 6) {
      alert('Maksimal menandai 6 kandidat terbaik untuk pasangan calon.');
      return;
    }

    const currentNote = editingNotes[studentId] || existing?.teacher_notes || '';
    savePlenoNote(studentId, currentNote, !currentlySelected);
  };

  const handleSaveEvaluation = (studentId: string) => {
    const existing = plenoEvaluations.find((pe) => pe.student_id === studentId);
    const isSelected = existing?.is_selected_for_paslon ?? false;
    const note = editingNotes[studentId] || '';

    savePlenoNote(studentId, note, isSelected);
    setSavedSuccessId(studentId);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Tahap 2: Musyawarah Pleno Guru
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">
              Evaluator: <strong>{currentUser?.full_name}</strong>
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Evaluasi Kualitatif & Penandaan 6 Bakal Calon Terbaik
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Berikan catatan pertimbangan mengenai akhlak, kedisiplinan, dan kapasitas kepemimpinan bagi 12 kandidat teratas.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Kandidat Ditandai:</span>
            <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
              {selectedCount} / 6
            </span>
          </div>

          {currentRole === 'admin' && (
            <button
              onClick={() => setActivePage('paslon')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Lanjut Penetapan Paslon</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of 12 Candidates */}
      {topCandidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Belum Ada Calon dari Tahap Seleksi di Database</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Saat ini belum ada data perolehan suara di Tahap 1 (Bilik Seleksi). Daftar bakal calon akan otomatis terakumulasi setelah siswa melakukan pemungutan suara tahap seleksi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topCandidates.map((item) => {
          const evalItem = plenoEvaluations.find((pe) => pe.student_id === item.student.id);
          const isSelected = evalItem?.is_selected_for_paslon ?? false;
          const noteText = editingNotes[item.student.id] !== undefined
            ? editingNotes[item.student.id]
            : evalItem?.teacher_notes || '';

          return (
            <div
              key={item.student.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">
                        Kelas {item.kelas.rombel}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Rank #{item.rankInRombel} ({item.voteCount} Suara)
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                      {item.student.full_name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSelected(item.student.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{isSelected ? 'Ditandai Paslon' : 'Tandai Paslon'}</span>
                  </button>
                </div>

                {/* Teacher Note Input */}
                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
                    <span>Catatan & Rekomendasi Dewan Guru:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => handleNoteChange(item.student.id, e.target.value)}
                    placeholder="Tuliskan catatan kualitatif (contoh: akhlakul karimah, keteladanan ibadah, kecakapan komunikasi)..."
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {evalItem?.teacher_user_id ? 'Telah dievaluasi' : 'Belum dievaluasi'}
                </span>

                <button
                  type="button"
                  onClick={() => handleSaveEvaluation(item.student.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    savedSuccessId === item.student.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {savedSuccessId === item.student.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersimpan</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Catatan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
