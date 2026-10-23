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
  ArrowUpRight,
  Search,
  CalendarCheck2,
  ShieldCheck,
  Ticket,
  PackagePlus,
  CircleCheck,
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
  const { facilities, requests, searchBooking } = useBooking();
  const { isAdmin, isAuthenticated } = useAuth();
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [quickCode, setQuickCode] = useState('');
  const [quickResult, setQuickResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const latestApproved = requests.find((r) => r.status === 'approved');
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const availableCount = facilities.filter((f) => f.status === 'Tersedia').length;
  const heroImages = facilities.filter((f) => f.image).slice(0, 3);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-anim',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }
      );

      gsap.fromTo('.hero-photo',
        { y: 24, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15 }
      );

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" }
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

  const secondaryCta = isAdmin
    ? { href: '/admin/dashboard', label: 'Buka panel Sarpras' }
    : isAuthenticated
      ? { href: '/user/booking', label: 'Lihat pengajuan saya' }
      : { href: '/login', label: 'Masuk akun kelas' };

  return (
    <div className={styles.pageWrapper} ref={containerRef}>
      <Navbar />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={`hero-anim ${styles.eyebrow}`}>
              <span className={styles.eyebrowLine} />
              SMK &amp; SMA Tri Ratna · Jakarta Barat
            </p>

            <h1 className={`hero-anim ${styles.heroTitle}`}>
              Pinjam ruang sekolah tanpa <em>bolak-balik</em> ke ruang Sarpras.
            </h1>

            <p className={`hero-anim ${styles.heroSubtitle}`}>
              Cek jadwal lab, auditorium, cetiya, dan lapangan. Ajukan dari HP,
              lalu pantau statusnya sampai disetujui.
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
            <form onSubmit={handleQuickSearch} className={`hero-anim ${styles.trackForm}`}>
              <label htmlFor="quick-track" className={styles.trackLabel}>
                Sudah mengajukan? Lacak di sini
              </label>
              <div className={styles.trackRow}>
                <Search size={16} className={styles.trackIcon} />
                <input
                  id="quick-track"
                  type="text"
                  placeholder="Kode booking, mis. TR-2025-089"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  className={styles.trackInput}
                />
                <button type="submit" className={styles.trackBtn}>Cek</button>
              </div>

              {searched && (
                <div className={styles.trackResult}>
                  {quickResult ? (
                    <div className={styles.trackFound}>
                      <div>
                        <span className={styles.code}>{quickResult.id}</span>
                        <strong>{quickResult.facility}</strong>
                        <small>{quickResult.formattedDate} · {quickResult.time}</small>
                      </div>
                      <span className={`${styles.statusPill} ${styles[`status_${quickResult.status}`]}`}>
                        {STATUS_LABEL[quickResult.status]}
                      </span>
                    </div>
                  ) : (
                    <p className={styles.trackMissing}>
                      &quot;{quickCode}&quot; tidak ditemukan. Cek lagi format kodenya (TR-XXXX-XXX).
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

        
          <div className={styles.heroVisual}>
            {heroImages.map((fac, i) => (
              <figure key={fac.id} className={`hero-photo ${styles.photo} ${styles[`photo${i}`]}`}>
                <Image
                  src={fac.image}
                  alt={fac.name}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 960px) 50vw, 25vw"
                  className={styles.photoImg}
                />
                <figcaption>{fac.name}</figcaption>
              </figure>
            ))}

            {latestApproved && (
              <div className={`hero-photo ${styles.ticket}`}>
                <div className={styles.ticketHead}>
                  <CircleCheck size={15} />
                  <span>Baru disetujui</span>
                </div>
                <strong>{latestApproved.facility}</strong>
                <span className={styles.ticketMeta}>
                  {latestApproved.formattedDate} · {latestApproved.time}
                </span>
                <span className={styles.code}>{latestApproved.id}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ANGKA */}
      <section className={`reveal ${styles.stats}`} aria-label="Ringkasan">
        <div className={styles.statItem}>
          <span className={styles.statNum}>{availableCount}</span>
          <span className={styles.statLabel}>ruang siap dipinjam</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{OFFICIAL_CLASS_ACCOUNTS.length}</span>
          <span className={styles.statLabel}>akun kelas aktif</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{pendingCount}</span>
          <span className={styles.statLabel}>pengajuan menunggu</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>0</span>
          <span className={styles.statLabel}>jadwal bentrok</span>
        </div>
      </section>

      {/* FASILITAS */}
      <section className={styles.section} id="fasilitas">
        <div className={`reveal ${styles.sectionHead}`}>
          <div>
            <p className={styles.kicker}>Fasilitas</p>
            <h2 className={styles.sectionTitle}>Ruang yang bisa kamu pinjam</h2>
          </div>
          <Link href="/user/booking" className={styles.headLink}>
            Katalog lengkap <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className={styles.facGrid}>
          {facilities.map((fac) => (
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
                  <span className={styles.imageFallback}><Building2 size={32} /></span>
                )}
                <span className={`${styles.facStatus} ${fac.status !== 'Tersedia' ? styles.facStatusOff : ''}`}>
                  <span className={`pulse-dot ${styles.dot}`} />
                  {fac.status}
                </span>
              </button>

              <div className={styles.facBody}>
                <span className={styles.facCat}>{fac.category}</span>
                <h3 className={styles.facName}>{fac.name}</h3>
                <div className={styles.facMeta}>
                  <span><MapPin size={13} /> {fac.loc}</span>
                  <span><Users size={13} /> {fac.cap}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFacility(fac)}
                  className={styles.facBtn}
                >
                  Ajukan peminjaman
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
            <p className={styles.kicker}>Cara pinjam</p>
            <h2 className={styles.sectionTitle}>Empat langkah, selesai dari kelas.</h2>
            <p className={styles.howText}>
              Tidak perlu lagi isi formulir kertas dan menunggu tanda tangan.
              Semua pengajuan tercatat, jadi tidak ada lagi dua kegiatan di ruang yang sama.
            </p>

            <ul className={styles.perks}>
              <li><CalendarCheck2 size={17} /> Jadwal bentrok ditolak otomatis</li>
              <li><Ticket size={17} /> Setiap pengajuan dapat kode resi</li>
              <li><PackagePlus size={17} /> Bisa sekalian pinjam proyektor &amp; mic</li>
              <li><ShieldCheck size={17} /> Disetujui langsung oleh tim Sarpras</li>
            </ul>
          </div>

          <ol className={styles.steps}>
            {[
              ['Pilih ruang', 'Lihat katalog dan cek tanggal yang masih kosong.'],
              ['Isi pengajuan', 'Tulis agenda kegiatan, jam mulai–selesai, dan alat tambahan.'],
              ['Tunggu verifikasi', 'Tim Sarpras meninjau. Status bisa dilacak pakai kode resi.'],
              ['Pakai ruangnya', 'Datang sesuai jadwal, jaga kebersihan, kembalikan alat.'],
            ].map(([title, desc], i) => (
              <li key={title} className={`reveal ${styles.step}`}>
                <span className={styles.stepNum}>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
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
              Sistem peminjaman sarana &amp; prasarana untuk siswa, guru, dan organisasi sekolah.
            </p>
            <address className={styles.footerAddress}>
              Jl. Talib I No. 35, Krukut, Taman Sari, Jakarta Barat 11140
            </address>
          </div>

          <div className={styles.footerCol}>
            <h4>Halaman</h4>
            <ul>
              <li><Link href="/">Beranda</Link></li>
              <li><Link href="/user/booking">Katalog fasilitas</Link></li>
              <li><Link href="/login">Masuk</Link></li>
              {isAdmin && <li><Link href="/admin/dashboard">Panel Sarpras</Link></li>}
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Ruang</h4>
            <ul>
              {facilities.slice(0, 4).map((f) => (
                <li key={f.id}><span>{f.name}</span></li>
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