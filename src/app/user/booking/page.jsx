"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { 
  Users, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Check, 
  ArrowRight, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  History,
  Printer,
  ChevronDown,
  X
} from 'lucide-react';

import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import BookingSlip from '../../components/BookingSlip';
import { useBooking } from '../../lib/BookingContext';
import { useAuth } from '../../lib/AuthContext';
import styles from './booking.module.css';

const CATEGORIES = ["Semua", "Lab Komputer", "Ibadah & Karakter", "Olahraga", "Auditorium"];

const SORT_OPTIONS = [
  { value: "default", label: "Urutan Standar" },
  { value: "nameAsc", label: "Nama (A - Z)" },
  { value: "capDesc", label: "Kapasitas (Terbanyak)" },
  { value: "capAsc", label: "Kapasitas (Terkecil)" }
];

const STATUS_CONFIG = {
  pending: { label: 'Menunggu Review', icon: Clock, className: 'status_pending' },
  approved: { label: 'Disetujui', icon: CheckCircle, className: 'status_approved' },
  rejected: { label: 'Ditolak', icon: XCircle, className: 'status_rejected' }
};

export default function UserBooking() {
  const containerRef = useRef(null);
  const sortRef = useRef(null);

  const { facilities = [], requests = [] } = useBooking();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('katalog');
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [slipBooking, setSlipBooking] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  // Tutup dropdown sort saat klik di luar atau tekan Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSortOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Animasi Header hanya dijalankan sekali saat pertama kali render
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.header-anim',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", stagger: 0.08, clearProps: "transform" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Animasi Kartu setiap kali tab atau kategori berubah (clearProps mencegah konflik dengan CSS hover)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.card-anim',
        { y: 24, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.07, 
          duration: 0.55, 
          ease: "power2.out",
           overwrite: "auto",
          clearProps: "transform" 
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab, selectedCategory]);

  // Memoize hasil filter & sort fasilitas agar tidak dihitung ulang saat state lain berubah
  const filteredFacilities = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return facilities
      .filter((fac) => {
        const matchesCategory = selectedCategory === "Semua" || fac.category === selectedCategory;
        const matchesQuery =
          !query ||
          fac.name?.toLowerCase().includes(query) ||
          fac.loc?.toLowerCase().includes(query) ||
          fac.desc?.toLowerCase().includes(query) ||
          fac.amenities?.some((a) => a.toLowerCase().includes(query));

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'capDesc') return (b.capacityNum || 0) - (a.capacityNum || 0);
        if (sortBy === 'capAsc') return (a.capacityNum || 0) - (b.capacityNum || 0);
        if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
        return a.id - b.id;
      });
  }, [facilities, selectedCategory, searchQuery, sortBy]);

  // Pre-compute ketersediaan harian dengan O(1) lookup map
  const availabilityMap = useMemo(() => {
    if (!filterDate) return {};
    const counts = {};

    requests.forEach((r) => {
      if (r.date === filterDate && r.status !== 'rejected') {
        counts[r.facility] = (counts[r.facility] || 0) + 1;
      }
    });

    return counts;
  }, [requests, filterDate]);

  // Filter daftar riwayat permohonan
  const filteredRequests = useMemo(() => {
    if (historyStatusFilter === 'all') return requests;
    return requests.filter((req) => req.status === historyStatusFilter);
  }, [requests, historyStatusFilter]);

  const handleResetFilters = () => {
    setSelectedCategory("Semua");
    setSearchQuery("");
    setFilterDate("");
    setSortBy("default");
  };

  const handleCardKeyDown = (e, fac) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedFacility(fac);
    }
  };

  return (
    <div className={styles.layout} ref={containerRef}>
      <Navbar />

      <main className={styles.mainContainer}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`header-anim ${styles.headerBadge}`}>PORTAL SISWA & GURU</span>
            <h1 className="header-anim">Katalog & Reservasi Prasarana</h1>
            <p className="header-anim">
              Pilih fasilitas resmi SMK Tri Ratna untuk kebutuhan pembelajaran, kegiatan organisasi, dan kejuaraan.
            </p>
          </div>

          <div className={`header-anim ${styles.tabSwitcher}`} role="tablist" aria-label="Menu Navigasi Portal">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'katalog'}
              className={`${styles.tabBtn} ${activeTab === 'katalog' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('katalog')}
            >
              <Building2 size={16} />
              <span>Katalog Fasilitas</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'riwayat'}
              className={`${styles.tabBtn} ${activeTab === 'riwayat' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('riwayat')}
            >
              <History size={16} />
              <span>Riwayat Permohonan</span>
              <span className={styles.historyCounter}>{requests.length}</span>
            </button>
          </div>
        </header>

        {/* AUTHENTICATION STATUS BANNER */}
        {currentUser ? (
          <div className={`header-anim ${styles.authStatusBanner}`}>
            <div className={styles.authStatusLeft}>
              <span className={styles.authBadgeSuccess}>✓ Terhubung Akun Resmi</span>
              <p>
                Reservasi diajukan atas nama <strong>{currentUser.name}</strong> ({currentUser.email})
                {currentUser.classGrade && currentUser.classGrade !== '-' ? ` • Kelas ${currentUser.classGrade}` : ''}
              </p>
            </div>
            <span className={styles.authStatusRole}>
              {currentUser.role === 'admin' ? '🛡️ Admin Sarpras' : `🎓 Perwakilan ${currentUser.classGrade || 'Siswa'}`}
            </span>
          </div>
        ) : (
          <div className={`header-anim ${styles.authStatusBannerGuest}`}>
            <div className={styles.authStatusLeft}>
              <span className={styles.authBadgeWarn}>🔒 Mode Pratinjau Tamu</span>
              <p>
                Reservasi sarana wajib menggunakan <strong>Akun Resmi Perwakilan Kelas</strong> (dipegang oleh Ketua Kelas) atau Guru/Admin.
              </p>
            </div>
            <Link href="/login" className={styles.btnAuthBanner}>
              <span>Masuk Akun Kelas</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {activeTab === 'katalog' ? (
          <>
            <section className={`header-anim ${styles.controlsBar}`} aria-label="Filter dan Pencarian">
              <div className={styles.categoryPills} role="group" aria-label="Kategori Fasilitas">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.pillBtn} ${selectedCategory === cat ? styles.pillBtnActive : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className={styles.searchSortGroup}>
                <div className={styles.searchBox}>
                  <Search size={17} className={styles.searchIcon} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Cari ruang, lokasi, atau fasilitas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                    aria-label="Cari fasilitas"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className={styles.clearBtn}
                      aria-label="Hapus pencarian"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className={styles.dateFilterBox}>
                  <Calendar size={15} className={styles.dateIcon} aria-hidden="true" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className={styles.dateFilterInput}
                    title="Cek Ketersediaan Tanggal Tertentu"
                    aria-label="Filter berdasarkan tanggal"
                  />
                  {filterDate && (
                    <button
                      type="button"
                      onClick={() => setFilterDate('')}
                      className={styles.clearBtn}
                      aria-label="Reset tanggal"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className={styles.sortDropdownContainer} ref={sortRef}>
                  <button
                    type="button"
                    className={`${styles.sortTriggerBtn} ${sortOpen ? styles.sortTriggerActive : ''}`}
                    onClick={() => setSortOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                    id="sort-menu-btn"
                  >
                    <SlidersHorizontal size={14} className={styles.sortTriggerIcon} />
                    <span className={styles.sortTriggerLabel}>
                      {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Urutan Standar'}
                    </span>
                    <ChevronDown size={14} className={`${styles.sortChevron} ${sortOpen ? styles.sortChevronRotate : ''}`} />
                  </button>

                  {sortOpen && (
                    <div className={styles.sortMenu} role="listbox" aria-labelledby="sort-menu-btn">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={sortBy === opt.value}
                          className={`${styles.sortOptionItem} ${sortBy === opt.value ? styles.sortOptionSelected : ''}`}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <Check size={14} className={styles.sortCheckIcon} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.grid} aria-label="Daftar Fasilitas">
              {filteredFacilities.length === 0 ? (
                <div className={styles.emptyState}>
                  <Building2 size={48} className={styles.emptyIcon} />
                  <h3>Tidak ada fasilitas yang cocok</h3>
                  <p>Coba gunakan kata kunci pencarian yang lain atau ubah filter kategori Anda.</p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={styles.resetFilterBtn}
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredFacilities.map((fac) => {
                  const bookedCount = availabilityMap[fac.name] || 0;
                  const dayAvail = filterDate
                    ? bookedCount === 0
                      ? { status: 'free', text: 'Tersedia Seharian' }
                      : { status: 'busy', text: `${bookedCount} Jadwal Terisi` }
                    : null;

                  const isAvailable = fac.status === 'Tersedia';

                  return (
                    <article
                      key={fac.id}
                      className={`card-anim ${styles.card}`}
                      onClick={() => setSelectedFacility(fac)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleCardKeyDown(e, fac)}
                      aria-label={`Lihat detail dan reservasi ${fac.name}`}
                    >
                      <div className={styles.cardImageWrapper}>
                        {fac.image ? (
                          <Image
                            src={fac.image}
                            alt={fac.name}
                            fill
                            className={styles.cardImg}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <Building2 size={40} opacity={0.3} />
                          </div>
                        )}

                        <div className={styles.badgeAvailable}>
                          <span
                            className={`${styles.statusDot} ${isAvailable ? styles.dotAvailable : styles.dotWarning}`}
                          />
                          {fac.status}
                        </div>

                        <span className={styles.categoryBadge}>{fac.category}</span>

                        {dayAvail && (
                          <div
                            className={`${styles.dateAvailBadge} ${
                              dayAvail.status === 'free' ? styles.availFree : styles.availBusy
                            }`}
                          >
                            <Clock size={12} />
                            <span>{dayAvail.text}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{fac.name}</h3>

                        <div className={styles.cardMeta}>
                          <span>
                            <MapPin size={15} /> {fac.loc}
                          </span>
                          <span>
                            <Users size={15} /> {fac.cap}
                          </span>
                        </div>

                        <p className={styles.cardDesc}>{fac.desc}</p>

                        {fac.amenities?.length > 0 && (
                          <div className={styles.amenities}>
                            {fac.amenities.slice(0, 3).map((item, idx) => (
                              <span key={idx} className={styles.amenityTag}>
                                <Check size={12} className={styles.amenityIcon} /> {item}
                              </span>
                            ))}
                            {fac.amenities.length > 3 && (
                              <span className={styles.amenityMore}>+{fac.amenities.length - 3}</span>
                            )}
                          </div>
                        )}

                        <span className={styles.btnBook} aria-hidden="true">
                          <span>Detail & Reservasi</span>
                          <ArrowRight size={16} className={styles.btnBookArrow} />
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        ) : (
          <section className={`card-anim ${styles.historySection}`} aria-label="Riwayat Permohonan">
            <div className={styles.historyHeader}>
              <div>
                <h2>Riwayat Permohonan Terkini</h2>
                <p>Pantau seluruh permohonan reservasi yang telah Anda atau rekan ajukan.</p>
              </div>

              <div className={styles.historyFilterPills}>
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'pending', label: 'Menunggu' },
                  { id: 'approved', label: 'Disetujui' },
                  { id: 'rejected', label: 'Ditolak' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHistoryStatusFilter(tab.id)}
                    className={`${styles.pillBtn} ${historyStatusFilter === tab.id ? styles.pillBtnActive : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.historyList}>
              {filteredRequests.length === 0 ? (
                <div className={styles.emptyHistory}>
                  Belum ada riwayat permohonan pada kategori status ini.
                </div>
              ) : (
                filteredRequests.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={item.id} className={styles.historyCard}>
                      <div className={styles.historyMain}>
                        <div className={styles.historyHeadRow}>
                          <span className={styles.historyCode}>{item.id}</span>
                          <div className={styles.historyActions}>
                            <span className={`${styles.statusBadge} ${styles[statusInfo.className]}`}>
                              <StatusIcon size={14} />
                              <span>{statusInfo.label}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSlipBooking(item)}
                              className={styles.btnPrintHistory}
                              title="Cetak Surat Bukti"
                            >
                              <Printer size={14} />
                              <span>Cetak</span>
                            </button>
                          </div>
                        </div>

                        <h3 className={styles.historyFacility}>{item.facility}</h3>

                        <div className={styles.historyMetaGrid}>
                          <div>
                            <span className={styles.hLabel}>Pemohon:</span>
                            <p className={styles.hVal}>
                              {item.user} ({item.role})
                            </p>
                          </div>
                          <div>
                            <span className={styles.hLabel}>Jadwal:</span>
                            <p className={styles.hVal}>
                              {item.formattedDate || item.date} • {item.time}
                            </p>
                          </div>
                          <div>
                            <span className={styles.hLabel}>Kontak WhatsApp:</span>
                            <p className={styles.hVal}>{item.phone || '-'}</p>
                          </div>
                          <div>
                            <span className={styles.hLabel}>Perlengkapan Tambahan:</span>
                            <p className={styles.hVal}>
                              {item.equipment?.length > 0 ? item.equipment.join(', ') : 'Tidak ada'}
                            </p>
                          </div>
                        </div>

                        <div className={styles.historyPurpose}>
                          <strong>Agenda:</strong> {item.purpose}
                        </div>

                        {item.status === 'rejected' && item.rejectReason && (
                          <div className={styles.rejectNote}>
                            <strong>Alasan Penolakan:</strong> {item.rejectReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </main>

      {selectedFacility && (
        <Modal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}

      {slipBooking && (
        <BookingSlip
          booking={slipBooking}
          onClose={() => setSlipBooking(null)}
        />
      )}
    </div>
  );
}