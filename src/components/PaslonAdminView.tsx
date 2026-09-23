import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Save, Check, Users } from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../lib/sweetalert';

export const PaslonAdminView: React.FC = () => {
  const { candidates, students, saveCandidate, getStudentById, getClassById, plenoEvaluations } = useApp();

  const [activeCandidateId, setActiveCandidateId] = useState<number>(1);
  const currentCand = candidates.find((c) => c.id === activeCandidateId) || candidates[0];

  const [chairmanId, setChairmanId] = useState<string>(currentCand?.chairman_student_id || '');
  const [viceChairmanId, setViceChairmanId] = useState<string>(currentCand?.vice_chairman_student_id || '');
  const [visionMission, setVisionMission] = useState<string>(currentCand?.vision_mission || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When switching candidate
  const handleSelectCandidateTab = (candId: number) => {
    setActiveCandidateId(candId);
    const cand = candidates.find((c) => c.id === candId);
    if (cand) {
      setChairmanId(cand.chairman_student_id);
      setViceChairmanId(cand.vice_chairman_student_id);
      setVisionMission(cand.vision_mission);
    } else {
      setChairmanId('');
      setViceChairmanId('');
      setVisionMission('');
    }
    setSaveSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chairmanId || !viceChairmanId) {
      showErrorAlert('Pilihan Belum Lengkap', 'Silakan pilih Calon Ketua dan Calon Wakil Ketua.');
      return;
    }
    if (chairmanId === viceChairmanId) {
      showErrorAlert('Pilihan Tidak Valid', 'Ketua dan Wakil Ketua tidak boleh merupakan orang yang sama.');
      return;
    }

    saveCandidate(activeCandidateId, chairmanId, viceChairmanId, visionMission);
    setSaveSuccess(true);
    const chair = getStudentById(chairmanId);
    const vice = getStudentById(viceChairmanId);
    showSuccessAlert(
      `Paslon 0${activeCandidateId} Berhasil Ditetapkan!`,
      `Ketua: ${chair?.full_name || '-'} & Wakil: ${vice?.full_name || '-'} telah tersimpan ke sistem.`,
      3000
    );
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Recommended candidates from Pleno
  const recommendedIds = plenoEvaluations.filter((pe) => pe.is_selected_for_paslon).map((pe) => pe.student_id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          Administrasi Paslon
        </span>
        <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
          Penetapan Resmi 3 Pasangan Calon (Paslon 1, 2, 3)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Pasangan calon disusun berdasarkan hasil perolehan seleksi dan rekomendasi musyawarah pleno dewan guru.
        </p>
      </div>

      {students.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Database Siswa Masih Kosong</span>
            <span className="text-[11px] text-amber-700">
              Belum ada data siswa yang tersimpan di database. Silakan tambahkan data siswa di menu <strong>Manajemen Data Siswa</strong> terlebih dahulu agar dapat memilih Calon Ketua dan Wakil Ketua OSIS.
            </span>
          </div>
        </div>
      )}

      {/* 3 Paslon Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((num) => {
          const cand = candidates.find((c) => c.id === num);
          const chair = cand ? getStudentById(cand.chairman_student_id) : null;
          const vice = cand ? getStudentById(cand.vice_chairman_student_id) : null;
          const chairKls = chair ? getClassById(chair.class_id) : null;
          const viceKls = vice ? getClassById(vice.class_id) : null;
          const isSelected = activeCandidateId === num;

          return (
            <div
              key={num}
              onClick={() => handleSelectCandidateTab(num)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                  Paslon 0{num}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isSelected ? 'Sedang Diedit' : 'Klik untuk Ubah'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Calon Ketua:
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {chair ? chair.full_name : 'Belum ditentukan'}
                  </p>
                  {chairKls && (
                    <span className="text-[11px] text-slate-500">Kelas {chairKls.rombel}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Calon Wakil Ketua:
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {vice ? vice.full_name : 'Belum ditentukan'}
                  </p>
                  {viceKls && (
                    <span className="text-[11px] text-slate-500">Kelas {viceKls.rombel}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Formulir Pengaturan Paslon 0{activeCandidateId}
            </h4>
          </div>
          {saveSuccess && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Perubahan Paslon berhasil disimpan!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ketua */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Calon Ketua OSIS
              </label>
              <select
                value={chairmanId}
                onChange={(e) => setChairmanId(e.target.value)}
                required
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Pilih Siswa Calon Ketua --</option>
                {students.map((s) => {
                  const kls = getClassById(s.class_id);
                  const isRec = recommendedIds.includes(s.id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.full_name} - Kelas {kls?.rombel} {isRec ? '★ (Rekomendasi Pleno)' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Tanda ★ menandakan kandidat direkomendasikan dewan guru pada Pleno.
              </p>
            </div>

            {/* Wakil Ketua */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Calon Wakil Ketua OSIS
              </label>
              <select
                value={viceChairmanId}
                onChange={(e) => setViceChairmanId(e.target.value)}
                required
                className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Pilih Siswa Calon Wakil Ketua --</option>
                {students.map((s) => {
                  const kls = getClassById(s.class_id);
                  const isRec = recommendedIds.includes(s.id);
                  return (
                    <option key={s.id} value={s.id} disabled={s.id === chairmanId}>
                      {s.full_name} - Kelas {kls?.rombel} {isRec ? '★ (Rekomendasi Pleno)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Visi & Misi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Visi & Misi Pasangan Calon
            </label>
            <textarea
              rows={6}
              value={visionMission}
              onChange={(e) => setVisionMission(e.target.value)}
              placeholder="Tuliskan rumusan Visi dan Misi paslon..."
              required
              className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi Paslon 0{activeCandidateId}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
