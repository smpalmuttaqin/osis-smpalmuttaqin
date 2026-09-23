import React, { useState, useMemo } from 'react';
import { useApp, ROLE_PERMISSIONS } from '../context/AppContext';
import { PageView, UserRole } from '../types/database';
import { AlMuttaqinLogo } from './AlMuttaqinLogo';
import {
  Home,
  LayoutDashboard,
  Vote,
  ListOrdered,
  Users,
  Award,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Code2,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Database,
  X,
  Lock,
} from 'lucide-react';

interface NavItemConfig {
  id: PageView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItemConfig[];
}

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activePage,
    setActivePage,
    logout,
    quickSwitchRole,
    supabaseStatus,
    setIsSupabaseModalOpen,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    tahapan: true,
    rekapitulasi: true,
    administrasi: true,
    sistem: true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Top standalone items (e.g. Dasbor)
  const standaloneItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dasbor',
      icon: Home,
      // Strictly defined according to user rules:
      // role seleksi: TIDAK BISA melihat dasbor hasil
      // role pemilihan: TIDAK BISA melihat dasbor hasil
      // guru: BISA
      // admin: BISA
      allowedRoles: ['admin', 'guru'],
    },
  ];

  // Grouped Navigation Sections
  const navGroups: NavGroup[] = [
    {
      id: 'tahapan',
      title: 'Tahapan Pemilihan',
      items: [
        {
          id: 'kandidat_seleksi',
          label: 'Kandidat Bakal Calon',
          icon: Award,
          // khusus admin untuk menginput dan mengelola bakal calon seleksi
          allowedRoles: ['admin'],
        },
        {
          id: 'seleksi',
          label: 'Bilik Seleksi',
          icon: Vote,
          // role seleksi: BISA
          // guru: BISA
          // admin: BISA
          // pemilihan: TIDAK BISA
          allowedRoles: ['admin', 'guru', 'seleksi'],
        },
        {
          id: 'pleno',
          label: 'Musyawarah Pleno',
          icon: Users,
          // guru: BISA
          // admin: BISA
          // seleksi: TIDAK BISA
          // pemilihan: TIDAK BISA
          allowedRoles: ['admin', 'guru'],
        },
        {
          id: 'paslon',
          label: 'Penetapan Paslon',
          icon: Award,
          // khusus admin
          allowedRoles: ['admin'],
        },
        {
          id: 'bilik_suara',
          label: 'Bilik Suara',
          icon: CheckSquare,
          // role pemilihan: BISA
          // guru: BISA
          // admin: BISA
          // seleksi: TIDAK BISA
          allowedRoles: ['admin', 'guru', 'pemilihan'],
        },
      ],
    },
    {
      id: 'rekapitulasi',
      title: 'Hasil & Rekapitulasi',
      items: [
        {
          id: 'rekap_seleksi',
          label: 'Rekapitulasi Seleksi',
          icon: ListOrdered,
          // guru: BISA
          // admin: BISA
          // seleksi: TIDAK BISA melihat hasil seleksi
          // pemilihan: TIDAK BISA
          allowedRoles: ['admin', 'guru'],
        },
        {
          id: 'absensi',
          label: 'Rekap Absensi Pemilih',
          icon: ClipboardList,
          // khusus admin
          allowedRoles: ['admin'],
        },
      ],
    },
    {
      id: 'administrasi',
      title: 'Administrasi Sekolah',
      items: [
        {
          id: 'manajemen_siswa',
          label: 'Data Siswa & Kelas',
          icon: GraduationCap,
          // khusus admin
          allowedRoles: ['admin'],
        },
        {
          id: 'manajemen_guru',
          label: 'Kelola Dewan Guru',
          icon: UserCheck,
          // khusus admin
          allowedRoles: ['admin'],
        },
        {
          id: 'manajemen_petugas',
          label: 'Kelola Akun Petugas',
          icon: ShieldCheck,
          // khusus admin
          allowedRoles: ['admin'],
        },
      ],
    },
    {
      id: 'sistem',
      title: 'Dokumentasi Sistem',
      items: [
        {
          id: 'laravel_code',
          label: 'Kode Laravel & DB',
          icon: Code2,
          allowedRoles: ['admin', 'guru'],
        },
      ],
    },
  ];

  // Helper to check if item is allowed for current role
  const isItemAllowed = (item: NavItemConfig) => {
    if (!currentRole) return false;
    const permittedByRole = ROLE_PERMISSIONS[currentRole]?.allowedPages || [];
    return item.allowedRoles.includes(currentRole) && permittedByRole.includes(item.id);
  };

  // Filter standalone items
  const filteredStandalone = useMemo(() => {
    return standaloneItems.filter((item) => {
      if (!isItemAllowed(item)) return false;
      if (!searchQuery.trim()) return true;
      return item.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [currentRole, searchQuery]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return navGroups
      .map((grp) => {
        const allowedItems = grp.items.filter((item) => {
          if (!isItemAllowed(item)) return false;
          if (!searchQuery.trim()) return true;
          return item.label.toLowerCase().includes(searchQuery.toLowerCase());
        });
        return {
          ...grp,
          items: allowedItems,
        };
      })
      .filter((grp) => grp.items.length > 0);
  }, [currentRole, searchQuery]);

  const getRoleBadge = (role: UserRole | null) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'guru':
        return { label: 'Guru', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'seleksi':
        return { label: 'Petugas Seleksi', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'pemilihan':
        return { label: 'Petugas Pemilihan', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: 'Tamu', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(currentRole);

  // -------------------------------------------------------------
  // COLLAPSED STATE VIEW (Mini Icon Rail, width: 4.5rem / w-[72px])
  // -------------------------------------------------------------
  if (isSidebarCollapsed) {
    return (
      <aside className="w-18 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none z-30 transition-all duration-200">
        {/* Top Logo & Expand Button */}
        <div className="p-3 border-b border-slate-100 flex flex-col items-center gap-2">
          {/* Circular School Logo */}
          <button
            type="button"
            onClick={toggleSidebar}
            title="Buka Sidebar"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center p-0.5 hover:scale-105 transition-transform"
          >
            <AlMuttaqinLogo size="sm" className="w-8 h-8" />
          </button>

          <button
            type="button"
            onClick={toggleSidebar}
            title="Buka Sidebar (Expand)"
            className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mini Nav Icons */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1.5 flex flex-col items-center">
          {filteredStandalone.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                title={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'border border-blue-200 bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          {filteredGroups.map((grp) => (
            <div key={grp.id} className="w-full space-y-1.5 pt-1 border-t border-slate-100 flex flex-col items-center">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePage(item.id)}
                    title={`${grp.title}: ${item.label}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'border border-blue-200 bg-blue-50 text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Mini Footer Actions */}
        <div className="p-2 border-t border-slate-100 flex flex-col items-center gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            title="Status Supabase"
            className="w-9 h-9 rounded-lg text-emerald-600 hover:bg-emerald-50 flex items-center justify-center"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={logout}
            title="Keluar Sesi"
            className="w-9 h-9 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // EXPANDED STATE VIEW (Matches uploaded image exactly)
  // -------------------------------------------------------------
  return (
    <aside className="w-68 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none z-30 transition-all duration-200 font-sans">
      {/* 1. Header: Logo, Title 'Al Muttaqin', and Collapse Button '<' */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular School Emblem Logo */}
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <AlMuttaqinLogo size="sm" className="w-8 h-8" />
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none truncate">
              Al Muttaqin
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 truncate">E-Pilketos SMP</p>
          </div>
        </div>

        {/* Collapse Button '<' matching the image */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Tutup Sidebar (Collapse)"
          className="p-1.5 text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search Input: '🔍 Cari Menu...' */}
      <div className="px-3.5 py-2.5 border-b border-slate-100/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Menu..."
            className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-7 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Navigation List & Groups */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-3">
        {/* Standalone items (e.g. Dasbor) */}
        {filteredStandalone.length > 0 && (
          <div className="space-y-1">
            {filteredStandalone.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-left transition-all group ${
                    isActive
                      ? 'border border-blue-200 bg-blue-50/70 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Grouped Accordion Sections (like 'Sekolah ^', 'Perizinan ^' in the image) */}
        {filteredGroups.map((grp) => {
          const isOpen = openGroups[grp.id] ?? true;
          return (
            <div key={grp.id} className="space-y-1">
              {/* Group Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(grp.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors group"
              >
                <span className="text-xs font-medium tracking-normal">{grp.title}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
                )}
              </button>

              {/* Group Child Items */}
              {isOpen && (
                <div className="space-y-1 pl-1">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActivePage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl text-left transition-all group ${
                          isActive
                            ? 'border border-blue-200 bg-blue-50/70 text-blue-600 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-mono">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* If search query produced no results */}
        {filteredStandalone.length === 0 && filteredGroups.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400 space-y-1">
            <p>Menu tidak ditemukan</p>
            <p className="text-[11px] text-slate-400">"{searchQuery}"</p>
          </div>
        )}
      </nav>

      {/* 4. Bottom Footer: User Info & Secure Ganti Akun */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2.5 shrink-0">
        {/* User Card */}
        <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-none">
                {currentUser?.full_name || 'Pengguna'}
              </p>
              <span
                className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-1 ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengakhiri sesi dan beralih akun?')) {
                logout();
              }
            }}
            title="Keluar / Beralih Akun"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Dedicated Ganti Akun Action Button */}
        <button
          type="button"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mengakhiri sesi dan beralih akun?')) {
              logout();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs group"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span>Beralih Akun</span>
        </button>

        {/* Database Status Button */}
        <button
          type="button"
          onClick={() => setIsSupabaseModalOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">Status Supabase</span>
          </div>
          {supabaseStatus?.isConnected ? (
            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-1.5 py-0.2 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </span>
          ) : (
            <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-1.5 py-0.2 rounded-full">
              Cek
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
