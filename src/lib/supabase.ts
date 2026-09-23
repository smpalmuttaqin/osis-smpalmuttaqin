import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Role,
  User,
  Kelas,
  Student,
  SelectionCandidate,
  SelectionVote,
  PlenoEvaluation,
  Candidate,
  VotingAttendance,
  FinalVote,
} from '../types/database';

export const DEFAULT_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://avrudqubtdtasaaugtjx.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Q1p8e8SJhFuoI4glGiwDEw_kq1KhEZ2';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const customUrl = localStorage.getItem('smp_pilketos_custom_supabase_url');
    const customKey = localStorage.getItem('smp_pilketos_custom_supabase_anon_key');
    if (customUrl && customKey) {
      return { url: customUrl.trim(), anonKey: customKey.trim() };
    }
  } catch {
    // fallback
  }
  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
}

let activeConfig = getStoredSupabaseConfig();
export let SUPABASE_URL = activeConfig.url;
export let SUPABASE_ANON_KEY = activeConfig.anonKey;

export let supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function updateSupabaseClient(url: string, anonKey: string) {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  SUPABASE_URL = cleanUrl;
  SUPABASE_ANON_KEY = cleanKey;
  try {
    localStorage.setItem('smp_pilketos_custom_supabase_url', cleanUrl);
    localStorage.setItem('smp_pilketos_custom_supabase_anon_key', cleanKey);
  } catch {
    // ignore
  }
  supabase = createClient(cleanUrl, cleanKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export function resetToDefaultSupabaseClient() {
  SUPABASE_URL = DEFAULT_SUPABASE_URL;
  SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;
  try {
    localStorage.removeItem('smp_pilketos_custom_supabase_url');
    localStorage.removeItem('smp_pilketos_custom_supabase_anon_key');
  } catch {
    // ignore
  }
  supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

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

export const ALL_DATABASE_TABLES = [
  'roles',
  'users',
  'classes',
  'students',
  'selection_candidates',
  'selection_votes',
  'pleno_evaluations',
  'candidates',
  'voting_attendances',
  'final_votes',
];

/**
 * Checks connection and table accessibility on Supabase
 */
export async function testSupabaseConnection(): Promise<SupabaseHealth> {
  const result: SupabaseHealth = {
    isConnected: false,
    checkedAt: new Date().toLocaleTimeString('id-ID'),
    url: SUPABASE_URL,
    hasRlsIssue: false,
    tables: {},
  };

  try {
    let anyTableFound = false;

    for (const t of ALL_DATABASE_TABLES) {
      const { data, error, count } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true });

      if (error) {
        result.tables[t] = { exists: false, count: 0, error: error.message };
        if (
          error.message.includes('row-level security') ||
          error.message.includes('permission denied')
        ) {
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
 * Fetch all data directly from Supabase
 */
export async function fetchAllSupabaseData() {
  try {
    const [
      rolesRes,
      usersRes,
      classesRes,
      studentsRes,
      selectionCandidatesRes,
      selectionRes,
      plenoRes,
      candidatesRes,
      attendancesRes,
      finalVotesRes,
    ] = await Promise.all([
      supabase.from('roles').select('*'),
      supabase.from('users').select('*'),
      supabase.from('classes').select('*').order('id', { ascending: true }),
      supabase.from('students').select('*').order('full_name', { ascending: true }),
      supabase.from('selection_candidates').select('*'),
      supabase.from('selection_votes').select('*'),
      supabase.from('pleno_evaluations').select('*'),
      supabase.from('candidates').select('*').order('id', { ascending: true }),
      supabase.from('voting_attendances').select('*'),
      supabase.from('final_votes').select('*'),
    ]);

    return {
      success: true,
      roles: rolesRes.data as Role[] | null,
      users: usersRes.data as User[] | null,
      classes: classesRes.data as Kelas[] | null,
      students: studentsRes.data as Student[] | null,
      selectionCandidates: selectionCandidatesRes.data as SelectionCandidate[] | null,
      selectionVotes: selectionRes.data as SelectionVote[] | null,
      plenoEvaluations: plenoRes.data as PlenoEvaluation[] | null,
      candidates: candidatesRes.data as Candidate[] | null,
      votingAttendances: attendancesRes.data as VotingAttendance[] | null,
      finalVotes: finalVotesRes.data as FinalVote[] | null,
    };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Seed master & initial data to Supabase
 */
export async function seedInitialDataToSupabase(data: {
  roles: Role[];
  classes: Kelas[];
  users: User[];
  students: Student[];
  selectionCandidates: SelectionCandidate[];
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

    // 5. Selection Candidates
    if (data.selectionCandidates && data.selectionCandidates.length > 0) {
      const formattedSelCands = data.selectionCandidates.map((sc) => ({
        id: isValidUUID(sc.id) ? sc.id : generateUUID(),
        student_id: sc.student_id,
        notes: sc.notes || '',
        is_active: sc.is_active,
        created_at: sc.created_at || new Date().toISOString(),
      }));

      const { error: selCandErr } = await supabase
        .from('selection_candidates')
        .upsert(formattedSelCands, { onConflict: 'student_id' });
      if (selCandErr) console.warn('Supabase selection_candidates sync warning:', selCandErr.message);
    }

    // 6. Candidates (Paslon)
    if (data.candidates && data.candidates.length > 0) {
      const formattedCandidates = data.candidates.map((c) => ({
        id: c.id,
        chairman_student_id: c.chairman_student_id,
        vice_chairman_student_id: c.vice_chairman_student_id,
        vision_mission: c.vision_mission,
      }));

      const { error: cndErr } = await supabase.from('candidates').upsert(formattedCandidates, {
        onConflict: 'id',
      });
      if (cndErr) throw cndErr;
    }

    return {
      success: true,
      message: 'Seluruh data master (Roles, Kelas, Siswa, Bakal Calon, Guru, dan Paslon) berhasil disinkronkan ke database Supabase!',
    };
  } catch (err: any) {
    const isRls = err?.message?.includes('row-level security');
    return {
      success: false,
      rlsError: isRls,
      message: isRls
        ? 'Row-Level Security (RLS) masih mengunci tabel di Supabase. Buka SQL Editor di Supabase dan jalankan: ALTER TABLE ... DISABLE ROW LEVEL SECURITY;'
        : err?.message || 'Terjadi kesalahan saat menyinkronkan data.',
    };
  }
}
