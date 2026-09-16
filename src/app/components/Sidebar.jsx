"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { 
  School, 
  LayoutDashboard, 
  CalendarDays, 
  Settings2, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useBooking } from '../lib/BookingContext';
import styles from './Sidebar.module.css';

const MENU_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'agenda', name: 'Agenda Kalender', path: '/admin/agenda', icon: CalendarDays },
  { id: 'fasilitas', name: 'Kelola Fasilitas', path: '/admin/fasilitas', icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const { requests } = useBooking();

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.menu-anim',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" }
      );
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  return (
    <aside className={styles.sidebar} ref={sidebarRef}>
      {/* Brand / Logo */}
      <div className={`menu-anim ${styles.brandSection}`}>
        <Link href="/" className={styles.brand} aria-label="Kembali ke Beranda">
          <div className={styles.brandBadge}>
            <School size={22} color="#ffffff" aria-hidden="true" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>SMK Tri Ratna</span>
            <span className={styles.brandRole}>Panel Sarpras Admin</span>
          </div>
        </Link>
      </div>

      {/* Admin User Profile Card */}
      <div className={`menu-anim ${styles.adminProfileCard}`}>
        <div className={styles.avatar}>
          <ShieldCheck size={20} color="#059669" />
        </div>
        <div className={styles.adminInfo}>
          <span className={styles.adminName}>Admin Sarpras</span>
          <span className={styles.adminStatus}>
            <span className={styles.statusDot} />
            Online Sistem
          </span>
        </div>
      </div>

      {/* Navigasi Utama */}
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
              <Icon size={19} className={styles.menuIcon} aria-hidden="true" />
              <span className={styles.menuText}>{item.name}</span>
              {item.id === 'dashboard' && pendingCount > 0 && (
                <span className={styles.pendingBadge}>{pendingCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav & Back to User Portal */}
      <div className={styles.footer}>
        <Link href="/user/booking" className={`menu-anim ${styles.backUserLink}`}>
          <ArrowLeft size={16} />
          <span>Lihat Portal Siswa</span>
        </Link>
        <Link href="/" className={`menu-anim ${styles.logoutBtn}`}>
          <LogOut size={18} aria-hidden="true" />
          <span>Keluar Sesi</span>
        </Link>
      </div>
    </aside>
  );
}