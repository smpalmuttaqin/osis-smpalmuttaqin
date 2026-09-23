import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserRole,
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
  PageView,
} from '../types/database';
import {
  INITIAL_ROLES,
  INITIAL_CLASSES,
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_SELECTION_CANDIDATES,
  INITIAL_SELECTION_VOTES,
  INITIAL_PLENO_EVALUATIONS,
  INITIAL_CANDIDATES,
  INITIAL_ATTENDANCES,
  INITIAL_FINAL_VOTES,
} from '../data/initialData';
import {
  supabase,
  testSupabaseConnection,
  seedInitialDataToSupabase,
  fetchAllSupabaseData,
  SupabaseHealth,
  generateUUID,
  isValidUUID,
} from '../lib/supabase';

interface TopCandidatePerRombel {
  student: Student;
  kelas: Kelas;
  voteCount: number;
  rankInRombel: number;
}

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  activePage: PageView;
  setActivePage: (page: PageView) => void;

  // Supabase Connection & Diagnostics
  supabaseStatus: SupabaseHealth | null;
  isTestingSupabase: boolean;
  isSyncingWithSupabase: boolean;
  isLoadingFromSupabase: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  checkSupabaseHealth: () => Promise<SupabaseHealth | void>;
  syncDataToSupabase: () => Promise<{ success: boolean; message: string; rlsError?: boolean }>;
  loadDataFromSupabase: () => Promise<{ success: boolean; message: string }>;

  // UI State
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // DB entities
  roles: Role[];
  users: User[];
  classes: Kelas[];
  students: Student[];
  selectionCandidates: SelectionCandidate[];
  selectionVotes: SelectionVote[];
  plenoEvaluations: PlenoEvaluation[];
  candidates: Candidate[];
  votingAttendances: VotingAttendance[];
  finalVotes: FinalVote[];

  // Auth
  loginAsAdmin: (password: string) => boolean;
  loginAsGuru: (fullName: string) => boolean;
  loginAsPetugas: (username: string, password: string, expectedRole: 'seleksi' | 'pemilihan') => boolean;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => void;
  sessionTimeoutReason: string | null;
  clearSessionTimeoutReason: () => void;

  // Helpers
  getStudentById: (id: string) => Student | undefined;
  getClassById: (id: number) => Kelas | undefined;
  getTopCandidatesPerRombel: () => TopCandidatePerRombel[];
  hasStudentVotedSelection: (studentId: string) => boolean;
  hasStudentAttended: (studentId: string) => boolean;

  // Actions
  castSelectionVote: (voterStudentId: string, nominatedStudentIds: string[]) => { success: boolean; error?: string };
  savePlenoNote: (studentId: string, notes: string, isSelected: boolean) => void;
  saveCandidate: (candidateId: number, chairmanStudentId: string, viceChairmanStudentId: string, visionMission: string) => void;
  checkInStudent: (studentId: string) => { success: boolean; error?: string };
  castFinalVote: (candidateId: number) => { success: boolean; error?: string };

  // Bakal Calon Seleksi Management (Admin)
  addSelectionCandidate: (
    studentId: string,
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  addStudentAsSelectionCandidate: (
    fullName: string,
    classId: number,
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateSelectionCandidate: (id: string, updates: Partial<SelectionCandidate>) => Promise<void> | void;
  deleteSelectionCandidate: (id: string) => Promise<void> | void;
  bulkAddSelectionCandidates: (
    studentIds: string[]
  ) => Promise<{ addedCount: number }>;
  resetSelectionCandidates: () => Promise<void> | void;

  // Data Management (Admin)
  addStudent: (fullName: string, classId: number) => Promise<void> | void;
  updateStudent: (id: string, fullName: string, classId: number) => Promise<void> | void;
  deleteStudent: (id: string) => Promise<void> | void;
  importStudentsAndClasses: (
    items: { fullName: string; rombel: string; grade: 7 | 8 | 9 }[],
    mode: 'append' | 'replace'
  ) => Promise<{ success: boolean; importedStudentsCount: number; createdClassesCount: number; error?: string }>;
  addPetugas: (username: string, fullName: string, password: string, roleId: 3 | 4) => void;
  deletePetugas: (id: string) => void;
  addTeacher: (fullName: string, titleOrSubject?: string) => void;
  updateTeacher: (id: string, fullName: string) => void;
  deleteTeacher: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'smp_almuttaqin_pilketos_db_sync_';

export const DEFAULT_ADMIN: User = {
  id: '00000000-0000-4000-8000-000000000001',
  username: 'admin',
  full_name: 'Administrator',
  password: 'admin123',
  role_id: 1,
  created_at: '2026-09-01T00:00:00Z',
};

export const ROLE_PERMISSIONS: Record<
  UserRole,
  { allowedPages: PageView[]; defaultPage: PageView; label: string; description: string }
> = {
  seleksi: {
    allowedPages: ['seleksi'],
    defaultPage: 'seleksi',
    label: 'Petugas Seleksi',
    description: 'Hanya bisa membuka menu Bilik Seleksi (tidak bisa melihat hasil)',
  },
  pemilihan: {
    allowedPages: ['bilik_suara'],
    defaultPage: 'bilik_suara',
    label: 'Petugas Pemilihan',
    description: 'Hanya bisa membuka menu Bilik Suara (tidak bisa melihat hasil)',
  },
  guru: {
    allowedPages: ['dashboard', 'seleksi', 'rekap_seleksi', 'pleno', 'bilik_suara', 'laravel_code'],
    defaultPage: 'dashboard',
    label: 'Dewan Guru',
    description: 'Bisa melihat semua menu kecuali menu administratif khusus admin',
  },
  admin: {
    allowedPages: [
      'dashboard',
      'kandidat_seleksi',
      'seleksi',
      'rekap_seleksi',
      'pleno',
      'paslon',
      'bilik_suara',
      'absensi',
      'manajemen_siswa',
      'manajemen_guru',
      'manajemen_petugas',
      'laravel_code',
    ],
    defaultPage: 'dashboard',
    label: 'Administrator',
    description: 'Bisa mengakses semua menu tanpa terkecuali',
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any legacy demo mock data from previous sessions
  useEffect(() => {
    try {
      const oldKeys = [
        'smp_almuttaqin_pilketos_users',
        'smp_almuttaqin_pilketos_students',
        'smp_almuttaqin_pilketos_candidates',
        'smp_almuttaqin_pilketos_selectionVotes',
        'smp_almuttaqin_pilketos_plenoEvaluations',
        'smp_almuttaqin_pilketos_votingAttendances',
        'smp_almuttaqin_pilketos_finalVotes',
        'smp_almuttaqin_pilketos_currentUser',
      ];
      oldKeys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  // Require explicit login when link is opened (do not keep old logged in user across link opening)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Inactivity timeout message state
  const [sessionTimeoutReason, setSessionTimeoutReason] = useState<string | null>(null);

  const clearSessionTimeoutReason = () => {
    setSessionTimeoutReason(null);
  };

  const [activePage, setActivePage] = useState<PageView>('dashboard');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_PREFIX + 'sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_PREFIX + 'sidebar_collapsed', String(next));
      return next;
    });
  };

  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [classes, setClasses] = useState<Kelas[]>(INITIAL_CLASSES);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [selectionCandidates, setSelectionCandidates] = useState<SelectionCandidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'selectionCandidates');
      return saved ? JSON.parse(saved) : INITIAL_SELECTION_CANDIDATES;
    } catch {
      return INITIAL_SELECTION_CANDIDATES;
    }
  });

  const [selectionVotes, setSelectionVotes] = useState<SelectionVote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'selectionVotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [plenoEvaluations, setPlenoEvaluations] = useState<PlenoEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'plenoEvaluations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'candidates');
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  });

  const [votingAttendances, setVotingAttendances] = useState<VotingAttendance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'votingAttendances');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [finalVotes, setFinalVotes] = useState<FinalVote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'finalVotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealth | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState(false);
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Test Supabase connection
  const checkSupabaseHealth = async (): Promise<SupabaseHealth | void> => {
    setIsTestingSupabase(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseStatus(res);
      return res;
    } catch {
      // ignore
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Sync / Seed initial data to Supabase
  const syncDataToSupabase = async () => {
    setIsSyncingWithSupabase(true);
    try {
      const res = await seedInitialDataToSupabase({
        roles: roles.length > 0 ? roles : INITIAL_ROLES,
        classes: classes.length > 0 ? classes : INITIAL_CLASSES,
        users: users.length > 0 ? users : INITIAL_USERS,
        students: students.length > 0 ? students : INITIAL_STUDENTS,
        selectionCandidates: selectionCandidates.length > 0 ? selectionCandidates : INITIAL_SELECTION_CANDIDATES,
        candidates: candidates.length > 0 ? candidates : INITIAL_CANDIDATES,
      });
      await checkSupabaseHealth();
      return res;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal sinkronisasi data' };
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  // Load data from Supabase - mirror the database rows directly
  const loadDataFromSupabase = async () => {
    setIsLoadingFromSupabase(true);
    try {
      const res = await fetchAllSupabaseData();
      if (res.success) {
        if (res.roles && res.roles.length > 0) setRoles(res.roles);
        if (res.classes && res.classes.length > 0) setClasses(res.classes);
        if (res.users && res.users.length > 0) setUsers(res.users);
        if (res.students !== null && res.students !== undefined) setStudents(res.students);
        if (res.selectionCandidates !== null && res.selectionCandidates !== undefined) {
          setSelectionCandidates(res.selectionCandidates);
        }
        if (res.candidates !== null && res.candidates !== undefined) setCandidates(res.candidates);
        if (res.selectionVotes !== null && res.selectionVotes !== undefined) setSelectionVotes(res.selectionVotes);
        if (res.plenoEvaluations !== null && res.plenoEvaluations !== undefined) setPlenoEvaluations(res.plenoEvaluations);
        if (res.votingAttendances !== null && res.votingAttendances !== undefined) setVotingAttendances(res.votingAttendances);
        if (res.finalVotes !== null && res.finalVotes !== undefined) setFinalVotes(res.finalVotes);
        return { success: true, message: 'Data disinkronkan langsung dengan isi database Supabase!' };
      }
      return { success: false, message: res.error || 'Tidak ada data di Supabase' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengambil data dari Supabase' };
    } finally {
      setIsLoadingFromSupabase(false);
    }
  };

  // Auto-check and auto-load on mount
  useEffect(() => {
    const initSupabase = async () => {
      const health = await checkSupabaseHealth();
      if (health && health.isConnected) {
        await loadDataFromSupabase();
      }
    };
    initSupabase();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'selectionCandidates', JSON.stringify(selectionCandidates));
  }, [selectionCandidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'selectionVotes', JSON.stringify(selectionVotes));
  }, [selectionVotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'plenoEvaluations', JSON.stringify(plenoEvaluations));
  }, [plenoEvaluations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'votingAttendances', JSON.stringify(votingAttendances));
  }, [votingAttendances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'finalVotes', JSON.stringify(finalVotes));
  }, [finalVotes]);

  const currentRole: UserRole | null = currentUser
    ? (roles.find((r) => r.id === currentUser.role_id)?.name as UserRole) || null
    : null;

  // Strict Role Permissions Enforcement
  useEffect(() => {
    if (!currentUser || !currentRole) return;
    const permissions = ROLE_PERMISSIONS[currentRole];
    if (permissions && !permissions.allowedPages.includes(activePage)) {
      setActivePage(permissions.defaultPage);
    }
  }, [currentUser, currentRole, activePage]);

  // Helpers
  const getStudentById = (id: string) => students.find((s) => s.id === id);
  const getClassById = (id: number) => classes.find((c) => c.id === id);

  const hasStudentVotedSelection = (studentId: string) => {
    return selectionVotes.some((sv) => sv.voter_student_id === studentId);
  };

  const hasStudentAttended = (studentId: string) => {
    return votingAttendances.some((va) => va.student_id === studentId);
  };

  // Top 3 from each rombel in Grade 7 and 8 (7A, 7B, 8A, 8B)
  const getTopCandidatesPerRombel = (): TopCandidatePerRombel[] => {
    // If no votes have been submitted yet, return empty list (reflecting empty selection)
    if (selectionVotes.length === 0) {
      return [];
    }

    const targetClasses = classes.filter((c) => c.grade === 7 || c.grade === 8);
    const results: TopCandidatePerRombel[] = [];

    // Count votes for each nominated student
    const voteCounts: Record<string, number> = {};
    selectionVotes.forEach((sv) => {
      voteCounts[sv.nominated_student_id] = (voteCounts[sv.nominated_student_id] || 0) + 1;
    });

    targetClasses.forEach((kelas) => {
      // Only include students who actually received votes
      const classStudents = students.filter(
        (s) => s.class_id === kelas.id && (voteCounts[s.id] || 0) > 0
      );
      const sorted = [...classStudents].sort((a, b) => {
        const votesA = voteCounts[a.id] || 0;
        const votesB = voteCounts[b.id] || 0;
        if (votesB !== votesA) return votesB - votesA;
        return a.full_name.localeCompare(b.full_name);
      });

      // Take top 3 for each rombel
      sorted.slice(0, 3).forEach((std, idx) => {
        results.push({
          student: std,
          kelas,
          voteCount: voteCounts[std.id] || 0,
          rankInRombel: idx + 1,
        });
      });
    });

    return results;
  };

  // 5-Minute Inactivity Auto Logout System (300,000 ms)
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!currentUser) return;

    // Reset last activity timestamp on login or user switch
    lastActivityRef.current = Date.now();

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
      'click',
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Periodic check every 5 seconds for inactivity timeout
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        setCurrentUser(null);
        setActivePage('dashboard');
        setSessionTimeoutReason(
          'Sesi Anda telah otomatis keluar karena tidak ada aktivitas selama 5 menit. Demi keamanan data, silakan masuk kembali.'
        );
      }
    }, 5000);

    // Immediate check if browser tab is focused or becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        setCurrentUser(null);
        setActivePage('dashboard');
        setSessionTimeoutReason(
          'Sesi Anda telah otomatis keluar karena tidak ada aktivitas selama 5 menit. Demi keamanan data, silakan masuk kembali.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, recordActivity);
      });
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [currentUser]);

  // Auth
  const loginAsAdmin = (password: string) => {
    setSessionTimeoutReason(null);
    lastActivityRef.current = Date.now();
    const adminUser = users.find((u) => u.role_id === 1);
    if (!adminUser) {
      // If database has no admin record yet, accept default admin credentials and ensure it exists
      if (password === 'admin123') {
        setCurrentUser(DEFAULT_ADMIN);
        setActivePage('dashboard');
        // Persist admin to Supabase so it becomes recorded
        supabase.from('users').upsert({
          id: DEFAULT_ADMIN.id,
          username: DEFAULT_ADMIN.username,
          full_name: DEFAULT_ADMIN.full_name,
          password: DEFAULT_ADMIN.password,
          role_id: DEFAULT_ADMIN.role_id,
        }, { onConflict: 'username' }).then(({ error }) => {
          if (!error) {
            supabase.from('users').select('*').then((fetchRes) => {
              if (fetchRes.data) setUsers(fetchRes.data as User[]);
            });
          }
        });
        return true;
      }
      return false;
    }
    if (password === (adminUser.password || 'admin123')) {
      setCurrentUser(adminUser);
      setActivePage('dashboard');
      return true;
    }
    return false;
  };

  const loginAsGuru = (fullName: string) => {
    setSessionTimeoutReason(null);
    lastActivityRef.current = Date.now();
    const trimmed = fullName.trim().toLowerCase();
    if (!trimmed) return false;

    // Search for teacher in master data with role_id === 2
    const teacherUser = users.find((u) => {
      if (u.role_id !== 2) return false;
      const targetName = u.full_name.trim().toLowerCase();
      const baseName = targetName.split('(')[0].trim();
      return targetName === trimmed || baseName === trimmed || targetName.includes(trimmed);
    });

    if (teacherUser) {
      setCurrentUser(teacherUser);
      setActivePage('pleno');
      return true;
    }
    return false;
  };

  const loginAsPetugas = (username: string, password: string, expectedRole: 'seleksi' | 'pemilihan') => {
    setSessionTimeoutReason(null);
    lastActivityRef.current = Date.now();
    const targetRoleId = expectedRole === 'seleksi' ? 3 : 4;
    const user = users.find(
      (u) => u.role_id === targetRoleId && u.username?.toLowerCase() === username.trim().toLowerCase()
    );
    if (user && user.password === password) {
      setCurrentUser(user);
      setActivePage(expectedRole === 'seleksi' ? 'seleksi' : 'bilik_suara');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSessionTimeoutReason(null);
    localStorage.removeItem(STORAGE_PREFIX + 'currentUser');
  };

  const quickSwitchRole = (role: UserRole) => {
    if (role === 'admin') {
      const admin = users.find((u) => u.role_id === 1) || DEFAULT_ADMIN;
      setCurrentUser(admin);
      setActivePage('dashboard');
    } else if (role === 'guru') {
      const teacher = users.find((u) => u.role_id === 2);
      if (teacher) {
        setCurrentUser(teacher);
        setActivePage('pleno');
      } else {
        alert('Belum ada data guru di database. Masuk sebagai Admin untuk mendaftarkan guru.');
      }
    } else if (role === 'seleksi') {
      const sel = users.find((u) => u.role_id === 3);
      if (sel) {
        setCurrentUser(sel);
        setActivePage('seleksi');
      } else {
        alert('Belum ada akun petugas seleksi di database. Buat akun petugas di menu Kelola Petugas.');
      }
    } else if (role === 'pemilihan') {
      const pem = users.find((u) => u.role_id === 4);
      if (pem) {
        setCurrentUser(pem);
        setActivePage('bilik_suara');
      } else {
        alert('Belum ada akun petugas pemilihan di database. Buat akun petugas di menu Kelola Petugas.');
      }
    }
  };

  // Actions
  const castSelectionVote = (voterStudentId: string, nominatedStudentIds: string[]) => {
    if (hasStudentVotedSelection(voterStudentId)) {
      return { success: false, error: 'Siswa pemilih ini telah menggunakan hak pilih seleksi sebelumnya.' };
    }

    if (nominatedStudentIds.length !== 3) {
      return { success: false, error: 'Wajib memilih tepat 3 nama calon siswa dari kelas 7 atau 8.' };
    }

    // Check unique
    const uniqueIds = new Set(nominatedStudentIds);
    if (uniqueIds.size !== 3) {
      return { success: false, error: 'Tiga nama calon yang dipilih harus berbeda.' };
    }

    const voter = getStudentById(voterStudentId);
    if (!voter) {
      return { success: false, error: 'Data siswa pemilih tidak ditemukan.' };
    }
    const voterClass = getClassById(voter.class_id);
    if (!voterClass) {
      return { success: false, error: 'Data kelas pemilih tidak valid.' };
    }

    const voterRombelGroup = voterClass.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();

    const choice1 = getStudentById(nominatedStudentIds[0]);
    const choice2 = getStudentById(nominatedStudentIds[1]);
    const choice3 = getStudentById(nominatedStudentIds[2]);

    if (!choice1 || !choice2 || !choice3) {
      return { success: false, error: 'Data salah satu calon tidak ditemukan.' };
    }

    const c1Class = getClassById(choice1.class_id);
    const c2Class = getClassById(choice2.class_id);
    const c3Class = getClassById(choice3.class_id);

    if (!c1Class || !c2Class || !c3Class) {
      return { success: false, error: 'Data kelas calon tidak valid.' };
    }

    // Rule 1: Sensitif Rombel (Rombel A hanya pilih A, Rombel B hanya pilih B)
    const choices = [
      { name: 'Pilihan 1', student: choice1, kelas: c1Class },
      { name: 'Pilihan 2', student: choice2, kelas: c2Class },
      { name: 'Pilihan 3', student: choice3, kelas: c3Class },
    ];

    // Verification: Calon wajib terdaftar dalam daftar bakal calon resmi yang diinput oleh Administrator
    if (selectionCandidates.length > 0) {
      for (const c of choices) {
        const isRegistered = selectionCandidates.some(
          (sc) => sc.student_id === c.student.id && sc.is_active !== false
        );
        if (!isRegistered) {
          return {
            success: false,
            error: `Nama "${c.student.full_name}" bukan merupakan bakal calon resmi yang telah diinput/disetujui oleh Administrator.`,
          };
        }
      }
    }

    for (const c of choices) {
      const cRombelGroup = c.kelas.rombel.replace(/^[0-9]+/, '').trim().toUpperCase();
      if (cRombelGroup !== voterRombelGroup) {
        return {
          success: false,
          error: `Pembatasan Rombel: Pemilih Rombel ${voterClass.rombel} hanya boleh memilih calon dari Rombel ${voterRombelGroup}. (${c.name}: ${c.student.full_name} dari kelas ${c.kelas.rombel} tidak valid).`,
        };
      }
      if (c.kelas.grade === 9) {
        return {
          success: false,
          error: `Siswa kelas 9 (${c.student.full_name}) tidak dapat dicalonkan. Calon hanya dari kelas 7 atau 8.`,
        };
      }
    }

    // Rule 2: Aturan Komposisi Pilihan
    if (voterClass.grade === 7) {
      // Pilihan 1 & 2 wajib dari kelasnya sendiri (kelas 7)
      if (c1Class.grade !== 7 || c2Class.grade !== 7) {
        return {
          success: false,
          error: `Aturan Pemilih Kelas ${voterClass.rombel}: Pilihan 1 dan 2 wajib memilih siswa dari kelas ${voterClass.rombel} sendiri.`,
        };
      }
      // Pilihan 3 wajib dari kelas atasnya (kelas 8)
      if (c3Class.grade !== 8) {
        return {
          success: false,
          error: `Aturan Pemilih Kelas ${voterClass.rombel}: Pilihan 3 wajib memilih siswa dari kelas 8 (Rombel ${voterRombelGroup}).`,
        };
      }
    } else if (voterClass.grade === 8) {
      // Pilihan 1 & 2 wajib dari kelasnya sendiri (kelas 8)
      if (c1Class.grade !== 8 || c2Class.grade !== 8) {
        return {
          success: false,
          error: `Aturan Pemilih Kelas ${voterClass.rombel}: Pilihan 1 dan 2 wajib memilih siswa dari kelas ${voterClass.rombel} sendiri.`,
        };
      }
      // Pilihan 3 wajib dari kelas bawahnya (kelas 7)
      if (c3Class.grade !== 7) {
        return {
          success: false,
          error: `Aturan Pemilih Kelas ${voterClass.rombel}: Pilihan 3 wajib memilih siswa dari kelas 7 (Rombel ${voterRombelGroup}).`,
        };
      }
    } else if (voterClass.grade === 9) {
      // Bebas menentukan dari kelas 7 maupun 8, tetapi tetap sensitif rombel (sudah dicek di atas)
      // dan calon tidak boleh kelas 9
      for (const c of choices) {
        if (c.kelas.grade !== 7 && c.kelas.grade !== 8) {
          return {
            success: false,
            error: `Aturan Pemilih Kelas 9: Pilihan harus berasal dari kelas 7 atau 8 (Rombel ${voterRombelGroup}).`,
          };
        }
      }
    }

    const newVotes: SelectionVote[] = nominatedStudentIds.map((nomId, idx) => ({
      id: Date.now() + idx,
      voter_student_id: voterStudentId,
      nominated_student_id: nomId,
      created_at: new Date().toISOString(),
    }));

    setSelectionVotes((prev) => [...prev, ...newVotes]);

    // Background sync to Supabase
    newVotes.forEach((nv) => {
      supabase.from('selection_votes').insert({
        voter_student_id: nv.voter_student_id,
        nominated_student_id: nv.nominated_student_id,
        created_at: nv.created_at,
      }).then(({ error }) => {
        if (error) console.warn('Supabase selection_votes insert:', error.message);
      });
    });

    return { success: true };
  };

  const savePlenoNote = (studentId: string, notes: string, isSelected: boolean) => {
    if (!currentUser) return;
    setPlenoEvaluations((prev) => {
      const existingIndex = prev.findIndex((pe) => pe.student_id === studentId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          teacher_user_id: currentUser.id,
          teacher_notes: notes,
          is_selected_for_paslon: isSelected,
        };
        return updated;
      } else {
        const newRecord: PlenoEvaluation = {
          id: Date.now(),
          student_id: studentId,
          teacher_user_id: currentUser.id,
          teacher_notes: notes,
          is_selected_for_paslon: isSelected,
          created_at: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });

    // Background sync to Supabase
    supabase.from('pleno_evaluations').upsert(
      {
        student_id: studentId,
        teacher_user_id: currentUser.id,
        teacher_notes: notes,
        is_selected_for_paslon: isSelected,
      },
      { onConflict: 'student_id' }
    ).then(({ error }) => {
      if (error) console.warn('Supabase pleno_evaluations upsert:', error.message);
    });
  };

  const saveCandidate = (
    candidateId: number,
    chairmanStudentId: string,
    viceChairmanStudentId: string,
    visionMission: string
  ) => {
    setCandidates((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === candidateId);
      const updatedItem: Candidate = {
        id: candidateId,
        chairman_student_id: chairmanStudentId,
        vice_chairman_student_id: viceChairmanStudentId,
        vision_mission: visionMission,
        created_at: existingIdx >= 0 ? prev[existingIdx].created_at : new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedItem;
        return copy;
      }
      return [...prev, updatedItem];
    });

    // Background sync to Supabase
    supabase.from('candidates').upsert(
      {
        id: candidateId,
        chairman_student_id: chairmanStudentId,
        vice_chairman_student_id: viceChairmanStudentId,
        vision_mission: visionMission,
      },
      { onConflict: 'id' }
    ).then(({ error }) => {
      if (error) console.warn('Supabase candidates upsert:', error.message);
    });
  };

  const checkInStudent = (studentId: string) => {
    if (hasStudentAttended(studentId)) {
      return { success: false, error: 'Siswa ini sudah melakukan absensi kehadiran sebelumnya.' };
    }
    const newRecord: VotingAttendance = {
      id: Date.now(),
      student_id: studentId,
      attended_at: new Date().toISOString(),
    };
    setVotingAttendances((prev) => [...prev, newRecord]);

    // Background sync to Supabase
    supabase.from('voting_attendances').insert({
      student_id: studentId,
      attended_at: newRecord.attended_at,
    }).then(({ error }) => {
      if (error) console.warn('Supabase voting_attendances insert:', error.message);
    });

    return { success: true };
  };

  const castFinalVote = (candidateId: number) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      return { success: false, error: 'Pasangan calon tidak valid.' };
    }
    // Anonymously record in final_votes table (no voter student_id stored)
    const newVote: FinalVote = {
      id: Date.now(),
      candidate_id: candidateId,
      voted_at: new Date().toISOString(),
    };
    setFinalVotes((prev) => [...prev, newVote]);

    // Background sync to Supabase
    supabase.from('final_votes').insert({
      candidate_id: candidateId,
      voted_at: newVote.voted_at,
    }).then(({ error }) => {
      if (error) console.warn('Supabase final_votes insert:', error.message);
    });

    return { success: true };
  };

  const addStudent = async (fullName: string, classId: number) => {
    const newStudent: Student = {
      id: generateUUID(),
      full_name: fullName.trim(),
      class_id: classId,
      created_at: new Date().toISOString(),
    };
    setStudents((prev) => [...prev, newStudent]);

    try {
      const { error } = await supabase.from('students').insert({
        id: newStudent.id,
        full_name: newStudent.full_name,
        class_id: newStudent.class_id,
        created_at: newStudent.created_at,
      });
      if (error) console.warn('Supabase students insert:', error.message);
    } catch (err: any) {
      console.warn('Supabase students insert exception:', err?.message);
    }
  };

  const updateStudent = async (id: string, fullName: string, classId: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, full_name: fullName.trim(), class_id: classId } : s))
    );

    try {
      const { error } = await supabase
        .from('students')
        .update({
          full_name: fullName.trim(),
          class_id: classId,
        })
        .eq('id', id);
      if (error) console.warn('Supabase students update:', error.message);
    } catch (err: any) {
      console.warn('Supabase students update exception:', err?.message);
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSelectionCandidates((prev) => prev.filter((c) => c.student_id !== id));

    try {
      // First delete associated selection candidate if any
      await supabase.from('selection_candidates').delete().eq('student_id', id);
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) console.warn('Supabase students delete:', error.message);
    } catch (err: any) {
      console.warn('Supabase students delete exception:', err?.message);
    }
  };

  // Selection Candidates (Bakal Calon) Management
  const addSelectionCandidate = async (
    studentId: string,
    notes: string = ''
  ): Promise<{ success: boolean; error?: string }> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, error: 'Data santri tidak ditemukan.' };
    }
    const alreadyExists = selectionCandidates.some((c) => c.student_id === studentId);
    if (alreadyExists) {
      return { success: false, error: `Santri "${student.full_name}" sudah terdaftar sebagai kandidat bakal calon.` };
    }

    const newCandidate: SelectionCandidate = {
      id: generateUUID(),
      student_id: studentId,
      notes: notes.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setSelectionCandidates((prev) => [...prev, newCandidate]);

    try {
      // Delete any pre-existing record with same student_id to prevent duplicates
      await supabase.from('selection_candidates').delete().eq('student_id', studentId);
      const { error } = await supabase.from('selection_candidates').insert({
        id: newCandidate.id,
        student_id: newCandidate.student_id,
        notes: newCandidate.notes,
        is_active: newCandidate.is_active,
        created_at: newCandidate.created_at,
      });
      if (error) {
        console.warn('Supabase selection_candidates insert error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase insert candidate exception:', err?.message);
    }

    return { success: true };
  };

  const addStudentAsSelectionCandidate = async (
    fullName: string,
    classId: number,
    notes: string = ''
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return { success: false, error: 'Nama lengkap santri tidak boleh kosong.' };
    }

    const newStudentId = generateUUID();
    const newStudent: Student = {
      id: newStudentId,
      full_name: trimmed,
      class_id: classId,
      created_at: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);

    const newCandidate: SelectionCandidate = {
      id: generateUUID(),
      student_id: newStudentId,
      notes: notes.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setSelectionCandidates((prev) => [...prev, newCandidate]);

    try {
      // Insert student first
      await supabase.from('students').insert({
        id: newStudent.id,
        full_name: newStudent.full_name,
        class_id: newStudent.class_id,
        created_at: newStudent.created_at,
      });

      // Insert candidate
      await supabase.from('selection_candidates').insert({
        id: newCandidate.id,
        student_id: newCandidate.student_id,
        notes: newCandidate.notes,
        is_active: newCandidate.is_active,
        created_at: newCandidate.created_at,
      });
    } catch (err: any) {
      console.warn('Supabase addStudentAsSelectionCandidate error:', err?.message);
    }

    return { success: true };
  };

  const updateSelectionCandidate = async (id: string, updates: Partial<SelectionCandidate>) => {
    setSelectionCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    try {
      const { error } = await supabase
        .from('selection_candidates')
        .update(updates)
        .eq('id', id);
      if (error) console.warn('Supabase selection_candidates update:', error.message);
    } catch (err: any) {
      console.warn('Supabase selection_candidates update exception:', err?.message);
    }
  };

  const deleteSelectionCandidate = async (id: string) => {
    const cand = selectionCandidates.find((c) => c.id === id);
    const candStudentId = cand?.student_id;

    setSelectionCandidates((prev) => prev.filter((c) => c.id !== id));

    try {
      if (candStudentId) {
        await supabase
          .from('selection_candidates')
          .delete()
          .or(`id.eq.${id},student_id.eq.${candStudentId}`);
      } else {
        await supabase.from('selection_candidates').delete().eq('id', id);
      }
    } catch (err: any) {
      console.warn('Supabase selection_candidates delete exception:', err?.message);
    }
  };

  const bulkAddSelectionCandidates = async (
    studentIds: string[]
  ): Promise<{ addedCount: number }> => {
    let addedCount = 0;
    const newItems: SelectionCandidate[] = [];
    setSelectionCandidates((prev) => {
      const existingIds = new Set(prev.map((c) => c.student_id));
      for (const sid of studentIds) {
        if (!existingIds.has(sid)) {
          const item: SelectionCandidate = {
            id: generateUUID(),
            student_id: sid,
            notes: '',
            is_active: true,
            created_at: new Date().toISOString(),
          };
          newItems.push(item);
          existingIds.add(sid);
          addedCount++;
        }
      }
      return [...prev, ...newItems];
    });

    if (newItems.length > 0) {
      try {
        for (const item of newItems) {
          await supabase.from('selection_candidates').delete().eq('student_id', item.student_id);
          await supabase.from('selection_candidates').insert({
            id: item.id,
            student_id: item.student_id,
            notes: item.notes,
            is_active: item.is_active,
            created_at: item.created_at,
          });
        }
      } catch (err: any) {
        console.warn('Supabase bulk selection_candidates insert:', err?.message);
      }
    }

    return { addedCount };
  };

  const resetSelectionCandidates = async () => {
    setSelectionCandidates(INITIAL_SELECTION_CANDIDATES);
    localStorage.setItem(STORAGE_PREFIX + 'selectionCandidates', JSON.stringify(INITIAL_SELECTION_CANDIDATES));
    try {
      await supabase.from('selection_candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('selection_candidates').insert(
        INITIAL_SELECTION_CANDIDATES.map((sc) => ({
          id: sc.id,
          student_id: sc.student_id,
          notes: sc.notes || '',
          is_active: sc.is_active,
          created_at: sc.created_at,
        }))
      );
    } catch (err: any) {
      console.warn('Supabase resetSelectionCandidates error:', err?.message);
    }
  };

  const importStudentsAndClasses = async (
    items: { fullName: string; rombel: string; grade: 7 | 8 | 9 }[],
    mode: 'append' | 'replace'
  ): Promise<{ success: boolean; importedStudentsCount: number; createdClassesCount: number; error?: string }> => {
    try {
      // 1. Identify missing classes
      const currentClasses = [...classes];
      const existingRombelMap = new Map<string, Kelas>();
      currentClasses.forEach((c) => existingRombelMap.set(c.rombel.toUpperCase(), c));

      let maxClassId = currentClasses.reduce((max, c) => Math.max(max, c.id), 0);
      const newClassesToCreate: Kelas[] = [];

      items.forEach((item) => {
        const upper = item.rombel.toUpperCase();
        if (!existingRombelMap.has(upper)) {
          maxClassId += 1;
          const newClass: Kelas = {
            id: maxClassId,
            grade: item.grade,
            rombel: item.rombel,
            created_at: new Date().toISOString(),
          };
          existingRombelMap.set(upper, newClass);
          newClassesToCreate.push(newClass);
        }
      });

      // If new classes were created, upsert them to Supabase and update state
      if (newClassesToCreate.length > 0) {
        const updatedClasses = [...currentClasses, ...newClassesToCreate];
        setClasses(updatedClasses);

        const { error: clsErr } = await supabase.from('classes').upsert(
          newClassesToCreate.map((c) => ({ id: c.id, grade: c.grade, rombel: c.rombel })),
          { onConflict: 'id' }
        );
        if (clsErr) console.warn('Supabase classes upsert:', clsErr.message);
      }

      // 2. Prepare student records
      const newStudentRecords: Student[] = items.map((item) => {
        const kls = existingRombelMap.get(item.rombel.toUpperCase()) || currentClasses[0];
        return {
          id: generateUUID(),
          full_name: item.fullName.trim(),
          class_id: kls ? kls.id : 1,
          created_at: new Date().toISOString(),
        };
      });

      // 3. Handle Replace vs Append
      if (mode === 'replace') {
        setStudents(newStudentRecords);
        // Clean existing students in Supabase
        await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } else {
        setStudents((prev) => [...prev, ...newStudentRecords]);
      }

      // 4. Batch insert into Supabase
      const batchSize = 100;
      for (let i = 0; i < newStudentRecords.length; i += batchSize) {
        const batch = newStudentRecords.slice(i, i + batchSize).map((s) => ({
          id: s.id,
          full_name: s.full_name,
          class_id: s.class_id,
          created_at: s.created_at,
        }));
        const { error: stdErr } = await supabase.from('students').insert(batch);
        if (stdErr) {
          console.warn('Supabase batch insert students error:', stdErr.message);
        }
      }

      return {
        success: true,
        importedStudentsCount: newStudentRecords.length,
        createdClassesCount: newClassesToCreate.length,
      };
    } catch (err: any) {
      return {
        success: false,
        importedStudentsCount: 0,
        createdClassesCount: 0,
        error: err?.message || 'Gagal mengimpor data ke database.',
      };
    }
  };

  const addPetugas = (username: string, fullName: string, password: string, roleId: 3 | 4) => {
    const newUser: User = {
      id: generateUUID(),
      username: username.trim(),
      full_name: fullName.trim(),
      password: password.trim(),
      role_id: roleId,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);

    // Background sync to Supabase
    supabase.from('users').insert({
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.full_name,
      password: newUser.password,
      role_id: newUser.role_id,
      created_at: newUser.created_at,
    }).then(({ error }) => {
      if (error) console.warn('Supabase users insert:', error.message);
    });
  };

  const deletePetugas = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    // Background sync to Supabase
    supabase.from('users').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase users delete:', error.message);
    });
  };

  const addTeacher = (fullName: string, titleOrSubject?: string) => {
    const trimmedName = fullName.trim();
    const trimmedTitle = titleOrSubject?.trim();
    const finalFullName = trimmedTitle ? `${trimmedName} (${trimmedTitle})` : trimmedName;
    const generatedUsername = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
      .slice(0, 30);

    const newTeacher: User = {
      id: generateUUID(),
      username: generatedUsername || 'guru.' + Date.now(),
      full_name: finalFullName,
      password: '', // Guru tidak memerlukan password
      role_id: 2, // Role Guru
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newTeacher]);

    // Background sync to Supabase
    supabase.from('users').insert({
      id: newTeacher.id,
      username: newTeacher.username,
      full_name: newTeacher.full_name,
      role_id: 2,
      created_at: newTeacher.created_at,
    }).then(({ error }) => {
      if (error) console.warn('Supabase teacher insert:', error.message);
    });
  };

  const updateTeacher = (id: string, fullName: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, full_name: fullName.trim() } : u))
    );

    // Background sync to Supabase
    supabase.from('users').update({
      full_name: fullName.trim(),
    }).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase teacher update:', error.message);
    });
  };

  const deleteTeacher = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    // Background sync to Supabase
    supabase.from('users').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase teacher delete:', error.message);
    });
  };

  const resetAllData = async () => {
    localStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'students');
    localStorage.removeItem(STORAGE_PREFIX + 'selectionCandidates');
    localStorage.removeItem(STORAGE_PREFIX + 'selectionVotes');
    localStorage.removeItem(STORAGE_PREFIX + 'plenoEvaluations');
    localStorage.removeItem(STORAGE_PREFIX + 'candidates');
    localStorage.removeItem(STORAGE_PREFIX + 'votingAttendances');
    localStorage.removeItem(STORAGE_PREFIX + 'finalVotes');

    setRoles(INITIAL_ROLES);
    setClasses(INITIAL_CLASSES);
    setUsers(INITIAL_USERS);
    setStudents(INITIAL_STUDENTS);
    setSelectionCandidates(INITIAL_SELECTION_CANDIDATES);
    setCandidates(INITIAL_CANDIDATES);
    setSelectionVotes([]);
    setPlenoEvaluations([]);
    setVotingAttendances([]);
    setFinalVotes([]);

    await seedInitialDataToSupabase({
      roles: INITIAL_ROLES,
      classes: INITIAL_CLASSES,
      users: INITIAL_USERS,
      students: INITIAL_STUDENTS,
      selectionCandidates: INITIAL_SELECTION_CANDIDATES,
      candidates: INITIAL_CANDIDATES,
    });
    await checkSupabaseHealth();
    setCurrentUser(DEFAULT_ADMIN);
    setActivePage('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        activePage,
        setActivePage,
        supabaseStatus,
        isTestingSupabase,
        isSyncingWithSupabase,
        isLoadingFromSupabase,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        checkSupabaseHealth,
        syncDataToSupabase,
        loadDataFromSupabase,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        roles,
        users,
        classes,
        students,
        selectionCandidates,
        selectionVotes,
        plenoEvaluations,
        candidates,
        votingAttendances,
        finalVotes,
        loginAsAdmin,
        loginAsGuru,
        loginAsPetugas,
        logout,
        quickSwitchRole,
        sessionTimeoutReason,
        clearSessionTimeoutReason,
        getStudentById,
        getClassById,
        getTopCandidatesPerRombel,
        hasStudentVotedSelection,
        hasStudentAttended,
        castSelectionVote,
        savePlenoNote,
        saveCandidate,
        checkInStudent,
        castFinalVote,
        addSelectionCandidate,
        addStudentAsSelectionCandidate,
        updateSelectionCandidate,
        deleteSelectionCandidate,
        bulkAddSelectionCandidates,
        resetSelectionCandidates,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudentsAndClasses,
        addPetugas,
        deletePetugas,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
