"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import {
  Building2,
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Sparkles,
  Layers,
  Zap,
  FileCheck,
  Check
} from 'lucide-react';

import Navbar from './components/Navbar';
import Modal from './components/Modal';
import { useBooking } from './lib/BookingContext';
import styles from './page.module.css';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef(null);
  const { facilities, requests, searchBooking } = useBooking();
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [quickCode, setQuickCode] = useState('');
  const [quickResult, setQuickResult] = useState(null);
  const [searched, setSearched] = useState(false);


  const approvedRequests = requests.filter(r => r.status === 'approved').slice(0, 3);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo('.hero-anim',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );


      gsap.fromTo('.stat-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.${styles.statsSection}`,
            start: "top 85%"
          }
        }
      );

      // Showcase cards
      gsap.fromTo('.facility-card-anim',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: `.${styles.showcaseGrid}`,
            start: "top 85%"
          }
        }
      );

      // Feature items
      gsap.fromTo('.feature-anim',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.${styles.featuresGrid}`,
            start: "top 85%"
          }
        }
      );
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

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      <Navbar />

      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={styles.heroContainer}>
          <div className={`hero-anim ${styles.badgeWrapper}`}>
            <span className={styles.heroBadge}>
              <Sparkles size={15} className={styles.sparkleIcon} />
              SISTEM RESERVASI PRASARANA DIGITAL • SMK TRI RATNA
            </span>
          </div>

          <h1 className={`hero-anim ${styles.heroTitle}`}>
            Peminjaman Fasilitas Sekolah Jadi <span className="gradient-text">Cerdas, Cepat & Terorganisir</span>.
          </h1>

          <p className={`hero-anim ${styles.heroSubtitle}`}>
            Akses resmi reservasi sarana dan prasarana akademik SMK Tri Ratna. Dari laboratorium komputer Apple iMac hingga auditorium berstandar tinggi—cek ketersediaan jadwal real-time, bebas bentrok, dan diverifikasi transparan oleh Admin Sarpras.
          </p>

          <div className={`hero-anim ${styles.heroCtaGroup}`}>
            <Link href="/user/booking" className={styles.btnPrimary}>
              <span>Jelajahi & Reservasi Ruang</span>
              <ArrowRight size={18} />
            </Link>

            <Link href="/admin/dashboard" className={styles.btnSecondary}>
              <ShieldCheck size={18} />
              <span>Panel Sarpras Admin</span>
            </Link>
          </div>

          {/* QUICK TRACK BAR */}
          <div className={`hero-anim ${styles.quickTrackCard}`}>
            <form onSubmit={handleQuickSearch} className={styles.quickTrackForm}>
              <div className={styles.quickTrackLeft}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Lacak status booking Anda (contoh: TR-2025-089 atau nama)"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  className={styles.quickInput}
                />
              </div>
              <button type="submit" className={styles.quickBtn}>
                Cek Status
              </button>
            </form>

            {searched && (
              <div className={styles.quickResultArea}>
                {quickResult ? (
                  <div className={styles.quickResultBox}>
                    <div className={styles.qResLeft}>
                      <span className={styles.qResId}>{quickResult.id}</span>
                      <strong className={styles.qResFac}>{quickResult.facility}</strong>
                      <span className={styles.qResDate}>{quickResult.formattedDate} • {quickResult.time}</span>
                    </div>
                    <div className={styles.qResRight}>
                      <span className={`${styles.statusPill} ${styles[`status_${quickResult.status}`]}`}>
                        {quickResult.status === 'pending' ? 'Sedang Ditinjau' : quickResult.status === 'approved' ? 'Disetujui Sarpras' : 'Ditolak'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.quickNotFound}>
                    Kode &quot;<strong>{quickCode}</strong>&quot; tidak ditemukan. Pastikan format TR-XXXX-XXX tepat.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STAT METRICS SECTION */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={`stat-item ${styles.statCard}`}>
            <div className={styles.statIconBox}>
              <Building2 size={24} color="#059669" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statNumber}>4 Fasilitas</span>
              <span className={styles.statLabel}>Prasarana Unggulan Siap Pakai</span>
            </div>
          </div>

          <div className={`stat-item ${styles.statCard}`}>
            <div className={styles.statIconBox}>
              <Zap size={24} color="#059669" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statNumber}>Deteksi Pintar</span>
              <span className={styles.statLabel}>Anti-Bentrok Jadwal Otomatis</span>
            </div>
          </div>

          <div className={`stat-item ${styles.statCard}`}>
            <div className={styles.statIconBox}>
              <FileCheck size={24} color="#059669" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statNumber}>100% Digital</span>
              <span className={styles.statLabel}>Paperless & Kode Resi Unik</span>
            </div>
          </div>

          <div className={`stat-item ${styles.statCard}`}>
            <div className={styles.statIconBox}>
              <Clock size={24} color="#059669" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statNumber}>Verifikasi Cepat</span>
              <span className={styles.statLabel}>Tinjauan Langsung Tim Sarpras</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FACILITIES SPOTLIGHT */}
      <section className={styles.showcaseSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>KATALOG UTAMA</span>
          <h2 className={styles.sectionTitle}>Prasarana Unggulan SMK Tri Ratna</h2>
          <p className={styles.sectionDesc}>
            Fasilitas representatif dengan standar sarana sekolah modern untuk mendukung mutu pembelajaran dan aktivitas siswa.
          </p>
        </div>

        <div className={styles.showcaseGrid}>
          {facilities.map((fac) => (
            <article key={fac.id} className={`facility-card-anim ${styles.facilityCard}`}>
              <div className={styles.cardImageWrapper}>
                {fac.image ? (
                  <Image
                    src={fac.image}
                    alt={fac.name}
                    fill
                    className={styles.cardImg}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className={styles.imageFallback}>
                    <Building2 size={40} />
                  </div>
                )}

                <span className={styles.badgeAvailability}>
                  <span className="pulse-dot" style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: fac.status === 'Tersedia' ? '#10B981' : '#F59E0B',
                    display: 'inline-block', marginRight: 6
                  }} />
                  {fac.status}
                </span>

                <span className={styles.categoryTag}>{fac.category}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{fac.name}</h3>

                <div className={styles.cardMeta}>
                  <span><MapPin size={15} /> {fac.loc}</span>
                  <span><Users size={15} /> {fac.cap}</span>
                </div>

                <p className={styles.cardDesc}>{fac.desc}</p>

                {/* Amenities pills */}
                <div className={styles.amenitiesWrap}>
                  {fac.amenities?.slice(0, 3).map((am, i) => (
                    <span key={i} className={styles.amenityPill}>
                      <Check size={12} color="#059669" /> {am}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    onClick={() => setSelectedFacility(fac)}
                    className={styles.btnBookNow}
                  >
                    <span>Reservasi Ruangan</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.viewAllWrap}>
          <Link href="/user/booking" className={styles.btnViewAll}>
            Lihat Semua Detail di Katalog Lengkap
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* WHY SMART SYSTEM SECTION */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>KEUNGGULAN SISTEM</span>
          <h2 className={styles.sectionTitle}>Dirancang Cerdas untuk Efisiensi Sekolah</h2>
          <p className={styles.sectionDesc}>
            Menghilangkan kendala birokrasi manual, pemesanan tumpang tindih, dan ketidakpastian persetujuan ruangan.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={`feature-anim ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <Zap size={24} />
            </div>
            <h3>Deteksi Bentrok Jadwal</h3>
            <p>Sistem otomatis mengecek slot tanggal dan jam peminjaman untuk memastikan tidak ada dua agenda yang memakai ruangan sama.</p>
          </div>

          <div className={`feature-anim ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <CheckCircle2 size={24} />
            </div>
            <h3>Struk Digital & Kode Resi Unik</h3>
            <p>Setiap permohonan langsung mendapatkan ID Reservasi resmi yang dapat dilacak secara transparan oleh siswa maupun guru.</p>
          </div>

          <div className={`feature-anim ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <Layers size={24} />
            </div>
            <h3>Pilihan Inventaris Lengkap</h3>
            <p>Pilih kebutuhan perlengkapan tambahan seperti proyektor 4K, sound system, atau mic wireless secara terintegrasi saat mengajukan.</p>
          </div>

          <div className={`feature-anim ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={24} />
            </div>
            <h3>Panel Admin Sarpras Real-Time</h3>
            <p>Staf sarana prasarana dapat meninjau, menyetujui, atau menolak permohonan dengan satu klik serta memantau agenda kalender.</p>
          </div>
        </div>
      </section>

      {/* 4 STEPS WORKFLOW */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>ALUR MUDAH</span>
            <h2 className={styles.sectionTitle}>4 Langkah Praktis Peminjaman</h2>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <span className={styles.stepNum}>01</span>
              <h4>Pilih Fasilitas</h4>
              <p>Pilih ruangan atau sarana yang sesuai kebutuhan kegiatan Anda dari katalog.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNum}>02</span>
              <h4>Tentukan Jadwal</h4>
              <p>Isi data pemohon, tanggal, serta rentang jam. Sistem akan memverifikasi ketersediaan.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNum}>03</span>
              <h4>Verifikasi Sarpras</h4>
              <p>Tim Admin Sarpras memeriksa agenda permohonan dan menerbitkan persetujuan resmi.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNum}>04</span>
              <h4>Ruangan Siap Digunakan</h4>
              <p>Gunakan fasilitas sesuai jadwal dengan tenang dan bertanggung jawab.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrand}>
              <Building2 size={24} color="#10B981" />
              <span>SMK Tri Ratna Jakarta</span>
            </div>
            <p className={styles.footerAbout}>
              Sistem Manajemen Sarana & Prasarana Digital terpadu. Memberikan kemudahan akses reservasi fasilitas akademik dan ekstrakurikuler bagi seluruh civitas sekolah.
            </p>
            <span className={styles.footerAddress}>
              Jl. Talib I No. 35, Krukut, Taman Sari, Jakarta Barat 11140
            </span>
          </div>

          <div className={styles.footerLinksCol}>
            <h4>Navigasi Portal</h4>
            <ul>
              <li><Link href="/">Beranda Utama</Link></li>
              <li><Link href="/user/booking">Katalog & Reservasi Fasilitas</Link></li>
              <li><Link href="/admin/dashboard">Panel Sarpras Admin</Link></li>
              <li><Link href="/admin/agenda">Kalender Agenda Ruang</Link></li>
            </ul>
          </div>

          <div className={styles.footerLinksCol}>
            <h4>Prasarana Utama</h4>
            <ul>
              <li><span>Cetiya Tri Ratna (Gedung A)</span></li>
              <li><span>Lab Komputer Mac (Gedung B)</span></li>
              <li><span>Lapangan Olahraga Serbaguna</span></li>
              <li><span>Mini Auditorium Tri Ratna</span></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} SMK Tri Ratna Jakarta • Divisi Sarana & Prasarana Digital. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {selectedFacility && (
        <Modal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </div>
  );
}