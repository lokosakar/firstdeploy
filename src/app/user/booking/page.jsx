"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
  Layers,
  History,
  Printer
} from 'lucide-react';

import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import BookingSlip from '../../components/BookingSlip';
import { useBooking } from '../../lib/BookingContext';
import styles from './booking.module.css';

const CATEGORIES = ["Semua", "Lab Komputer", "Ibadah & Karakter", "Olahraga", "Auditorium"];

export default function UserBooking() {
  const containerRef = useRef(null);
  const { facilities, requests } = useBooking();

  const [activeTab, setActiveTab] = useState('katalog');
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [slipBooking, setSlipBooking] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.header-anim',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 }
      );

      gsap.fromTo('.card-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: "back.out(1.2)" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab, selectedCategory]);

  const filteredFacilities = facilities.filter(fac => {
    const matchesCategory = selectedCategory === "Semua" || fac.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      fac.name.toLowerCase().includes(query) ||
      fac.loc.toLowerCase().includes(query) ||
      fac.desc.toLowerCase().includes(query) ||
      fac.amenities?.some(a => a.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  }).sort((a, b) => {
    if (sortBy === 'capDesc') return b.capacityNum - a.capacityNum;
    if (sortBy === 'capAsc') return a.capacityNum - b.capacityNum;
    if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
    return a.id - b.id;
  });

  const getDayAvailability = (facilityName) => {
    if (!filterDate) return null;
    const dayBookings = requests.filter(r => r.facility === facilityName && r.date === filterDate && r.status !== 'rejected');
    if (dayBookings.length === 0) return { status: 'free', text: 'Tersedia Seharian' };
    return { status: 'busy', text: `${dayBookings.length} Jadwal Terisi` };
  };

  return (
    <div className={styles.layout} ref={containerRef}>
      <Navbar />

      <main className={styles.mainContainer}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`header-anim ${styles.headerBadge}`}>PORTAL SISWA & GURU</span>
            <h1 className="header-anim">Katalog & Reservasi Prasarana</h1>
            <p className="header-anim">Pilih fasilitas resmi SMK Tri Ratna untuk kebutuhan pembelajaran, kegiatan organisasi, dan kejuaraan.</p>
          </div>

          <div className={`header-anim ${styles.tabSwitcher}`}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'katalog' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('katalog')}
            >
              <Building2 size={16} />
              <span>Katalog Fasilitas</span>
            </button>

            <button 
              className={`${styles.tabBtn} ${activeTab === 'riwayat' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('riwayat')}
            >
              <History size={16} />
              <span>Riwayat Permohonan</span>
              <span className={styles.historyCounter}>{requests.length}</span>
            </button>
          </div>
        </header>

        {activeTab === 'katalog' ? (
          <>
            <section className={`header-anim ${styles.controlsBar}`}>
              <div className={styles.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.pillBtn} ${selectedCategory === cat ? styles.pillBtnActive : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className={styles.searchSortGroup}>
                <div className={styles.searchBox}>
                  <Search size={17} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Cari ruang, lokasi, atau fasilitas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className={styles.clearSearchBtn}>×</button>
                  )}
                </div>

                <div className={styles.dateFilterBox}>
                  <Calendar size={15} color="var(--text-muted)" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className={styles.dateFilterInput}
                    title="Cek Ketersediaan Tanggal Tertentu"
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className={styles.clearDateBtn}>×</button>
                  )}
                </div>

                <div className={styles.sortBox}>
                  <SlidersHorizontal size={15} color="var(--text-muted)" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.sortSelect}
                  >
                    <option value="default">Urutan Standar</option>
                    <option value="nameAsc">Nama (A - Z)</option>
                    <option value="capDesc">Kapasitas (Terbanyak)</option>
                    <option value="capAsc">Kapasitas (Terkecil)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.grid}>
              {filteredFacilities.length === 0 ? (
                <div className={styles.emptyState}>
                  <Building2 size={48} color="var(--text-light)" />
                  <h3>Tidak ada fasilitas yang cocok</h3>
                  <p>Coba gunakan kata kunci pencarian yang lain atau ubah filter kategori Anda.</p>
                  <button 
                    onClick={() => { setSelectedCategory("Semua"); setSearchQuery(""); setFilterDate(""); }}
                    className={styles.resetFilterBtn}
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredFacilities.map((fac) => {
                  const dayAvail = getDayAvailability(fac.name);

                  return (
                    <article
                      key={fac.id}
                      className={`card-anim ${styles.card}`}
                      onClick={() => setSelectedFacility(fac)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedFacility(fac)}
                      aria-label={`Reservasi ${fac.name}`}
                    >
                      <div className={styles.cardImageWrapper}>
                        {fac.image ? (
                          <Image 
                            src={fac.image} 
                            alt={fac.name} 
                            fill 
                            className={styles.cardImg}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <Building2 size={40} opacity={0.3} />
                          </div>
                        )}

                        <div className={styles.badgeAvailable}>
                          <span style={{
                            display: 'inline-block',
                            width: 8, height: 8,
                            borderRadius: '50%',
                            background: fac.status === 'Tersedia' ? '#10B981' : '#F59E0B',
                            marginRight: 6
                          }} />
                          {fac.status}
                        </div>

                        <span className={styles.categoryBadge}>{fac.category}</span>

                        {dayAvail && (
                          <div className={`${styles.dateAvailBadge} ${dayAvail.status === 'free' ? styles.availFree : styles.availBusy}`}>
                            <Clock size={12} />
                            <span>{dayAvail.text}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{fac.name}</h3>

                        <div className={styles.cardMeta}>
                          <span><MapPin size={15} /> {fac.loc}</span>
                          <span><Users size={15} /> {fac.cap}</span>
                        </div>

                        <p className={styles.cardDesc}>{fac.desc}</p>

                        <div className={styles.amenities}>
                          {fac.amenities?.slice(0, 3).map((item, idx) => (
                            <span key={idx} className={styles.amenityTag}>
                              <Check size={12} color="#059669" /> {item}
                            </span>
                          ))}
                        </div>

                        <button className={styles.btnBook} tabIndex={-1}>
                          <span>Detail & Reservasi</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        ) : (
          <section className={`card-anim ${styles.historySection}`}>
            <div className={styles.historyHeader}>
              <div>
                <h2>Riwayat Permohonan Terkini</h2>
                <p>Pantau seluruh permohonan reservasi yang telah Anda atau rekan ajukan.</p>
              </div>
            </div>

            <div className={styles.historyList}>
              {requests.length === 0 ? (
                <div className={styles.emptyHistory}>Belum ada riwayat permohonan.</div>
              ) : (
                requests.map((item) => (
                  <div key={item.id} className={styles.historyCard}>
                    <div className={styles.historyMain}>
                      <div className={styles.historyHeadRow}>
                        <span className={styles.historyCode}>{item.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span className={`${styles.statusBadge} ${styles[`status_${item.status}`]}`}>
                            {item.status === 'pending' && <Clock size={14} />}
                            {item.status === 'approved' && <CheckCircle size={14} />}
                            {item.status === 'rejected' && <XCircle size={14} />}
                            {item.status === 'pending' ? 'Menunggu Review' : item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </span>
                          <button 
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
                          <p className={styles.hVal}>{item.user} ({item.role})</p>
                        </div>
                        <div>
                          <span className={styles.hLabel}>Jadwal:</span>
                          <p className={styles.hVal}>{item.formattedDate || item.date} • {item.time}</p>
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
                ))
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