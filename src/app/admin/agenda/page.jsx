"use client";

import { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Clock, 
  User, 
  CheckCircle2, 
  Clock4, 
  Calendar as CalendarIcon,
  Search
} from 'lucide-react';
import { useBooking } from '../../lib/BookingContext';
import styles from './agenda.module.css';

// Helper agar tanggal lokal (WIB) tidak meleset karena UTC toISOString()
function getLocalToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

export default function AdminAgenda() {
  const { facilities = [], requests = [] } = useBooking();

  const [selectedFacility, setSelectedFacility] = useState('Semua');
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [filterByDate, setFilterByDate] = useState(false); // Default menampilkan semua tanggal agar jadwal langsung terlihat
  const [searchQuery, setSearchQuery] = useState('');

  // Ambil semua agenda yang tidak ditolak
  const activeRequests = useMemo(() => {
    return requests.filter(r => r.status !== 'rejected');
  }, [requests]);

  // Filter berdasarkan ruangan, tanggal (jika mode Per Tanggal aktif), dan pencarian
  const filteredAgenda = useMemo(() => {
    return activeRequests.filter(item => {
      const matchesFac = selectedFacility === 'Semua' || item.facility?.includes(selectedFacility);
      const matchesDate = !filterByDate || !item.date || item.date === selectedDate;
      const matchesSearch = !searchQuery.trim() || 
        item.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facility?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFac && matchesDate && matchesSearch;
    });
  }, [activeRequests, selectedFacility, selectedDate, filterByDate, searchQuery]);

  // Statistik singkat untuk bagian atas
  const approvedCount = activeRequests.filter(r => r.status === 'approved').length;
  const pendingCount = activeRequests.filter(r => r.status === 'pending').length;

  const changeDay = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
    setFilterByDate(true);
  };

  const setToday = () => {
    setSelectedDate(getLocalToday());
    setFilterByDate(true);
  };

  return (
    <main className={styles.mainContent}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerBadge}>
            <span className={styles.badgeDot} />
            SARPRAS SEKOLAH TRI RATNA
          </span>
          <h1>Agenda & Jadwal Pemakaian Ruang</h1>
          <p className={styles.headerSubtitle}>
            Pantau jadwal penggunaan sarana dan prasarana Sekolah Tri Ratna Jakarta secara terpusat.
          </p>
        </div>

        <div className={styles.controlsWrapper}>
          {/* Toggle Semua Tanggal vs Per Tanggal */}
          <div className={styles.modeToggle}>
            <button
              type="button"
              onClick={() => setFilterByDate(false)}
              className={`${styles.modeBtn} ${!filterByDate ? styles.modeBtnActive : ''}`}
            >
              Semua Jadwal
            </button>
            <button
              type="button"
              onClick={() => setFilterByDate(true)}
              className={`${styles.modeBtn} ${filterByDate ? styles.modeBtnActive : ''}`}
            >
              Per Tanggal
            </button>
          </div>

          {/* Kontrol Kalender */}
          <div className={styles.calendarControl}>
            <button onClick={() => changeDay(-1)} className={styles.navBtn} title="Hari Sebelumnya">
              <ChevronLeft size={18} />
            </button>
            <button onClick={setToday} className={styles.todayBtn}>
              Hari Ini
            </button>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFilterByDate(true);
              }}
              className={styles.datePicker}
            />
            <button onClick={() => changeDay(1)} className={styles.navBtn} title="Hari Berikutnya">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* RINGKASAN STATISTIK */}
      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconBlue}>
            <CalendarDays size={20} />
          </div>
          <div className={styles.statInfo}>
            <span>Total Agenda Aktif</span>
            <strong>{activeRequests.length} Kegiatan</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconGreen}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span>Terkonfirmasi Disetujui</span>
            <strong>{approvedCount} Jadwal</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconGold}>
            <Clock4 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span>Menunggu Persetujuan</span>
            <strong>{pendingCount} Pengajuan</strong>
          </div>
        </div>
      </section>

      {/* TOOLBAR: FILTER RUANGAN & SEARCH */}
      <div className={styles.toolbar}>
        <div className={styles.filterChips}>
          <button 
            className={`${styles.chip} ${selectedFacility === 'Semua' ? styles.chipActive : ''}`}
            onClick={() => setSelectedFacility('Semua')}
          >
            Semua Ruangan
            <span className={styles.chipCount}>{activeRequests.length}</span>
          </button>

          {facilities.map(fac => {
            const count = activeRequests.filter(r => r.facility?.includes(fac.name)).length;
            return (
              <button 
                key={fac.id}
                className={`${styles.chip} ${selectedFacility === fac.name ? styles.chipActive : ''}`}
                onClick={() => setSelectedFacility(fac.name)}
              >
                {fac.name}
                <span className={styles.chipCount}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari kegiatan, peminjam, ruang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* AGENDA TIMELINE LIST */}
      <div className={styles.agendaGrid}>
        {filteredAgenda.length === 0 ? (
          <div className={styles.emptyAgenda}>
            <div className={styles.emptyIconWrap}>
              <CalendarDays size={30} />
            </div>
            <h3>Belum ada agenda pemakaian terjadwal</h3>
            <p>
              {filterByDate 
                ? `Tidak ada jadwal pemakaian ruangan pada tanggal ${selectedDate}.` 
                : 'Ruangan pada kategori pencarian ini sedang kosong dan siap digunakan untuk kegiatan sekolah.'}
            </p>
            {(filterByDate || selectedFacility !== 'Semua' || searchQuery) && (
              <button 
                onClick={() => {
                  setFilterByDate(false);
                  setSelectedFacility('Semua');
                  setSearchQuery('');
                }}
                className={styles.resetBtn}
              >
                Tampilkan Semua Jadwal
              </button>
            )}
          </div>
        ) : (
          filteredAgenda.map(item => (
            <article key={item.id} className={styles.agendaCard}>
              <div className={styles.agendaHeader}>
                <div className={styles.timeBadge}>
                  <Clock size={14} />
                  <span>{item.time}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${item.status}`]}`}>
                  {item.status === 'approved' ? (
                    <>
                      <CheckCircle2 size={13} />
                      Terkonfirmasi Aktif
                    </>
                  ) : (
                    <>
                      <Clock4 size={13} />
                      Menunggu Persetujuan
                    </>
                  )}
                </span>
              </div>

              <div className={styles.agendaBody}>
                <div className={styles.facilityName}>
                  <span className={styles.facilityIconWrap}>
                    <Building2 size={14} />
                  </span>
                  <h4>{item.facility}</h4>
                </div>

                <h5 className={styles.eventTitle}>{item.purpose}</h5>

                <div className={styles.eventMeta}>
                  <span className={styles.metaItem}>
                    <User size={14} />
                    <span>{item.user}</span>
                    {item.role && <span className={styles.roleTag}>{item.role}</span>}
                  </span>
                  <span className={styles.metaItem}>
                    <CalendarIcon size={14} />
                    <span>{item.formattedDate || item.date}</span>
                  </span>
                </div>

                {item.equipment?.length > 0 && (
                  <div className={styles.equipWrap}>
                    {item.equipment.map((eq, i) => (
                      <span key={i} className={styles.equipItem}>{eq}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}