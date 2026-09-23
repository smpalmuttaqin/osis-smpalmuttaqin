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

export const INITIAL_ROLES: Role[] = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'guru' },
  { id: 3, name: 'seleksi' },
  { id: 4, name: 'pemilihan' },
];

export const INITIAL_CLASSES: Kelas[] = [
  { id: 1, grade: 7, rombel: '7A', created_at: '2026-08-01T08:00:00Z' },
  { id: 2, grade: 7, rombel: '7B', created_at: '2026-08-01T08:00:00Z' },
  { id: 3, grade: 8, rombel: '8A', created_at: '2026-08-01T08:00:00Z' },
  { id: 4, grade: 8, rombel: '8B', created_at: '2026-08-01T08:00:00Z' },
  { id: 5, grade: 9, rombel: '9A', created_at: '2026-08-01T08:00:00Z' },
  { id: 6, grade: 9, rombel: '9B', created_at: '2026-08-01T08:00:00Z' },
];

export const INITIAL_TEACHERS = [
  'Ahmad Fauzi, S.Pd. (Pembina OSIS)',
  'Drs. H. Mulyadi, M.Pd. (Kepala Sekolah)',
  'Dra. Hj. Siti Aminah, M.Pd. (Waka Kesiswaan)',
  'Nurul Hidayati, M.Pd. (Guru Bahasa Indonesia)',
  'Ridwan Kamil, S.Ag. (Guru Pendidikan Agama Islam)',
  'Dewi Sartika, S.Pd. (Guru Matematika)',
  'Budi Santoso, S.Kom. (Guru Informatika)',
  'Tri Wahyuni, S.Pd. (Guru IPA)',
];

