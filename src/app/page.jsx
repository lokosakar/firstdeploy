"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import {
  Building2,
  Users,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Search,
  CalendarCheck2,
  ShieldCheck,
  Ticket,
  PackagePlus,
  CircleCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';

import Navbar from './components/Navbar';
import Modal from './components/Modal';
import { useBooking } from './lib/BookingContext';
import { useAuth, OFFICIAL_CLASS_ACCOUNTS } from './lib/AuthContext';
import styles from './page.module.css';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATUS_LABEL = {
  pending: 'Sedang ditinjau',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export default function Home() {
  const containerRef = useRef(null);
  const { facilities = [], requests = [], searchBooking } = useBooking();
  const { isAdmin, isAuthenticated } = useAuth();

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [quickCode, setQuickCode] = useState('');
  const [quickResult, setQuickResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const latestApproved = requests.find((r) => r.status === 'approved') || requests[0];
  const sampleCode = latestApproved?.id || 'TR-2025-089';
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const availableCount = facilities.filter((f) => f.status === 'Tersedia').length;
  const heroImages = facilities.filter((f) => f.image).slice(0, 3);

  // Kategori unik untuk filter fasilitas
  const categories = useMemo(() => {
    const cats = new Set(facilities.map((f) => f.category).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    if (activeCategory === 'Semua') return facilities;
    return facilities.filter((f) => f.category === activeCategory);
  }, [facilities, activeCategory]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-anim',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.hero-photo',
        { y: 20, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.1,
        }
      );

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    const res = searchBooking(quickCode.trim());
    setQuickResult(res || null);
    setSearched(true);
  };

  const handleFillSample = () => {
    setQuickCode(sampleCode);
    const res = searchBooking(sampleCode);
    setQuickResult(res || null);
    setSearched(true);
  };

  const clearSearch = () => {
    setQuickCode('');
    setQuickResult(null);
    setSearched(false);
  };

  const secondaryCta = isAdmin
    ? { href: '/admin/dashboard', label: 'Buka panel Sarpras' }
    : isAuthenticated
      ? { href: '/user/booking', label: 'Lihat pengajuan saya' }
      : { href: '/login', label: 'Masuk akun kelas' };

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      <Navbar />

      {/* HERO SECTION — Tanpa "Jidat Lebar", proporsional & padat */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* KIRI: COPY & TRACKER */}
          <div className={styles.heroCopy}>
            <div className={`hero-anim ${styles.eyebrow}`}>
              <span className={styles.eyebrowLine} />
              <span>SMK &amp; SMA Tri Ratna · Jakarta Barat</span>
              <span className={styles.eyebrowDivider}>•</span>
              <span className={styles.eyebrowLive}>
                <span className={styles.eyebrowDot} />
                {availableCount} ruang tersedia
              </span>
            </div>

            <h1 className={`hero-anim ${styles.heroTitle}`}>
              Pinjam ruang sekolah tanpa <em>bolak-balik</em> ke ruang Sarpras.
            </h1>

            <p className={`hero-anim ${styles.heroSubtitle}`}>
              Cek jadwal lab, auditorium, cetiya, dan lapangan secara real-time.
              Ajukan langsung dari HP, lalu pantau statusnya sampai disetujui.
            </p>

            <div className={`hero-anim ${styles.ctaRow}`}>
              <Link href="/user/booking" id="cta-katalog" className={styles.btnPrimary}>
                <span>Lihat fasilitas</span>
                <ArrowRight size={17} />
              </Link>
              <Link href={secondaryCta.href} id="cta-secondary" className={styles.btnGhost}>
                {secondaryCta.label}
              </Link>
            </div>

            {/* LACAK CEPAT */}
            <form onSubmit={handleQuickSearch} className={`hero-anim ${styles.trackCard}`}>
              <div className={styles.trackHeader}>
                <label htmlFor="quick-track" className={styles.trackLabel}>
                  <Ticket size={14} />
                  <span>Sudah mengajukan? Lacak resi di sini</span>
                </label>
                {requests.length > 0 && (
                  <button
                    type="button"
                    onClick={handleFillSample}
                    className={styles.trackSampleBtn}
                  >
                    Coba: {sampleCode}
                  </button>
                )}
              </div>

              <div className={styles.trackRow}>
                <Search size={16} className={styles.trackIcon} />
                <input
                  id="quick-track"
                  type="text"
                  placeholder="Masukkan kode booking, mis. TR-2025-089"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  className={styles.trackInput}
                />
                {quickCode && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className={styles.trackClear}
                    aria-label="Hapus pencarian"
                  >
                    <X size={14} />
                  </button>
                )}
                <button type="submit" className={styles.trackBtn}>
                  Cek Status
                </button>
              </div>

              {searched && (
                <div className={styles.trackResult}>
                  {quickResult ? (
                    <div className={styles.trackFound}>
                      <div className={styles.trackFoundInfo}>
                        <span className={styles.code}>{quickResult.id}</span>
                        <strong>{quickResult.facility}</strong>
                        <small>
                          {quickResult.formattedDate} · {quickResult.time}
                        </small>
                      </div>
                      <span
                        className={`${styles.statusPill} ${
                          styles[`status_${quickResult.status}`]
                        }`}
                      >
                        {STATUS_LABEL[quickResult.status] || quickResult.status}
                      </span>
                    </div>
                  ) : (
                    <p className={styles.trackMissing}>
                      Kode <strong>&quot;{quickCode}&quot;</strong> tidak ditemukan. Pastikan
                      format sesuai (contoh: TR-XXXX-XXX).
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* KANAN: BENTO VISUAL GRID */}
          <div className={styles.heroVisual}>
            <div className={styles.bentoGrid}>
              {heroImages.map((fac, i) => (
                <figure
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`hero-photo ${styles.photo} ${styles[`photo${i}`]}`}
                  title={`Klik untuk meminjam ${fac.name}`}
                >
                  <Image
                    src={fac.image}
                    alt={fac.name}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 960px) 100vw, 35vw"
                    className={styles.photoImg}
                  />
                  <div className={styles.photoOverlay} />
                  <span className={styles.photoBadge}>
                    <Users size={11} /> {fac.cap}
                  </span>
                  <figcaption className={styles.photoCaption}>
                    <span>{fac.name}</span>
                    <ArrowUpRight size={14} />
                  </figcaption>
                </figure>
              ))}
            </div>

            {latestApproved && (
              <div className={`hero-photo ${styles.ticket}`}>
                <div className={styles.ticketIconWrap}>
                  <CircleCheck size={18} />
                </div>
                <div className={styles.ticketBody}>
                  <div className={styles.ticketHead}>
                    <span>Baru disetujui</span>
                    <span className={styles.code}>{latestApproved.id}</span>
                  </div>
                  <strong>{latestApproved.facility}</strong>
                  <span className={styles.ticketMeta}>
                    {latestApproved.formattedDate} · {latestApproved.time}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className={`reveal ${styles.statsSection}`} aria-label="Ringkasan">
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Building2 size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNum}>{availableCount}</span>
              <span className={styles.statLabel}>Ruang siap dipinjam</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNum}>{OFFICIAL_CLASS_ACCOUNTS?.length || 0}</span>
              <span className={styles.statLabel}>Akun kelas resmi aktif</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Clock size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNum}>{pendingCount}</span>
              <span className={styles.statLabel}>Pengajuan menunggu</span>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNum}>0</span>
              <span className={styles.statLabel}>Jadwal bentrok</span>
            </div>
          </div>
        </div>
      </section>

      {/* DAFTAR FASILITAS + FILTER KATEGORI */}
      <section className={styles.section} id="fasilitas">
        <div className={`reveal ${styles.sectionHead}`}>
          <div>
            <p className={styles.kicker}>Katalog Fasilitas</p>
            <h2 className={styles.sectionTitle}>Ruang yang bisa kamu pinjam</h2>
          </div>

          <div className={styles.headActions}>
            <div className={styles.filterTabs} role="tablist">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`${styles.filterTab} ${
                    activeCategory === cat ? styles.filterTabActive : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Link href="/user/booking" className={styles.headLink}>
              <span>Katalog lengkap</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className={styles.facGrid}>
          {filteredFacilities.map((fac) => (
            <article key={fac.id} className={`reveal ${styles.facCard}`}>
              <button
                type="button"
                className={styles.facImage}
                onClick={() => setSelectedFacility(fac)}
                aria-label={`Ajukan ${fac.name}`}
              >
                {fac.image ? (
                  <Image
                    src={fac.image}
                    alt={fac.name}
                    fill
                    className={styles.facImg}
                    sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  />
                ) : (
                  <span className={styles.imageFallback}>
                    <Building2 size={32} />
                  </span>
                )}
                <span className={styles.facCategoryBadge}>{fac.category}</span>
                <span
                  className={`${styles.facStatus} ${
                    fac.status !== 'Tersedia' ? styles.facStatusOff : ''
                  }`}
                >
                  <span className={styles.dot} />
                  {fac.status}
                </span>
              </button>

              <div className={styles.facBody}>
                <h3 className={styles.facName}>{fac.name}</h3>
                <div className={styles.facMeta}>
                  <span>
                    <MapPin size={13} /> {fac.loc}
                  </span>
                  <span>
                    <Users size={13} /> {fac.cap}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFacility(fac)}
                  className={styles.facBtn}
                >
                  <span>Ajukan peminjaman</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CARA PINJAM */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={`reveal ${styles.howIntro}`}>
            <p className={styles.kicker}>Alur Peminjaman</p>
            <h2 className={styles.sectionTitle}>Empat langkah, selesai dari kelas.</h2>
            <p className={styles.howText}>
              Tidak perlu lagi isi formulir kertas dan keliling mencari tanda tangan.
              Semua pengajuan tercatat otomatis sehingga tidak ada lagi dua kegiatan
              berebut ruang yang sama.
            </p>

            <ul className={styles.perks}>
              <li>
                <CalendarCheck2 size={17} />
                <span>Jadwal bentrok ditolak otomatis oleh sistem</span>
              </li>
              <li>
                <Ticket size={17} />
                <span>Setiap pengajuan mendapat kode resi unik</span>
              </li>
              <li>
                <PackagePlus size={17} />
                <span>Bisa sekalian pinjam proyektor, kabel HDMI &amp; mic</span>
              </li>
              <li>
                <ShieldCheck size={17} />
                <span>Diverifikasi langsung oleh tim Sarpras sekolah</span>
              </li>
            </ul>
          </div>

          <ol className={styles.steps}>
            {[
              [
                'Pilih ruang & cek jadwal',
                'Buka katalog fasilitas dan pastikan tanggal serta jam yang kamu incar masih kosong.',
              ],
              [
                'Isi detail kegiatan',
                'Tulis agenda kegiatan, penanggung jawab kelas/ekskul, jam mulai–selesai, dan alat tambahan.',
              ],
              [
                'Pantau verifikasi Sarpras',
                'Tim Sarpras meninjau pengajuanmu. Statusnya bisa dilacak kapan saja lewat kode resi.',
              ],
              [
                'Gunakan & jaga fasilitas',
                'Tunjukkan resi yang disetujui saat mengambil kunci, jaga kebersihan, dan kembalikan tepat waktu.',
              ],
            ].map(([title, desc], i) => (
              <li key={title} className={`reveal ${styles.step}`}>
                <span className={styles.stepNum}>0{i + 1}</span>
                <div className={styles.stepBody}>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA BANNER BAWAH */}
      <section className={`reveal ${styles.ctaBanner}`}>
        <div className={styles.ctaBannerInner}>
          <div className={styles.ctaBannerCopy}>
            <span className={styles.kicker}>Siap Mengajukan?</span>
            <h2>Ada kegiatan praktik, rapat OSIS, atau acara sekolah minggu ini?</h2>
            <p>Amankan jadwal ruangan kelasmu sekarang sebelum diambil kelas lain.</p>
          </div>
          <div className={styles.ctaBannerActions}>
            <Link href="/user/booking" className={styles.btnPrimary}>
              <span>Pinjam Ruang Sekarang</span>
              <ArrowRight size={17} />
            </Link>
            <Link href={secondaryCta.href} className={styles.btnGhost}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrand}>
              <span className={styles.footerMark}>TR</span>
              <span>SMK Tri Ratna</span>
            </div>
            <p className={styles.footerAbout}>
              Sistem peminjaman sarana &amp; prasarana terpadu untuk siswa, guru, dan
              organisasi sekolah SMK &amp; SMA Tri Ratna.
            </p>
            <address className={styles.footerAddress}>
              Jl. Talib I No. 35, Krukut, Taman Sari, Jakarta Barat 11140
            </address>
          </div>

          <div className={styles.footerCol}>
            <h4>Navigasi</h4>
            <ul>
              <li>
                <Link href="/">Beranda</Link>
              </li>
              <li>
                <Link href="/user/booking">Katalog Fasilitas</Link>
              </li>
              <li>
                <Link href="/login">Masuk Akun Kelas</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin/dashboard">Panel Sarpras</Link>
                </li>
              )}
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Fasilitas Utama</h4>
            <ul>
              {facilities.slice(0, 4).map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedFacility(f)}
                    className={styles.footerFacBtn}
                  >
                    {f.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} SMK Tri Ratna Jakarta</span>
          <span>Divisi Sarana &amp; Prasarana</span>
        </div>
      </footer>

      {selectedFacility && (
        <Modal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </div>
  );
}