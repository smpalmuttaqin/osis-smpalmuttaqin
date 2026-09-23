export type UserRole = 'admin' | 'guru' | 'seleksi' | 'pemilihan';

export interface Role {
  id: number;
  name: UserRole;
}

export interface User {
  id: string; // UUID
  username: string | null;
  full_name: string;
  password?: string;
  role_id: number;
  created_at: string;
}

export interface Kelas {
  id: number;
  grade: 7 | 8 | 9;
  rombel: string; // e.g. "7A", "7B", "8A", "8B", "9A", "9B"
  created_at: string;
}

export interface Student {
  id: string; // UUID
  full_name: string;
  class_id: number;
  created_at: string;
}

export interface SelectionVote {
  id: number;
  voter_student_id: string;
  nominated_student_id: string;
  created_at: string;
}

export interface PlenoEvaluation {
  id: number;
  student_id: string;
  teacher_user_id: string;
  teacher_notes: string;
  is_selected_for_paslon: boolean;
  created_at: string;
}

export interface SelectionCandidate {
  id: string; // UUID
  student_id: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Candidate {
  id: number; // 1, 2, 3
  chairman_student_id: string;
  vice_chairman_student_id: string;
  vision_mission: string;
  created_at: string;
}

export interface VotingAttendance {
  id: number;
  student_id: string;
  attended_at: string;
}

export interface FinalVote {
  id: number;
  candidate_id: number;
  voted_at: string;
}

export type PageView =
  | 'dashboard'
  | 'kandidat_seleksi'
  | 'seleksi'
  | 'rekap_seleksi'
  | 'pleno'
  | 'paslon'
  | 'bilik_suara'
  | 'absensi'
  | 'manajemen_siswa'
  | 'manajemen_guru'
  | 'manajemen_petugas'
  | 'laravel_code';
