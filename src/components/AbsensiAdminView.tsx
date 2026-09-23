import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export const AbsensiAdminView: React.FC = () => {
  const { currentRole, students, classes, votingAttendances, getClassById } = useApp();

  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attended' | 'not_attended'>('all');
  const [searchName, setSearchName] = useState<string>('');

  // Enforce access control
  if (currentRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Akses Terbatas</h3>
        <p className="text-xs text-slate-500">
          Daftar rekap absensi kehadiran pemilih hanya dapat diakses oleh Administrator Sistem.
        </p>
      </div>
    );
  }

  // Attendance map
  const attendanceMap = useMemo(() => {
    const map = new Map<string, string>();
    votingAttendances.forEach((va) => {
      map.set(va.student_id, va.attended_at);
    });
    return map;
  }, [votingAttendances]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return students.filter((s) => {
      const kls = getClassById(s.class_id);
      const isAttended = attendanceMap.has(s.id);

      if (selectedRombel !== 'all' && kls?.rombel !== selectedRombel) return false;
      if (statusFilter === 'attended' && !isAttended) return false;
      if (statusFilter === 'not_attended' && isAttended) return false;
      if (searchName && !s.full_name.toLowerCase().includes(searchName.toLowerCase())) return false;

      return true;
    });
  }, [students, selectedRombel, statusFilter, searchName, attendanceMap, getClassById]);

  const totalStudents = students.length;
  const attendedCount = votingAttendances.length;
  const unAttendedCount = Math.max(0, totalStudents - attendedCount);

  const exportCSV = () => {
    const headers = ['No', 'Nama Siswa', 'Kelas', 'Status Kehadiran', 'Waktu Hadir'];
    const rows = filteredData.map((s, idx) => {
      const kls = getClassById(s.class_id);
      const time = attendanceMap.get(s.id);
      return [
        idx + 1,
        `"${s.full_name}"`,
        kls?.rombel || '-',
        time ? 'HADIR' : 'BELUM HADIR',
        time ? new Date(time).toLocaleString('id-ID') : '-',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_absensi_pilketos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Khusus Administrator
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {attendedCount} dari {totalStudents} Siswa Telah Hadir
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Buku Induk Absensi Kehadiran Bilik Suara
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar verifikasi siswa yang telah menggunakan hak suaranya pada Pemilihan Ketua & Wakil Ketua OSIS.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total DPT Siswa</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">{totalStudents}</p>
          <span className="text-[11px] text-slate-400">Kelas 7, 8, dan 9</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-emerald-600 font-medium">Total Hadir / Menggunakan Hak</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">{attendedCount}</p>
          <span className="text-[11px] text-slate-400">
            {totalStudents > 0 ? ((attendedCount / totalStudents) * 100).toFixed(1) : 0}% Partisipasi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Belum Hadir</span>
          <p className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">{unAttendedCount}</p>
          <span className="text-[11px] text-slate-400">Menunggu giliran bilik suara</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Cari nama siswa..."
                className="w-full text-xs bg-white text-slate-900 pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Rombel */}
            <select
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Rombel</option>
              {classes.map((c) => (
                <option key={c.id} value={c.rombel}>
                  Kelas {c.rombel}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="attended">Hadir Saja</option>
              <option value="not_attended">Belum Hadir</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono tabular-nums shrink-0 self-end md:self-center">
            Menampilkan <strong>{filteredData.length}</strong> siswa
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-12">No</th>
                <th className="py-2.5 px-4 font-semibold">Nama Lengkap Siswa</th>
                <th className="py-2.5 px-4 font-semibold">Kelas</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status Kehadiran</th>
                <th className="py-2.5 px-4 font-semibold text-right">Waktu Absensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Tidak ditemukan data siswa sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((student, idx) => {
                  const kls = getClassById(student.class_id);
                  const attendedTime = attendanceMap.get(student.id);
                  const isAttended = !!attendedTime;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{student.full_name}</td>
                      <td className="py-2.5 px-4 text-slate-600">Kelas {kls?.rombel}</td>
                      <td className="py-2.5 px-4 text-center">
                        {isAttended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hadir</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Belum Hadir</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500 tabular-nums">
                        {attendedTime ? new Date(attendedTime).toLocaleTimeString('id-ID') : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
