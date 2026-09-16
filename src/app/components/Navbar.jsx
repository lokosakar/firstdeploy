"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { 
  School, 
  Search, 
  Bell, 
  Menu, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { useBooking } from '../lib/BookingContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { name: "Beranda", path: "/" },
  { name: "Katalog Fasilitas", path: "/user/booking" },
  { name: "Panel Sarpras", path: "/admin/dashboard" },
];

export default function Navbar() {
  const navRef = useRef(null);
  const pathname = usePathname();
  const { requests, searchBooking } = useBooking();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Recent 4 notifications from requests
  const recentNotifs = requests.slice(0, 4);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
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
      <nav className={styles.navbar} ref={navRef}>
        <div className={styles.navContainer}>
          {/* Brand / Logo */}
          <Link href="/" className={styles.brand} aria-label="Beranda SMK Tri Ratna">
            <div className={styles.logoBadge}>
              <School size={22} color="#ffffff" aria-hidden="true" />
            </div>
            <div className={styles.brandTextWrapper}>
              <span className={styles.brandName}>SMK Tri Ratna</span>
              <span className={styles.brandSub}>Sarpras Digital</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            <div className={styles.navLinks}>
              {NAV_LINKS.map((link) => {
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
            >
              <Search size={15} />
              <span>Lacak Booking</span>
            </button>

            {/* Notification Bell with Dropdown */}
            <div className={styles.notifWrapper}>
              <button 
                className={styles.iconBtn}
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifikasi Permohonan"
                title="Aktivitas Terbaru"
              >
                <Bell size={18} />
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
                            {item.status === 'pending' && <Clock size={16} color="#D97706" />}
                            {item.status === 'approved' && <CheckCircle size={16} color="#059669" />}
                            {item.status === 'rejected' && <XCircle size={16} color="#E11D48" />}
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
                  <Link 
                    href="/admin/dashboard" 
                    className={styles.notifFooter}
                    onClick={() => setNotifOpen(false)}
                  >
                    <span>Buka Panel Sarpras</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Role Badge Link */}
            <Link 
              href={pathname.startsWith('/admin') ? "/user/booking" : "/admin/dashboard"} 
              className={styles.roleSwitchBtn}
            >
              {pathname.startsWith('/admin') ? (
                <>
                  <CalendarCheck size={16} />
                  <span>Mode Siswa/Guru</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Masuk Admin</span>
                </>
              )}
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileNav}>
            {NAV_LINKS.map((link) => {
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
            >
              <Search size={16} />
              <span>Lacak Status Reservasi</span>
            </button>
            
            <Link 
              href={pathname.startsWith('/admin') ? "/user/booking" : "/admin/dashboard"}
              className={styles.mobileRoleBtn}
              onClick={() => setMobileMenuOpen(false)}
            >
              {pathname.startsWith('/admin') ? "Mode Siswa/Guru" : "Panel Sarpras Admin"}
            </Link>
          </div>
        )}
      </nav>

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
                        {searchResult.status === 'pending' ? 'Menunggu Review Sarpras' : searchResult.status === 'approved' ? 'Disetujui - Ruang Terpesan' : 'Ditolak'}
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
                        <span className={styles.detailVal}>{searchResult.formattedDate} • {searchResult.time}</span>
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