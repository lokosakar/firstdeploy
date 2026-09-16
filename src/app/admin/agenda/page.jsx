"use client";

import { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Clock, 
  User, 
  CheckCircle, 
  Clock4, 
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useBooking } from '../../lib/BookingContext';
import styles from './agenda.module.css';

export default function AdminAgenda() {
  const { facilities, requests } = useBooking();

  const [selectedFacility, setSelectedFacility] = useState('Semua');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter requests by facility and status (exclude rejected for agenda)
  const activeRequests = requests.filter(r => r.status !== 'rejected');

  const filteredAgenda = activeRequests.filter(item => {
    const matchesFac = selectedFacility === 'Semua' || item.facility.includes(selectedFacility);
    return matchesFac;
  });

  const nextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const prevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.mainContent}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerBadge}>MONITORING PRASARANA</span>
            <h1>Agenda & Jadwal Pemakaian Ruang</h1>
            <p className={styles.headerSubtitle}>Pantau jadwal penggunaan sarana dan prasarana sekolah secara terpusat.</p>
          </div>

          <div className={styles.calendarControl}>
            <button onClick={prevDay} className={styles.navBtn} title="Hari Sebelumnya">
              <ChevronLeft size={18} />
            </button>
            <button onClick={setToday} className={styles.todayBtn}>
              Hari Ini
            </button>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.datePicker}
            />
            <button onClick={nextDay} className={styles.navBtn} title="Hari Berikutnya">
              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        {/* FACILITY FILTER CHIPS */}
        <div className={styles.filterChips}>
          <button 
            className={`${styles.chip} ${selectedFacility === 'Semua' ? styles.chipActive : ''}`}
            onClick={() => setSelectedFacility('Semua')}
          >
            Semua Ruangan ({activeRequests.length})
          </button>
          {facilities.map(fac => {
            const count = activeRequests.filter(r => r.facility.includes(fac.name)).length;
            return (
              <button 
                key={fac.id}
                className={`${styles.chip} ${selectedFacility === fac.name ? styles.chipActive : ''}`}
                onClick={() => setSelectedFacility(fac.name)}
              >
                {fac.name} ({count})
              </button>
            );
          })}
        </div>

        {/* AGENDA TIMELINE LIST */}
        <div className={styles.agendaGrid}>
          {filteredAgenda.length === 0 ? (
            <div className={styles.emptyAgenda}>
              <CalendarDays size={48} color="var(--text-light)" />
              <h3>Belum ada agenda pemakaian terjadwal</h3>
              <p>Ruangan pada kategori ini sedang kosong dan siap digunakan untuk kegiatan sekolah.</p>
            </div>
          ) : (
            filteredAgenda.map(item => (
              <article key={item.id} className={styles.agendaCard}>
                <div className={styles.agendaHeader}>
                  <div className={styles.timeBadge}>
                    <Clock size={15} />
                    <span>{item.time}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status_${item.status}`]}`}>
                    {item.status === 'approved' ? 'Terkonfirmasi Aktif' : 'Menunggu Persetujuan'}
                  </span>
                </div>

                <div className={styles.agendaBody}>
                  <div className={styles.facilityName}>
                    <Building2 size={16} color="var(--primary)" />
                    <h4>{item.facility}</h4>
                  </div>

                  <h5 className={styles.eventTitle}>{item.purpose}</h5>

                  <div className={styles.eventMeta}>
                    <span className={styles.metaItem}>
                      <User size={14} />
                      {item.user} ({item.role})
                    </span>
                    <span className={styles.metaItem}>
                      <CalendarIcon size={14} />
                      {item.formattedDate || item.date}
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
    </div>
  );
}
