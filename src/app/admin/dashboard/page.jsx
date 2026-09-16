"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  CheckCircle, 
  XCircle, 
  Clock, 
  Check, 
  X, 
  Search, 
  Filter, 
  Eye, 
  Phone, 
  Building2, 
  Calendar, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useBooking } from '../../lib/BookingContext';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const contentRef = useRef(null);
  const { requests, updateBookingStatus } = useBooking();

  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Calculate dynamic KPIs
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const KPI_STATS = [
    { id: 'total', label: 'Total Permohonan', value: totalCount, variant: 'default', sub: 'Semua permohonan masuk' },
    { id: 'pending', label: 'Menunggu Review', value: pendingCount, variant: 'pending', sub: 'Perlu verifikasi Sarpras Segera' },
    { id: 'approved', label: 'Disetujui Aktif', value: approvedCount, variant: 'approved', sub: 'Jadwal ruang terkonfirmasi' },
    { id: 'rejected', label: 'Ditolak / Batal', value: rejectedCount, variant: 'rejected', sub: 'Tidak memenuhi syarat' }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stagger-item',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo('.row-anim',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: "power2.out", delay: 0.2 }
      );
    }, contentRef);

    return () => ctx.revert();
  }, [filterStatus, searchTerm]);

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      req.id.toLowerCase().includes(query) ||
      req.user.toLowerCase().includes(query) ||
      req.facility.toLowerCase().includes(query) ||
      req.role.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id) => {
    updateBookingStatus(id, 'approved');
  };

  const handleOpenRejectModal = (item) => {
    setRejectingItem(item);
    setRejectReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (rejectingItem) {
      updateBookingStatus(rejectingItem.id, 'rejected', rejectReason || 'Tidak memenuhi kriteria Sarpras');
      setRejectingItem(null);
    }
  };

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className={styles.mainContent} ref={contentRef}>
        {/* HEADER SECTION */}
        <header className={`stagger-item ${styles.header}`}>
          <div className={styles.headerLeft}>
            <span className={styles.headerBadge}>DIVISI SARANA & PRASARANA</span>
            <h1>Manajemen Reservasi Fasilitas</h1>
            <p className={styles.headerSubtitle}>Tahun Ajaran 2025/2026 • SMK Tri Ratna Jakarta</p>
          </div>
        </header>

        {/* KPI CARDS GRID */}
        <section className={styles.statsGrid} aria-label="Ringkasan Statistik">
          {KPI_STATS.map((stat) => (
            <article
              key={stat.id}
              className={`stagger-item ${styles.statCard} ${styles[`statCard_${stat.variant}`]}`}
            >
              <div className={styles.statTop}>
                <h3 className={`${styles.statLabel} ${styles[`statLabel_${stat.variant}`]}`}>
                  {stat.label}
                </h3>
                {stat.id === 'pending' && stat.value > 0 && (
                  <span className={styles.livePulseDot} />
                )}
              </div>
              <div className={`${styles.statValue} ${styles[`statValue_${stat.variant}`]}`}>
                {stat.value}
              </div>
              <span className={styles.statSub}>{stat.sub}</span>
            </article>
          ))}
        </section>

        {/* CONTROLS & FILTER BAR */}
        <section className={`stagger-item ${styles.controlsBar}`}>
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Semua ({totalCount})
            </button>
            <button 
              className={`${styles.filterBtn} ${filterStatus === 'pending' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Menunggu Review ({pendingCount})
            </button>
            <button 
              className={`${styles.filterBtn} ${filterStatus === 'approved' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Disetujui ({approvedCount})
            </button>
            <button 
              className={`${styles.filterBtn} ${filterStatus === 'rejected' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Ditolak ({rejectedCount})
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Cari nomor ID, nama pemohon, atau ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className={styles.clearBtn}>×</button>
            )}
          </div>
        </section>

        {/* DATA TABLE SECTION */}
        <section className={`stagger-item ${styles.tableContainer}`} aria-label="Tabel Permohonan">
          {filteredRequests.length === 0 ? (
            <div className={styles.emptyTable}>
              <p>Tidak ada permohonan yang sesuai dengan filter atau kata kunci saat ini.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kode & Pemohon</th>
                  <th>Fasilitas</th>
                  <th>Jadwal Pelaksanaan</th>
                  <th>Agenda Kegiatan</th>
                  <th>Status</th>
                  <th>Aksi Sarpras</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="row-anim">
                    <td>
                      <div className={styles.userData}>
                        <span className={styles.requestId}>{req.id}</span>
                        <span className={styles.userName}>{req.user}</span>
                        <span className={styles.userSub}>{req.role}</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.facilityCell}>
                        <Building2 size={15} color="var(--primary)" />
                        <span className={styles.fw600}>{req.facility}</span>
                      </div>
                    </td>

                    <td>
                      <div className={styles.userData}>
                        <span className={styles.userName}>{req.formattedDate || req.date}</span>
                        <span className={styles.userSub}>{req.time}</span>
                      </div>
                    </td>

                    <td>
                      <p className={styles.purposeText}>{req.purpose}</p>
                      {req.equipment?.length > 0 && (
                        <span className={styles.equipmentTagBadge}>
                          +{req.equipment.length} Perlengkapan
                        </span>
                      )}
                    </td>

                    <td>
                      {req.status === 'pending' && (
                        <span className={`${styles.badge} ${styles.pending}`}>
                          <Clock size={13} /> Menunggu
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className={`${styles.badge} ${styles.approved}`}>
                          <CheckCircle size={13} /> Disetujui
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className={`${styles.badge} ${styles.rejected}`}>
                          <XCircle size={13} /> Ditolak
                        </span>
                      )}
                    </td>

                    <td>
                      <div className={styles.actionGroup}>
                        <button 
                          className={`${styles.btnAction} ${styles.btnDetail}`}
                          onClick={() => setSelectedDetail(req)}
                          title="Lihat Detail Lengkap"
                          aria-label={`Detail permohonan ${req.id}`}
                        >
                          <Eye size={15} />
                        </button>

                        {req.status === 'pending' ? (
                          <>
                            <button 
                              className={`${styles.btnAction} ${styles.btnApprove}`} 
                              onClick={() => handleApprove(req.id)}
                              aria-label={`Setujui permohonan ${req.id}`} 
                              title="Setujui Reservasi"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className={`${styles.btnAction} ${styles.btnReject}`} 
                              onClick={() => handleOpenRejectModal(req)}
                              aria-label={`Tolak permohonan ${req.id}`} 
                              title="Tolak Reservasi"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <span className={styles.actionDone}>
                            {req.status === 'approved' ? 'Telah Disetujui' : 'Telah Ditolak'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDetail(null)}>
          <div className={styles.detailCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <span className={styles.resCodeBadge}>{selectedDetail.id}</span>
                <h3>Detail Permohonan Peminjaman</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div>
                  <span className={styles.dLabel}>Ruangan / Prasarana</span>
                  <p className={styles.dVal}>{selectedDetail.facility}</p>
                </div>
                <div>
                  <span className={styles.dLabel}>Nama Penanggung Jawab</span>
                  <p className={styles.dVal}>{selectedDetail.user} ({selectedDetail.role})</p>
                </div>
                <div>
                  <span className={styles.dLabel}>Jadwal Penggunaan</span>
                  <p className={styles.dVal}>{selectedDetail.formattedDate} • {selectedDetail.time}</p>
                </div>
                <div>
                  <span className={styles.dLabel}>Kontak WhatsApp</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span className={styles.dVal}>{selectedDetail.phone || '-'}</span>
                    {selectedDetail.phone && (
                      <a 
                        href={`https://wa.me/${selectedDetail.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.waLink}
                      >
                        <Phone size={12} /> Hubungi
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <span className={styles.dLabel}>Perlengkapan Tambahan yang Diminta</span>
                <div className={styles.equipPills}>
                  {selectedDetail.equipment?.length > 0 ? (
                    selectedDetail.equipment.map((eq, i) => (
                      <span key={i} className={styles.equipPill}>
                        <Check size={12} color="#059669" /> {eq}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada peralatan tambahan yang diminta.</span>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <span className={styles.dLabel}>Tujuan & Agenda Kegiatan</span>
                <p className={styles.dPurposeBox}>{selectedDetail.purpose}</p>
              </div>

              {selectedDetail.status === 'rejected' && selectedDetail.rejectReason && (
                <div className={styles.rejectNotice}>
                  <strong>Alasan Penolakan:</strong> {selectedDetail.rejectReason}
                </div>
              )}
            </div>

            <div className={styles.modalFoot}>
              {selectedDetail.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
                  <button 
                    className={styles.btnModalReject} 
                    onClick={() => {
                      const item = selectedDetail;
                      setSelectedDetail(null);
                      handleOpenRejectModal(item);
                    }}
                  >
                    Tolak Permohonan
                  </button>
                  <button 
                    className={styles.btnModalApprove}
                    onClick={() => {
                      handleApprove(selectedDetail.id);
                      setSelectedDetail(null);
                    }}
                  >
                    Setujui Reservasi
                  </button>
                </div>
              )}
              {selectedDetail.status !== 'pending' && (
                <button className={styles.btnDoneClose} onClick={() => setSelectedDetail(null)}>
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingItem && (
        <div className={styles.modalOverlay} onClick={() => setRejectingItem(null)}>
          <div className={styles.rejectCard} onClick={e => e.stopPropagation()}>
            <h3>Tolak Permohonan Reservasi</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Anda akan menolak permohonan <strong>{rejectingItem.id}</strong> dari <strong>{rejectingItem.user}</strong>.
            </p>

            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Alasan Penolakan (akan ditampilkan ke pemohon):
                </label>
                <textarea 
                  rows="3" 
                  className={styles.rejectTextarea}
                  placeholder="Contoh: Jadwal bentrok dengan acara ujian sekolah atau di luar ketentuan jam dinas..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className={styles.btnCancel} 
                  onClick={() => setRejectingItem(null)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnConfirmReject}>
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}