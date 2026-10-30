"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useBooking } from '../lib/BookingContext';
import { useAuth } from '../lib/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navRef = useRef(null);
  const notifRef = useRef(null);
  const pathname = usePathname();
  const { requests, searchBooking } = useBooking();
  const { currentUser, isAdmin, isAuthenticated, logout, theme, toggleTheme } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Katalog Fasilitas", path: "/user/booking" },
    ...(isAdmin ? [{ name: "Panel Sarpras", path: "/admin/dashboard" }] : [])
  ];

  const recentNotifs = requests.slice(0, 4);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // Animasi masuk GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  // Deteksi scroll agar navbar tidak menyatu dengan konten di bawahnya
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup dropdown notifikasi ketika klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const result = searchBooking(searchCode.trim());
    setSearchResult(result || null);
    setHasSearched(true);
  };

  return (
    <>
      <nav 
        ref={navRef}
        className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''} ${theme === 'dark' ? styles.darkTheme : ''}`}
      >
        <div className={styles.navContainer}>
          {/* Brand / Logo Resmi SMK Tri Ratna */}
          <Link href="/" className={styles.brand} aria-label="Beranda SMK Tri Ratna">
            <div className={styles.logoFrame}>
              <Image 
                src="/logo-triratna.png" 
                alt="Logo Sekolah Tri Ratna Jakarta" 
                width={38} 
                height={38} 
                className={styles.logoImg}
                priority
              />
            </div>
            <div className={styles.brandTextWrapper}>
              <span className={styles.brandName}>SMK Tri Ratna</span>
              <span className={styles.brandSub}>Peminjaman Sarpras</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            <div className={styles.navLinks}>
              {navLinks.map((link) => {
                const isActive = link.path === "/" 
                  ? pathname === "/" 
                  : pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className={styles.divider} aria-hidden="true" />

            {/* Quick Track Booking Button */}
            <button 
              className={styles.trackBtn}
              onClick={() => {
                setTrackModalOpen(true);
                setHasSearched(false);
                setSearchResult(null);
                setSearchCode('');
              }}
              title="Lacak Status Peminjaman"
              type="button"
            >
              <Search size={14} className={styles.trackIcon} />
              <span>Lacak</span>
            </button>

            {/* Notification Bell with Dropdown */}
            <div className={styles.notifWrapper} ref={notifRef}>
              <button 
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ''}`}
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifikasi Permohonan"
                title="Aktivitas Terbaru"
                type="button"
              >
                <Bell size={17} />
                {pendingCount > 0 && (
                  <span className={styles.notifBadge}>{pendingCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifHeader}>
                    <h4>Pemberitahuan Sistem</h4>
                    <span className={styles.notifSub}>{pendingCount} Menunggu Review</span>
                  </div>
                  <div className={styles.notifList}>
                    {recentNotifs.length === 0 ? (
                      <div className={styles.emptyNotif}>Belum ada permohonan.</div>
                    ) : (
                      recentNotifs.map((item) => (
                        <div key={item.id} className={styles.notifItem}>
                          <div className={styles.notifIcon}>
                            {item.status === 'pending' && <Clock size={16} className={styles.icoPending} />}
                            {item.status === 'approved' && <CheckCircle size={16} className={styles.icoApproved} />}
                            {item.status === 'rejected' && <XCircle size={16} className={styles.icoRejected} />}
                          </div>
                          <div className={styles.notifContent}>
                            <div className={styles.notifTitleRow}>
                              <span className={styles.notifCode}>{item.id}</span>
                              <span className={`${styles.statusChip} ${styles[`status_${item.status}`]}`}>
                                {item.status === 'pending' ? 'Review' : item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                              </span>
                            </div>
                            <p className={styles.notifText}>
                              <strong>{item.user}</strong> memesan {item.facility}
                            </p>
                            <span className={styles.notifTime}>{item.formattedDate} ({item.time})</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {isAdmin && (
                    <Link 
                      href="/admin/dashboard" 
                      className={styles.notifFooter}
                      onClick={() => setNotifOpen(false)}
                    >
                      <span>Buka Panel Sarpras</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Dark Mode"
              type="button"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Authentication Profile / Login CTA */}
            {isAuthenticated ? (
              <div className={styles.userProfileMenu}>
                <div className={styles.userPill}>
                  <div className={styles.userAvatarBadge}>
                    {isAdmin ? <ShieldCheck size={15} /> : <GraduationCap size={15} />}
                  </div>
                  <div className={styles.userInfoCol}>
                    <span className={styles.userFullName}>{currentUser.name}</span>
                    <span className={styles.userRoleTag}>
                      {isAdmin ? 'Admin Sarpras' : (currentUser.classGrade || 'Siswa')}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={logout} 
                  className={styles.logoutNavBtn}
                  title="Keluar dari akun"
                  type="button"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.loginNavBtn}>
                <span>Masuk</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            type="button"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileNav}>
            {navLinks.map((link) => {
              const isActive = link.path === "/" 
                ? pathname === "/" 
                : pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <button 
              className={styles.mobileTrackBtn}
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackModalOpen(true);
              }}
              type="button"
            >
              <Search size={16} />
              <span>Lacak Status Reservasi</span>
            </button>

            <button 
              className={styles.mobileThemeBtn}
              onClick={toggleTheme}
              type="button"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
            
            {isAuthenticated ? (
              <div className={styles.mobileUserBox}>
                <div className={styles.mobileUserInfo}>
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.roleLabel || (isAdmin ? 'Admin Sarpras' : 'Siswa')}</span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className={styles.mobileLogoutBtn}
                  type="button"
                >
                  <LogOut size={16} />
                  <span>Keluar Sesi</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className={styles.mobileLoginBtn}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={16} />
                <span>Masuk / Daftar Akun</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Spacer otomatis agar konten halaman tidak tertutup navbar fixed */}
      <div className={styles.navbarSpacer} aria-hidden="true" />

      {/* TRACK BOOKING MODAL */}
      {trackModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setTrackModalOpen(false)}>
          <div className={styles.trackModal} onClick={e => e.stopPropagation()}>
            <div className={styles.trackHeader}>
              <div>
                <h3>Lacak Status Reservasi</h3>
                <p>Masukkan Kode Booking Anda (contoh: TR-2025-089)</p>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setTrackModalOpen(false)}
                aria-label="Tutup modal"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTrackSubmit} className={styles.trackForm}>
              <div className={styles.inputWrapper}>
                <Search size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Contoh: TR-2025-089 atau nama pemohon"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className={styles.trackInput}
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.searchSubmitBtn}>
                Cari Status
              </button>
            </form>

            {hasSearched && (
              <div className={styles.trackResultArea}>
                {searchResult ? (
                  <div className={styles.resultCard}>
                    <div className={styles.resultHead}>
                      <span className={styles.resCode}>{searchResult.id}</span>
                      <span className={`${styles.statusBadge} ${styles[`status_${searchResult.status}`]}`}>
                        {searchResult.status === 'pending' && <Clock size={14} />}
                        {searchResult.status === 'approved' && <CheckCircle size={14} />}
                        {searchResult.status === 'rejected' && <XCircle size={14} />}
                        {searchResult.status === 'pending' 
                          ? 'Menunggu Review Sarpras' 
                          : searchResult.status === 'approved' 
                          ? 'Disetujui - Ruang Terpesan' 
                          : 'Ditolak'}
                      </span>
                    </div>

                    <div className={styles.resultDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Fasilitas</span>
                        <span className={styles.detailVal}>{searchResult.facility}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Pemohon</span>
                        <span className={styles.detailVal}>{searchResult.user} ({searchResult.role})</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Jadwal</span>
                        <span className={styles.detailVal}>
                          {searchResult.formattedDate} • {searchResult.time}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Agenda</span>
                        <span className={styles.detailVal}>{searchResult.purpose}</span>
                      </div>
                      {searchResult.status === 'rejected' && searchResult.rejectReason && (
                        <div className={styles.rejectNotice}>
                          <strong>Catatan Penolakan:</strong> {searchResult.rejectReason}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.notFoundResult}>
                    <p>Kode reservasi atau nama &quot;<strong>{searchCode}</strong>&quot; tidak ditemukan.</p>
                    <small>Pastikan kode sesuai format TR-XXXX-XXX atau periksa kembali ejaan nama.</small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}