export const INITIAL_USERS: User[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    username: 'admin',
    full_name: 'Administrator Pilketos',
    password: 'admin123',
    role_id: 1,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    username: 'petugas.seleksi',
    full_name: 'Petugas Bilik Seleksi A',
    password: 'seleksi123',
    role_id: 3,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    username: 'petugas.pemilihan',
    full_name: 'Operator Bilik Suara 1',
    password: 'pemilihan123',
    role_id: 4,
    created_at: '2026-08-01T08:00:00Z',
  },
  // Teacher accounts (Role 2)
  {
    id: '00000000-0000-4000-8000-000000000201',
    username: 'ahmad.fauzi',
    full_name: 'Ahmad Fauzi, S.Pd. (Pembina OSIS)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000202',
    username: 'mulyadi',
    full_name: 'Drs. H. Mulyadi, M.Pd. (Kepala Sekolah)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000203',
    username: 'siti.aminah',
    full_name: 'Dra. Hj. Siti Aminah, M.Pd. (Waka Kesiswaan)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000204',
    username: 'nurul.hidayati',
    full_name: 'Nurul Hidayati, M.Pd. (Guru Bahasa Indonesia)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000205',
    username: 'ridwan.kamil',
    full_name: 'Ridwan Kamil, S.Ag. (Guru Pendidikan Agama Islam)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000206',
    username: 'dewi.sartika',
    full_name: 'Dewi Sartika, S.Pd. (Guru Matematika)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000207',
    username: 'budi.santoso',
    full_name: 'Budi Santoso, S.Kom. (Guru Informatika)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000208',
    username: 'tri.wahyuni',
    full_name: 'Tri Wahyuni, S.Pd. (Guru IPA)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Kelas 7A (class_id: 1)
  { id: '00000000-0000-4000-8000-000000000711', full_name: 'Muhammad Farhan Al-Fatih', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000712', full_name: 'Aisyah Putri Azzahra', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000713', full_name: 'Danendra Raditya Pramono', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000714', full_name: 'Fatima Zahra Maulida', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000715', full_name: 'Ilham Bagus Saputra', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000716', full_name: 'Khadijah Nur Rohmah', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000717', full_name: 'Naufal Raihan Pratama', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000718', full_name: 'Salma Salsabila', class_id: 1, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 7B (class_id: 2)
  { id: '00000000-0000-4000-8000-000000000721', full_name: 'Zidan Ahmad Robbani', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000722', full_name: 'Annisa Larasati Wibowo', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000723', full_name: 'Fatih Al-Ghifari', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000724', full_name: 'Hafizhah Khairunnisa', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000725', full_name: 'M. Rizky Ramadhan', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000726', full_name: 'Najwa Syifa Salsabila', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000727', full_name: 'Rafiandra Dwi Putra', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000728', full_name: 'Syakira Ainun Najib', class_id: 2, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 8A (class_id: 3)
  { id: '00000000-0000-4000-8000-000000000811', full_name: 'Bintang Arya Pradana', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000812', full_name: 'Nayla Zahrotun Nisa', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000813', full_name: 'Fathurrahman Rasyid', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000814', full_name: 'Aliya Khansa Maharani', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000815', full_name: 'Dimas Aditya Nugroho', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000816', full_name: 'Kayla Hasna Humaira', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000817', full_name: 'Rangga Mahendra Putra', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000818', full_name: 'Yasmin Zulaikha', class_id: 3, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 8B (class_id: 4)
  { id: '00000000-0000-4000-8000-000000000821', full_name: 'Haidar Ali Al-Mansyur', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000822', full_name: 'Tiara Safitri Utami', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000823', full_name: 'Atharizz Calief Rahman', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000824', full_name: 'Faradiba Nurul Aini', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000825', full_name: 'Galih Bayu Samudra', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000826', full_name: 'Meisya Dwi Andini', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000827', full_name: 'Rian Syahputra Pratama', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000828', full_name: 'Zahra Amelia Hapsari', class_id: 4, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 9A (class_id: 5)
  { id: '00000000-0000-4000-8000-000000000911', full_name: 'Aditya Surya Wardhana', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000912', full_name: 'Clarissa Aurelia Putri', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000913', full_name: 'Fachry Akbar Santoso', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000914', full_name: 'Gita Permatasari', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000915', full_name: 'Iqbal Maulana Hakim', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000916', full_name: 'Karina Dwi Safitri', class_id: 5, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 9B (class_id: 6)
  { id: '00000000-0000-4000-8000-000000000921', full_name: 'Maulana Malik Ibrahim', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000922', full_name: 'Nabila Syakieb Kusuma', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000923', full_name: 'Panji Gumilang Pangestu', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000924', full_name: 'Ratu Bilqis Azzahro', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000925', full_name: 'Sultan Rafi Al-Ghifari', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000926', full_name: 'Vania Putri Kirana', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
];

// Initial candidate pool curated by Admin for Tahap 1 Seleksi
export const INITIAL_SELECTION_CANDIDATES: SelectionCandidate[] = [
  // Kelas 8A
  {
    id: '00000000-0000-4000-8000-000000008101',
    student_id: '00000000-0000-4000-8000-000000000811', // Bintang Arya Pradana
    notes: 'Ketua Pramuka Penggalang, berwibawa, disiplin ibadah',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000008102',
    student_id: '00000000-0000-4000-8000-000000000812', // Nayla Zahrotun Nisa
    notes: 'Peringkat 1 paralel, aktif forum debat dan pidato bahasa',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000008103',
    student_id: '00000000-0000-4000-8000-000000000813', // Fathurrahman Rasyid
    notes: 'Koordinator kebersihan & tahfidz Quran kelas 8',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },

  // Kelas 8B
  {
    id: '00000000-0000-4000-8000-000000008201',
    student_id: '00000000-0000-4000-8000-000000000821', // Haidar Ali Al-Mansyur
    notes: 'Hafalan Al-Quran 3 Juz, kepribadian tegas dan teladan',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000008202',
    student_id: '00000000-0000-4000-8000-000000000822', // Tiara Safitri Utami
    notes: 'Penggerak bakti sosial santri & aktif di PMR',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000008203',
    student_id: '00000000-0000-4000-8000-000000000823', // Atharizz Calief Rahman
    notes: 'Kreatif, juara lomba robotika & sains madrasah',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },

  // Kelas 7A
  {
    id: '00000000-0000-4000-8000-000000007101',
    student_id: '00000000-0000-4000-8000-000000000711', // Muhammad Farhan Al-Fatih
    notes: 'Ketua kelas 7A, komunikatif, representatif kelas 7',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000007102',
    student_id: '00000000-0000-4000-8000-000000000712', // Aisyah Putri Azzahra
    notes: 'Seksi keagamaan kelas 7A, santun dan rajin',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000007103',
    student_id: '00000000-0000-4000-8000-000000000713', // Danendra Raditya Pramono
    notes: 'Aktif di divisi kesenian & kreasi santri',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },

  // Kelas 7B
  {
    id: '00000000-0000-4000-8000-000000007201',
    student_id: '00000000-0000-4000-8000-000000000721', // Zidan Ahmad Robbani
    notes: 'Ketua kelas 7B, inisiator kegiatan ibadah bersama',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000007202',
    student_id: '00000000-0000-4000-8000-000000000722', // Annisa Larasati Wibowo
    notes: 'Seksi mading & literasi sekolah, tertib administrasi',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
  {
    id: '00000000-0000-4000-8000-000000007203',
    student_id: '00000000-0000-4000-8000-000000000723', // Fatih Al-Ghifari
    notes: 'Disiplin dan aktif di kegiatan kepanduan santri',
    is_active: true,
    created_at: '2026-08-05T08:00:00Z',
  },
];

export const INITIAL_SELECTION_VOTES: SelectionVote[] = [];

export const INITIAL_PLENO_EVALUATIONS: PlenoEvaluation[] = [];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 1,
    chairman_student_id: '00000000-0000-4000-8000-000000000811', // Bintang Arya Pradana (8A)
    vice_chairman_student_id: '00000000-0000-4000-8000-000000000711', // Muhammad Farhan Al-Fatih (7A)
    vision_mission: `VISI:
Mewujudkan OSIS SMP Al Muttaqin yang berakhlak mulia, berprestasi unggul, dan berwawasan digital dengan menjunjung tinggi nilai-nilai Islami.

MISI:
1. Mengoptimalkan pembiasaan ibadah harian (sholat dhuha dan tadarus) bersama warga sekolah.
2. Mengembangkan wadah bakat literasi, sains, dan teknologi secara kolaboratif.
3. Menciptakan lingkungan sekolah yang bersih, rukun, dan bebas perundungan.`,
    created_at: '2026-08-15T08:00:00Z',
  },
  {
    id: 2,
    chairman_student_id: '00000000-0000-4000-8000-000000000821', // Haidar Ali Al-Mansyur (8B)
    vice_chairman_student_id: '00000000-0000-4000-8000-000000000721', // Zidan Ahmad Robbani (7B)
    vision_mission: `VISI:
Membentuk generasi pemimpin muda SMP Al Muttaqin yang tangguh, amanah, kreatif, dan berintegritas tinggi dalam bingkai ukhuwah Islamiyah.

MISI:
1. Memperkuat kedisiplinan dan sopan santun santri di dalam maupun luar kelas.
2. Menghidupkan program kemandirian santri melalui kegiatan kreasi wirausaha OSIS.
3. Menjalin komunikasi transparan antara siswa, guru, dan pengurus OSIS.`,
    created_at: '2026-08-15T08:30:00Z',
  },
  {
    id: 3,
    chairman_student_id: '00000000-0000-4000-8000-000000000812', // Nayla Zahrotun Nisa (8A)
    vice_chairman_student_id: '00000000-0000-4000-8000-000000000822', // Tiara Safitri Utami (8B)
    vision_mission: `VISI:
Menjadikan OSIS SMP Al Muttaqin wadah inspiratif yang berdaya saing global tanpa melupakan akar budaya dan adab Islami.

MISI:
1. Meningkatkan kualitas program kerja yang berbasis kepedulian sosial dan lingkungan hidup.
2. Mengadakan forum aspirasi berkala untuk menyerap ide-ide inovatif seluruh siswa.
3. Mendorong prestasi santri dalam kompetisi akademik dan non-akademik tingkat kota hingga nasional.`,
    created_at: '2026-08-15T09:00:00Z',
  },
];

export const INITIAL_ATTENDANCES: VotingAttendance[] = [];

export const INITIAL_FINAL_VOTES: FinalVote[] = [];
