import { Role, User, Kelas, Student, SelectionVote, PlenoEvaluation, Candidate, VotingAttendance, FinalVote } from '../types/database';

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
    id: 'usr-admin-01',
    username: 'admin',
    full_name: 'Administrator Pilketos',
    password: 'admin123',
    role_id: 1,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-sel-01',
    username: 'petugas.seleksi',
    full_name: 'Petugas Bilik Seleksi A',
    password: 'seleksi123',
    role_id: 3,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-pem-01',
    username: 'petugas.pemilihan',
    full_name: 'Operator Bilik Suara 1',
    password: 'pemilihan123',
    role_id: 4,
    created_at: '2026-08-01T08:00:00Z',
  },
  // Teacher accounts (Role 2)
  {
    id: 'usr-tch-01',
    username: 'ahmad.fauzi',
    full_name: 'Ahmad Fauzi, S.Pd. (Pembina OSIS)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-02',
    username: 'mulyadi',
    full_name: 'Drs. H. Mulyadi, M.Pd. (Kepala Sekolah)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-03',
    username: 'siti.aminah',
    full_name: 'Dra. Hj. Siti Aminah, M.Pd. (Waka Kesiswaan)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-04',
    username: 'nurul.hidayati',
    full_name: 'Nurul Hidayati, M.Pd. (Guru Bahasa Indonesia)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-05',
    username: 'ridwan.kamil',
    full_name: 'Ridwan Kamil, S.Ag. (Guru Pendidikan Agama Islam)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-06',
    username: 'dewi.sartika',
    full_name: 'Dewi Sartika, S.Pd. (Guru Matematika)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-07',
    username: 'budi.santoso',
    full_name: 'Budi Santoso, S.Kom. (Guru Informatika)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'usr-tch-08',
    username: 'tri.wahyuni',
    full_name: 'Tri Wahyuni, S.Pd. (Guru IPA)',
    password: '',
    role_id: 2,
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Kelas 7A (class_id: 1)
  { id: 'std-7a-01', full_name: 'Muhammad Farhan Al-Fatih', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-02', full_name: 'Aisyah Putri Azzahra', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-03', full_name: 'Danendra Raditya Pramono', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-04', full_name: 'Fatima Zahra Maulida', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-05', full_name: 'Ilham Bagus Saputra', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-06', full_name: 'Khadijah Nur Rohmah', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-07', full_name: 'Naufal Raihan Pratama', class_id: 1, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7a-08', full_name: 'Salma Salsabila', class_id: 1, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 7B (class_id: 2)
  { id: 'std-7b-01', full_name: 'Zidan Ahmad Robbani', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-02', full_name: 'Annisa Larasati Wibowo', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-03', full_name: 'Fatih Al-Ghifari', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-04', full_name: 'Hafizhah Khairunnisa', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-05', full_name: 'M. Rizky Ramadhan', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-06', full_name: 'Najwa Syifa Salsabila', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-07', full_name: 'Rafiandra Dwi Putra', class_id: 2, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-7b-08', full_name: 'Syakira Ainun Najib', class_id: 2, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 8A (class_id: 3)
  { id: 'std-8a-01', full_name: 'Bintang Arya Pradana', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-02', full_name: 'Nayla Zahrotun Nisa', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-03', full_name: 'Fathurrahman Rasyid', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-04', full_name: 'Aliya Khansa Maharani', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-05', full_name: 'Dimas Aditya Nugroho', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-06', full_name: 'Kayla Hasna Humaira', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-07', full_name: 'Rangga Mahendra Putra', class_id: 3, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8a-08', full_name: 'Yasmin Zulaikha', class_id: 3, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 8B (class_id: 4)
  { id: 'std-8b-01', full_name: 'Haidar Ali Al-Mansyur', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-02', full_name: 'Tiara Safitri Utami', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-03', full_name: 'Atharizz Calief Rahman', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-04', full_name: 'Faradiba Nurul Aini', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-05', full_name: 'Galih Bayu Samudra', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-06', full_name: 'Meisya Dwi Andini', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-07', full_name: 'Rian Syahputra Pratama', class_id: 4, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-8b-08', full_name: 'Zahra Amelia Hapsari', class_id: 4, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 9A (class_id: 5)
  { id: 'std-9a-01', full_name: 'Aditya Surya Wardhana', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9a-02', full_name: 'Clarissa Aurelia Putri', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9a-03', full_name: 'Fachry Akbar Santoso', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9a-04', full_name: 'Gita Permatasari', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9a-05', full_name: 'Iqbal Maulana Hakim', class_id: 5, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9a-06', full_name: 'Karina Dwi Safitri', class_id: 5, created_at: '2026-08-01T08:00:00Z' },

  // Kelas 9B (class_id: 6)
  { id: 'std-9b-01', full_name: 'Maulana Malik Ibrahim', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9b-02', full_name: 'Nabila Syakieb Kusuma', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9b-03', full_name: 'Panji Gumilang Pangestu', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9b-04', full_name: 'Ratu Bilqis Azzahro', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9b-05', full_name: 'Sultan Rafi Al-Ghifari', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
  { id: 'std-9b-06', full_name: 'Vania Putri Kirana', class_id: 6, created_at: '2026-08-01T08:00:00Z' },
];

// Seed initial votes for stage 1 (Seleksi) so that top 3 per rombel (7A, 7B, 8A, 8B) are immediately available
export const INITIAL_SELECTION_VOTES: SelectionVote[] = [
  // 7A top: std-7a-01 (Farhan), std-7a-02 (Aisyah), std-7a-03 (Danendra)
  { id: 1, voter_student_id: 'std-9a-01', nominated_student_id: 'std-7a-01', created_at: '2026-08-10T09:00:00Z' },
  { id: 2, voter_student_id: 'std-9a-01', nominated_student_id: 'std-8a-01', created_at: '2026-08-10T09:00:00Z' },
  { id: 3, voter_student_id: 'std-9a-01', nominated_student_id: 'std-8b-01', created_at: '2026-08-10T09:00:00Z' },

  { id: 4, voter_student_id: 'std-9a-02', nominated_student_id: 'std-7a-01', created_at: '2026-08-10T09:05:00Z' },
  { id: 5, voter_student_id: 'std-9a-02', nominated_student_id: 'std-7a-02', created_at: '2026-08-10T09:05:00Z' },
  { id: 6, voter_student_id: 'std-9a-02', nominated_student_id: 'std-8a-02', created_at: '2026-08-10T09:05:00Z' },

  { id: 7, voter_student_id: 'std-9b-01', nominated_student_id: 'std-7a-01', created_at: '2026-08-10T09:10:00Z' },
  { id: 8, voter_student_id: 'std-9b-01', nominated_student_id: 'std-7a-03', created_at: '2026-08-10T09:10:00Z' },
  { id: 9, voter_student_id: 'std-9b-01', nominated_student_id: 'std-8a-01', created_at: '2026-08-10T09:10:00Z' },

  { id: 10, voter_student_id: 'std-9b-02', nominated_student_id: 'std-7a-02', created_at: '2026-08-10T09:15:00Z' },
  { id: 11, voter_student_id: 'std-9b-02', nominated_student_id: 'std-7b-01', created_at: '2026-08-10T09:15:00Z' },
  { id: 12, voter_student_id: 'std-9b-02', nominated_student_id: 'std-8b-01', created_at: '2026-08-10T09:15:00Z' },

  // 7B top: std-7b-01 (Zidan), std-7b-02 (Annisa), std-7b-03 (Fatih)
  { id: 13, voter_student_id: 'std-8a-05', nominated_student_id: 'std-7b-01', created_at: '2026-08-10T09:20:00Z' },
  { id: 14, voter_student_id: 'std-8a-05', nominated_student_id: 'std-7b-02', created_at: '2026-08-10T09:20:00Z' },
  { id: 15, voter_student_id: 'std-8a-05', nominated_student_id: 'std-8a-01', created_at: '2026-08-10T09:20:00Z' },

  { id: 16, voter_student_id: 'std-8b-05', nominated_student_id: 'std-7b-01', created_at: '2026-08-10T09:25:00Z' },
  { id: 17, voter_student_id: 'std-8b-05', nominated_student_id: 'std-7b-03', created_at: '2026-08-10T09:25:00Z' },
  { id: 18, voter_student_id: 'std-8b-05', nominated_student_id: 'std-8b-02', created_at: '2026-08-10T09:25:00Z' },

  // 8A top: std-8a-01 (Bintang), std-8a-02 (Nayla), std-8a-03 (Fathurrahman)
  { id: 19, voter_student_id: 'std-7a-05', nominated_student_id: 'std-8a-01', created_at: '2026-08-10T09:30:00Z' },
  { id: 20, voter_student_id: 'std-7a-05', nominated_student_id: 'std-8a-02', created_at: '2026-08-10T09:30:00Z' },
  { id: 21, voter_student_id: 'std-7a-05', nominated_student_id: 'std-7a-01', created_at: '2026-08-10T09:30:00Z' },

  { id: 22, voter_student_id: 'std-7b-05', nominated_student_id: 'std-8a-01', created_at: '2026-08-10T09:35:00Z' },
  { id: 23, voter_student_id: 'std-7b-05', nominated_student_id: 'std-8a-03', created_at: '2026-08-10T09:35:00Z' },
  { id: 24, voter_student_id: 'std-7b-05', nominated_student_id: 'std-7b-01', created_at: '2026-08-10T09:35:00Z' },

  // 8B top: std-8b-01 (Haidar), std-8b-02 (Tiara), std-8b-03 (Atharizz)
  { id: 25, voter_student_id: 'std-8a-06', nominated_student_id: 'std-8b-01', created_at: '2026-08-10T09:40:00Z' },
  { id: 26, voter_student_id: 'std-8a-06', nominated_student_id: 'std-8b-02', created_at: '2026-08-10T09:40:00Z' },
  { id: 27, voter_student_id: 'std-8a-06', nominated_student_id: 'std-8a-03', created_at: '2026-08-10T09:40:00Z' },

  { id: 28, voter_student_id: 'std-8b-06', nominated_student_id: 'std-8b-01', created_at: '2026-08-10T09:45:00Z' },
  { id: 29, voter_student_id: 'std-8b-06', nominated_student_id: 'std-8b-03', created_at: '2026-08-10T09:45:00Z' },
  { id: 30, voter_student_id: 'std-8b-06', nominated_student_id: 'std-7a-02', created_at: '2026-08-10T09:45:00Z' },

  { id: 31, voter_student_id: 'std-9a-03', nominated_student_id: 'std-8a-01', created_at: '2026-08-10T09:50:00Z' },
  { id: 32, voter_student_id: 'std-9a-03', nominated_student_id: 'std-8b-01', created_at: '2026-08-10T09:50:00Z' },
  { id: 33, voter_student_id: 'std-9a-03', nominated_student_id: 'std-7a-03', created_at: '2026-08-10T09:50:00Z' },

  { id: 34, voter_student_id: 'std-9b-03', nominated_student_id: 'std-7b-02', created_at: '2026-08-10T09:55:00Z' },
  { id: 35, voter_student_id: 'std-9b-03', nominated_student_id: 'std-7b-03', created_at: '2026-08-10T09:55:00Z' },
  { id: 36, voter_student_id: 'std-9b-03', nominated_student_id: 'std-8a-02', created_at: '2026-08-10T09:55:00Z' },
];

export const INITIAL_PLENO_EVALUATIONS: PlenoEvaluation[] = [
  {
    id: 1,
    student_id: 'std-8a-01', // Bintang Arya Pradana
    teacher_user_id: 'usr-tch-01',
    teacher_notes: 'Memiliki jiwa kepemimpinan yang matang, disiplin ibadah baik, dan aktif di ekstrakurikuler Pramuka & PMR.',
    is_selected_for_paslon: true,
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 2,
    student_id: 'std-7a-01', // Muhammad Farhan Al-Fatih
    teacher_user_id: 'usr-tch-01',
    teacher_notes: 'Komunikatif, cerdas, mampu menjadi jembatan aspirasi siswa kelas 7 dengan santun.',
    is_selected_for_paslon: true,
    created_at: '2026-08-12T10:10:00Z',
  },
  {
    id: 3,
    student_id: 'std-8b-01', // Haidar Ali Al-Mansyur
    teacher_user_id: 'usr-tch-02',
    teacher_notes: 'Berkarakter tegas, santun, hafalan Al-Quran 3 Juz, memiliki rekam jejak akhlakul karimah teruji.',
    is_selected_for_paslon: true,
    created_at: '2026-08-12T10:15:00Z',
  },
  {
    id: 4,
    student_id: 'std-7b-01', // Zidan Ahmad Robbani
    teacher_user_id: 'usr-tch-03',
    teacher_notes: 'Inovatif dalam kegiatan keagamaan, luwes bergaul, dan memiliki dedikasi tinggi terhadap almamater.',
    is_selected_for_paslon: true,
    created_at: '2026-08-12T10:20:00Z',
  },
  {
    id: 5,
    student_id: 'std-8a-02', // Nayla Zahrotun Nisa
    teacher_user_id: 'usr-tch-04',
    teacher_notes: 'Tertib administrasi, teliti, berprestasi akademik peringkat 1 kelas, berwibawa.',
    is_selected_for_paslon: true,
    created_at: '2026-08-12T10:25:00Z',
  },
  {
    id: 6,
    student_id: 'std-8b-02', // Tiara Safitri Utami
    teacher_user_id: 'usr-tch-05',
    teacher_notes: 'Aktif mengorganisir kegiatan sosial sekolah, ramah, dan solutif.',
    is_selected_for_paslon: true,
    created_at: '2026-08-12T10:30:00Z',
  },
  {
    id: 7,
    student_id: 'std-7a-02', // Aisyah Putri Azzahra
    teacher_user_id: 'usr-tch-06',
    teacher_notes: 'Potensial untuk kepengurusan OSIS divisi humas dan keagamaan.',
    is_selected_for_paslon: false,
    created_at: '2026-08-12T10:35:00Z',
  },
  {
    id: 8,
    student_id: 'std-7b-02', // Annisa Larasati Wibowo
    teacher_user_id: 'usr-tch-07',
    teacher_notes: 'Sangat baik dalam kerja tim, siap mendukung kepengurusan inti.',
    is_selected_for_paslon: false,
    created_at: '2026-08-12T10:40:00Z',
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 1,
    chairman_student_id: 'std-8a-01', // Bintang Arya Pradana (8A)
    vice_chairman_student_id: 'std-7a-01', // Muhammad Farhan Al-Fatih (7A)
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
    chairman_student_id: 'std-8b-01', // Haidar Ali Al-Mansyur (8B)
    vice_chairman_student_id: 'std-7b-01', // Zidan Ahmad Robbani (7B)
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
    chairman_student_id: 'std-8a-02', // Nayla Zahrotun Nisa (8A)
    vice_chairman_student_id: 'std-8b-02', // Tiara Safitri Utami (8B)
    vision_mission: `VISI:
Menjadikan OSIS SMP Al Muttaqin wadah inspiratif yang berdaya saing global tanpa melupakan akar budaya dan adab Islami.

MISI:
1. Meningkatkan kualitas program kerja yang berbasis kepedulian sosial dan lingkungan hidup.
2. Mengadakan forum aspirasi berkala untuk menyerap ide-ide inovatif seluruh siswa.
3. Mendorong prestasi santri dalam kompetisi akademik dan non-akademik tingkat kota hingga nasional.`,
    created_at: '2026-08-15T09:00:00Z',
  },
];

// Seed some attendance and anonymous final votes for immediate testing
export const INITIAL_ATTENDANCES: VotingAttendance[] = [
  { id: 1, student_id: 'std-9a-01', attended_at: '2026-08-20T08:15:00Z' },
  { id: 2, student_id: 'std-9a-02', attended_at: '2026-08-20T08:18:00Z' },
  { id: 3, student_id: 'std-9a-04', attended_at: '2026-08-20T08:22:00Z' },
  { id: 4, student_id: 'std-9b-01', attended_at: '2026-08-20T08:26:00Z' },
  { id: 5, student_id: 'std-9b-02', attended_at: '2026-08-20T08:30:00Z' },
  { id: 6, student_id: 'std-8a-04', attended_at: '2026-08-20T08:35:00Z' },
  { id: 7, student_id: 'std-8a-05', attended_at: '2026-08-20T08:40:00Z' },
  { id: 8, student_id: 'std-8b-04', attended_at: '2026-08-20T08:45:00Z' },
  { id: 9, student_id: 'std-7a-04', attended_at: '2026-08-20T08:50:00Z' },
  { id: 10, student_id: 'std-7a-05', attended_at: '2026-08-20T08:55:00Z' },
  { id: 11, student_id: 'std-7b-04', attended_at: '2026-08-20T09:00:00Z' },
  { id: 12, student_id: 'std-7b-05', attended_at: '2026-08-20T09:05:00Z' },
];

export const INITIAL_FINAL_VOTES: FinalVote[] = [
  { id: 1, candidate_id: 1, voted_at: '2026-08-20T08:16:00Z' },
  { id: 2, candidate_id: 1, voted_at: '2026-08-20T08:19:00Z' },
  { id: 3, candidate_id: 2, voted_at: '2026-08-20T08:23:00Z' },
  { id: 4, candidate_id: 2, voted_at: '2026-08-20T08:27:00Z' },
  { id: 5, candidate_id: 1, voted_at: '2026-08-20T08:31:00Z' },
  { id: 6, candidate_id: 3, voted_at: '2026-08-20T08:36:00Z' },
  { id: 7, candidate_id: 2, voted_at: '2026-08-20T08:41:00Z' },
  { id: 8, candidate_id: 3, voted_at: '2026-08-20T08:46:00Z' },
  { id: 9, candidate_id: 1, voted_at: '2026-08-20T08:51:00Z' },
  { id: 10, candidate_id: 1, voted_at: '2026-08-20T08:56:00Z' },
  { id: 11, candidate_id: 2, voted_at: '2026-08-20T09:01:00Z' },
  { id: 12, candidate_id: 3, voted_at: '2026-08-20T09:06:00Z' },
];
