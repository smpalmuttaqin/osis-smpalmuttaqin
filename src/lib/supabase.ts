import { createClient } from '@supabase/supabase-js';
import {
  Role,
  User,
  Kelas,
  Student,
  SelectionVote,
  PlenoEvaluation,
  Candidate,
  VotingAttendance,
  FinalVote,
} from '../types/database';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://avrudqubtdtasaaugtjx.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Q1p8e8SJhFuoI4glGiwDEw_kq1KhEZ2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export interface SupabaseHealth {
  isConnected: boolean;
  checkedAt: string;
  url: string;
  hasRlsIssue: boolean;
  errorMessage?: string;
  tables: Record<string, { exists: boolean; count: number; error?: string }>;
}

/**
 * Checks connection and table accessibility on Supabase
 */
export async function testSupabaseConnection(): Promise<SupabaseHealth> {
  const tableNames = [
    'roles',
    'users',
    'classes',
    'students',
    'selection_votes',
    'pleno_evaluations',
    'candidates',
    'voting_attendances',
    'final_votes',
  ];

  const result: SupabaseHealth = {
    isConnected: false,
    checkedAt: new Date().toLocaleTimeString('id-ID'),
    url: SUPABASE_URL,
    hasRlsIssue: false,
    tables: {},
  };

  try {
    let anyTableFound = false;

    for (const t of tableNames) {
      const { data, error, count } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true });

      if (error) {
        result.tables[t] = { exists: false, count: 0, error: error.message };
        if (error.message.includes('row-level security') || error.message.includes('permission denied')) {
          result.hasRlsIssue = true;
        }
      } else {
        result.tables[t] = { exists: true, count: count || 0 };
        anyTableFound = true;
      }
    }

    result.isConnected = anyTableFound;
  } catch (err: any) {
    result.isConnected = false;
    result.errorMessage = err?.message || 'Gagal menghubungi server Supabase.';
  }

  return result;
}

/**
 * Fetch data directly from Supabase if rows exist
 */
export async function fetchAllSupabaseData() {
  try {
    const [
      rolesRes,
      usersRes,
      classesRes,
      studentsRes,
      candidatesRes,
      selectionRes,
      plenoRes,
      attendancesRes,
      finalVotesRes,
    ] = await Promise.all([
      supabase.from('roles').select('*'),
      supabase.from('users').select('*'),
      supabase.from('classes').select('*').order('id', { ascending: true }),
      supabase.from('students').select('*').order('full_name', { ascending: true }),
      supabase.from('candidates').select('*').order('id', { ascending: true }),
      supabase.from('selection_votes').select('*'),
      supabase.from('pleno_evaluations').select('*'),
      supabase.from('voting_attendances').select('*'),
      supabase.from('final_votes').select('*'),
    ]);

    return {
      success: true,
      roles: rolesRes.data as Role[] | null,
      users: usersRes.data as User[] | null,
      classes: classesRes.data as Kelas[] | null,
      students: studentsRes.data as Student[] | null,
      candidates: candidatesRes.data as Candidate[] | null,
      selectionVotes: selectionRes.data as SelectionVote[] | null,
      plenoEvaluations: plenoRes.data as PlenoEvaluation[] | null,
      votingAttendances: attendancesRes.data as VotingAttendance[] | null,
      finalVotes: finalVotesRes.data as FinalVote[] | null,
    };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Seed initial data to Supabase
 */
export async function seedInitialDataToSupabase(data: {
  roles: Role[];
  classes: Kelas[];
  users: User[];
  students: Student[];
  candidates: Candidate[];
}): Promise<{ success: boolean; message: string; rlsError?: boolean }> {
  try {
    // 1. Roles
    const { error: rolesErr } = await supabase.from('roles').upsert(
      data.roles.map((r) => ({ id: r.id, name: r.name })),
      { onConflict: 'id' }
    );
    if (rolesErr) {
      if (rolesErr.message.includes('row-level security')) {
        return {
          success: false,
          rlsError: true,
          message:
            'Gagal menyimpan karena Row-Level Security (RLS) di Supabase masih aktif. Silakan jalankan query SQL untuk menonaktifkan RLS terlebih dahulu di SQL Editor Supabase.',
        };
      }
      throw rolesErr;
    }

    // 2. Classes
    const { error: clsErr } = await supabase.from('classes').upsert(
      data.classes.map((c) => ({ id: c.id, grade: c.grade, rombel: c.rombel })),
      { onConflict: 'id' }
    );
    if (clsErr) throw clsErr;

    // 3. Users - ensure UUID id format
    const formattedUsers = data.users.map((u) => ({
      id: isValidUUID(u.id) ? u.id : generateUUID(),
      username: u.username,
      full_name: u.full_name,
      password: u.password,
      role_id: u.role_id,
      created_at: u.created_at || new Date().toISOString(),
    }));

    const { error: usrErr } = await supabase.from('users').upsert(formattedUsers, { onConflict: 'username' });
    if (usrErr) throw usrErr;

    // 4. Students - ensure UUID format
    const formattedStudents = data.students.map((s) => ({
      id: isValidUUID(s.id) ? s.id : generateUUID(),
      full_name: s.full_name,
      class_id: s.class_id,
      created_at: s.created_at || new Date().toISOString(),
    }));

    const { error: stdErr } = await supabase.from('students').upsert(formattedStudents, { onConflict: 'id' });
    if (stdErr) throw stdErr;

    // 5. Candidates
    if (formattedStudents.length >= 6) {
      const formattedCandidates = data.candidates.map((c, idx) => ({
        id: c.id,
        chairman_student_id: formattedStudents[idx * 2]?.id || formattedStudents[0]?.id,
        vice_chairman_student_id: formattedStudents[idx * 2 + 1]?.id || formattedStudents[1]?.id,
        vision_mission: c.vision_mission,
      }));

      const { error: cndErr } = await supabase.from('candidates').upsert(formattedCandidates, {
        onConflict: 'id',
      });
      if (cndErr) throw cndErr;
    }

    return {
      success: true,
      message: 'Seluruh data master (Roles, Kelas, Siswa, Guru, dan Paslon) berhasil disinkronkan ke database Supabase!',
    };
  } catch (err: any) {
    const isRls = err?.message?.includes('row-level security');
    return {
      success: false,
      rlsError: isRls,
      message: isRls
        ? 'Row-Level Security (RLS) masih mengunci tabel di Supabase. Buka SQL Editor di Supabase dan jalankan ALTER TABLE ... DISABLE ROW LEVEL SECURITY;'
        : err?.message || 'Terjadi kesalahan saat menyinkronkan data.',
    };
  }
}
