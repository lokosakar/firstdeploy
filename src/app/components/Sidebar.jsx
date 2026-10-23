"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { 
  School, 
  LayoutDashboard, 
  CalendarDays, 
  Settings2, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { useBooking } from '../lib/BookingContext';
import { useAuth } from '../lib/AuthContext';
import styles from './Sidebar.module.css';

const MENU_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'agenda', name: 'Agenda Kalender', path: '/admin/agenda', icon: CalendarDays },
  { id: 'fasilitas', name: 'Kelola Fasilitas', path: '/admin/fasilitas', icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef(null);
  const { requests } = useBooking();
  const { currentUser, logout, theme, toggleTheme } = useAuth();

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  useEffect(() => {
    // Only animate on first initial load, NEVER re-animate when clicking between tabs!
    if (typeof window !== 'undefined' && !window.__sarpras_sidebar_animated) {
      window.__sarpras_sidebar_animated = true;
      const ctx = gsap.context(() => {
        gsap.fromTo('.menu-anim',
          { x: -16, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" }
        );
      }, sidebarRef);

      return () => ctx.revert();
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className={styles.sidebar} ref={sidebarRef}>
      {/* Brand / Logo */}
      <div className={`menu-anim ${styles.brandSection}`}>
        <Link href="/" className={styles.brand} aria-label="Kembali ke Beranda">
          <span className={styles.brandBadge} aria-hidden="true">TR</span>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>SMK Tri Ratna</span>
            <span className={styles.brandRole}>Panel Sarpras Admin</span>
          </div>
        </Link>
      </div>

      {/* Admin User Profile Card */}
      <div className={`menu-anim ${styles.adminProfileCard}`}>
        <div className={styles.avatar}>
          <ShieldCheck size={18} />
        </div>
        <div className={styles.adminInfo}>
          <span className={styles.adminName}>{currentUser?.name || 'Admin Sarpras'}</span>
          <span className={styles.adminStatus}>
            <span className={styles.statusDot} />
            {currentUser?.roleLabel || 'Online Sistem'}
          </span>
        </div>
      </div>

      {/* Navigasi Utama (3 Section: Dashboard, Agenda Kalender, Kelola Fasilitas) */}
      <nav className={styles.menu} aria-label="Navigasi Admin">
        <span className={styles.sectionLabel}>MENU UTAMA</span>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`menu-anim ${styles.menuItem} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className={styles.menuIcon} aria-hidden="true" />
              <span className={styles.menuText}>{item.name}</span>
              {item.id === 'dashboard' && pendingCount > 0 && (
                <span className={styles.pendingBadge}>{pendingCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav, Theme Switcher & Logout */}
      <div className={styles.footer}>
        <button 
          onClick={toggleTheme} 
          className={`menu-anim ${styles.themeToggleBtn}`}
          title="Ganti Tema Tampilan"
          type="button"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>

        <Link href="/user/booking" className={`menu-anim ${styles.backUserLink}`}>
          <ArrowLeft size={16} />
          <span>Lihat Portal Siswa</span>
        </Link>

        <button 
          onClick={handleLogout} 
          className={`menu-anim ${styles.logoutBtn}`}
          type="button"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}