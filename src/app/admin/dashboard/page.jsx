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
  Eye, 
  Phone, 
  Building2, 
  Calendar, 
  Sparkles,
  Layers,
  Mail,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useBooking } from '../../lib/BookingContext';
import styles from './admin.module.css';

const ITEMS_PER_PAGE = 5;

const QUICK_REJECT_REASONS = [
  'Jadwal bentrok dengan kegiatan resmi / ujian sekolah',
  'Fasilitas sedang dalam masa pemeliharaan Sarpras',
  'Pengajuan di luar jam operasional yang ditentukan',
  'Dokumen atau detail agenda kegiatan kurang lengkap'
];

export default function AdminDashboard() {
  const contentRef = useRef(null);
  const { requests, updateBookingStatus } = useBooking();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const KPI_STATS = [
    { 
      id: 'all', 
      label: 'Total Permohonan', 
      value: totalCount, 
      variant: 'default', 
      sub: 'Semua permohonan masuk',
      icon: Layers
    },
    { 
      id: 'pending', 
      label: 'Menunggu Review', 
      value: pendingCount, 
      variant: 'pending', 
      sub: 'Perlu verifikasi Sarpras segera',
      icon: Clock
    },
    { 
      id: 'approved', 
      label: 'Disetujui Aktif', 
      value: approvedCount, 
      variant: 'approved', 
      sub: 'Jadwal ruang terkonfirmasi',
      icon: CheckCircle
    },
    { 
      id: 'rejected', 
      label: 'Ditolak / Batal', 
      value: rejectedCount, 
      variant: 'rejected', 
      sub: 'Tidak memenuhi syarat',
      icon: XCircle
    }
  ];

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      req.id.toLowerCase().includes(query) ||
      req.user.toLowerCase().includes(query) ||
      req.facility.toLowerCase().includes(query) ||
      req.role.toLowerCase().includes(query) ||
      (req.picName && req.picName.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stagger-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out" }
      );
    }, contentRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.row-anim',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.3, ease: "power2.out" }
      );
    }, contentRef);
    return () => ctx.revert();
  }, [safeCurrentPage, filterStatus, searchTerm]);

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TR';
  };

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
    <main className={styles.mainContent} ref={contentRef}>
      <header className={`stagger-item ${styles.header}`}>
        <div className={styles.headerLeft}>
          <div className={styles.badgeWrapper}>
            <span className={styles.headerBadge}>
              <Sparkles size={12} /> DIVISI SARANA & PRASARANA
            </span>
            <span className={styles.schoolTag}>SMK Tri Ratna Jakarta</span>
          </div>
          <h1>Manajemen Reservasi Fasilitas</h1>
          <p className={styles.headerSubtitle}>
            Panel kendali verifikasi peminjaman ruang & perlengkapan • Tahun Ajaran 2025/2026
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.quickStatusPill}>
            <span className={pendingCount > 0 ? styles.statusDotWarn : styles.statusDotOk} />
            <span>
              {pendingCount > 0 
                ? `${pendingCount} Permohonan Menunggu Tindakan` 
                : 'Semua Permohonan Terverifikasi'}
            </span>
          </div>
        </div>
      </header>

      <section className={styles.statsGrid} aria-label="Ringkasan Statistik">
        {KPI_STATS.map((stat) => {
          const IconComponent = stat.icon;
          const isActive = filterStatus === stat.id;
          return (
            <article
              key={stat.id}
              onClick={() => setFilterStatus(stat.id)}
              className={`stagger-item ${styles.statCard} ${styles[`statCard_${stat.variant}`]} ${isActive ? styles.statCardActive : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setFilterStatus(stat.id)}
            >
              <div className={styles.statTop}>
                <h3 className={`${styles.statLabel} ${styles[`statLabel_${stat.variant}`]}`}>
                  {stat.label}
                </h3>
                <div className={`${styles.statIconWrap} ${styles[`statIcon_${stat.variant}`]}`}>
                  <IconComponent size={18} />
                  {stat.id === 'pending' && stat.value > 0 && (
                    <span className={styles.livePulseDot} />
                  )}
                </div>
              </div>
              <div className={`${styles.statValue} ${styles[`statValue_${stat.variant}`]}`}>
                {stat.value}
              </div>
              <span className={styles.statSub}>{stat.sub}</span>
            </article>
          );
        })}
      </section>

      <section className={`stagger-item ${styles.controlsBar}`}>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Semua <span className={styles.tabCount}>{totalCount}</span>
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'pending' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Menunggu Review <span className={`${styles.tabCount} ${styles.tabCountPending}`}>{pendingCount}</span>
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'approved' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Disetujui <span className={styles.tabCount}>{approvedCount}</span>
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'rejected' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Ditolak <span className={styles.tabCount}>{rejectedCount}</span>
          </button>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Cari ID, nama pemohon, PIC, atau ruangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className={styles.clearBtn} title="Hapus pencarian">
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      <section className={`stagger-item ${styles.tableContainer}`} aria-label="Tabel Permohonan">
        {filteredRequests.length === 0 ? (
          <div className={styles.emptyTable}>
            <div className={styles.emptyIconCircle}>
              <Search size={24} />
            </div>
            <h4>Tidak Ada Data Permohonan</h4>
            <p>Tidak ditemukan permohonan yang sesuai dengan filter atau kata kunci pencarian saat ini.</p>
            {(filterStatus !== 'all' || searchTerm) && (
              <button 
                className={styles.resetFilterBtn}
                onClick={() => { setFilterStatus('all'); setSearchTerm(''); }}
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colRequester}>Kode & Pemohon</th>
                    <th className={styles.colFacility}>Fasilitas Ruangan</th>
                    <th className={styles.colSchedule}>Jadwal Pelaksanaan</th>
                    <th className={styles.colPurpose}>Agenda Kegiatan</th>
                    <th className={styles.colStatus}>Status</th>
                    <th className={styles.colAction}>Aksi Sarpras</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((req) => (
                    <tr key={req.id} className="row-anim">
                      <td>
                        <div className={styles.requesterCell}>
                          <div className={styles.avatarCircle}>
                            {getInitials(req.user)}
                          </div>
                          <div className={styles.userData}>
                            <div className={styles.userTopMeta}>
                              <span className={styles.requestId}>{req.id}</span>
                              <span className={styles.userRolePill}>{req.role}</span>
                            </div>
                            <span className={styles.userName}>{req.user}</span>
                            {req.picName && (
                              <span className={styles.picBadge}>
                                <UserCheck size={11} /> PIC: {req.picName}
                              </span>
                            )}
                            {req.email && req.email !== '-' && (
                              <span className={styles.userEmail}>{req.email}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.facilityCell}>
                          <div className={styles.facilityIconBox}>
                            <Building2 size={16} />
                          </div>
                          <span className={styles.facilityName}>{req.facility}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.scheduleCell}>
                          <span className={styles.scheduleDate}>
                            <Calendar size={13} className={styles.scheduleIcon} /> {req.formattedDate || req.date}
                          </span>
                          <span className={styles.scheduleTime}>
                            <Clock size={12} /> {req.time}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.purposeWrapper}>
                          <p className={styles.purposeText} title={req.purpose}>{req.purpose}</p>
                          {req.equipment?.length > 0 && (
                            <span className={styles.equipmentTagBadge}>
                              +{req.equipment.length} Perlengkapan Tambahan
                            </span>
                          )}
                        </div>
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
                              {req.status === 'approved' ? 'Terverifikasi' : 'Dibatalkan'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.paginationFooter}>
              <div className={styles.paginationInfo}>
                Menampilkan <strong>{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredRequests.length)}</strong> dari <strong>{filteredRequests.length}</strong> data permohonan
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageArrowBtn}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className={styles.pageNumberList}>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${styles.pageNumberBtn} ${safeCurrentPage === page ? styles.pageNumberBtnActive : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.pageArrowBtn}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Halaman Berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedDetail && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDetail(null)}>
          <div className={styles.detailCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalBadgeRow}>
                  <span className={styles.resCodeBadge}>{selectedDetail.id}</span>
                  {selectedDetail.status === 'pending' && (
                    <span className={`${styles.badge} ${styles.pending}`}>Menunggu Review</span>
                  )}
                  {selectedDetail.status === 'approved' && (
                    <span className={`${styles.badge} ${styles.approved}`}>Disetujui</span>
                  )}
                  {selectedDetail.status === 'rejected' && (
                    <span className={`${styles.badge} ${styles.rejected}`}>Ditolak</span>
                  )}
                </div>
                <h3>Detail Permohonan Peminjaman</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedDetail(null)} aria-label="Tutup modal">
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailBox}>
                  <span className={styles.dLabel}>Ruangan / Prasarana</span>
                  <p className={styles.dVal}>
                    <Building2 size={15} className={styles.dIcon} /> {selectedDetail.facility}
                  </p>
                </div>
                <div className={styles.detailBox}>
                  <span className={styles.dLabel}>Akun Resmi Pemohon</span>
                  <p className={styles.dVal}>{selectedDetail.user} ({selectedDetail.role})</p>
                </div>
                <div className={styles.detailBox}>
                  <span className={styles.dLabel}>Siswa PIC / Penanggung Jawab</span>
                  <p className={styles.dVal}>{selectedDetail.picName || selectedDetail.user}</p>
                </div>
                <div className={styles.detailBox}>
                  <span className={styles.dLabel}>Email Resmi Terdaftar</span>
                  <p className={styles.dVal}>
                    <Mail size={14} className={styles.dIconMuted} /> {selectedDetail.email || '-'}
                  </p>
                </div>
                <div className={styles.detailBox}>
                  <span className={styles.dLabel}>Jadwal Penggunaan</span>
                  <p className={styles.dVal}>{selectedDetail.formattedDate || selectedDetail.date}</p>
                  <span className={styles.dSubTime}>{selectedDetail.time}</span>
                </div>
                <div className={styles.detailBox}>
                  <span className={styles.dLabel}>Kontak WhatsApp PIC</span>
                  <div className={styles.waRow}>
                    <span className={styles.dVal}>{selectedDetail.phone || '-'}</span>
                    {selectedDetail.phone && (
                      <a 
                        href={`https://wa.me/${selectedDetail.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.waLink}
                      >
                        <Phone size={12} /> Hubungi WA
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
                        <Check size={12} className={styles.equipCheck} /> {eq}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noEquipText}>
                      Tidak ada peralatan tambahan yang diminta.
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <span className={styles.dLabel}>Tujuan & Agenda Kegiatan</span>
                <p className={styles.dPurposeBox}>{selectedDetail.purpose}</p>
              </div>

              {selectedDetail.status === 'rejected' && selectedDetail.rejectReason && (
                <div className={styles.rejectNotice}>
                  <AlertCircle size={16} />
                  <div>
                    <strong>Alasan Penolakan:</strong> {selectedDetail.rejectReason}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFoot}>
              {selectedDetail.status === 'pending' ? (
                <div className={styles.modalActionRow}>
                  <button 
                    className={styles.btnModalReject} 
                    onClick={() => {
                      const item = selectedDetail;
                      setSelectedDetail(null);
                      handleOpenRejectModal(item);
                    }}
                  >
                    <X size={16} /> Tolak Permohonan
                  </button>
                  <button 
                    className={styles.btnModalApprove}
                    onClick={() => {
                      handleApprove(selectedDetail.id);
                      setSelectedDetail(null);
                    }}
                  >
                    <Check size={16} /> Setujui Reservasi
                  </button>
                </div>
              ) : (
                <button className={styles.btnDoneClose} onClick={() => setSelectedDetail(null)}>
                  Tutup Detail
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectingItem && (
        <div className={styles.modalOverlay} onClick={() => setRejectingItem(null)}>
          <div className={styles.rejectCard} onClick={e => e.stopPropagation()}>
            <div className={styles.rejectHeader}>
              <div className={styles.rejectWarningIcon}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3>Tolak Permohonan Reservasi</h3>
                <p className={styles.rejectSub}>
                  Permohonan <strong>{rejectingItem.id}</strong> oleh <strong>{rejectingItem.user}</strong> ({rejectingItem.facility})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className={styles.quickReasonSection}>
                <span className={styles.quickReasonLabel}>Pilih Cepat Alasan Umum:</span>
                <div className={styles.quickReasonList}>
                  {QUICK_REJECT_REASONS.map((reason, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`${styles.quickReasonChip} ${rejectReason === reason ? styles.quickReasonChipActive : ''}`}
                      onClick={() => setRejectReason(reason)}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.rejectInputGroup}>
                <label className={styles.rejectLabel}>
                  Alasan Penolakan (ditampilkan kepada pemohon):
                </label>
                <textarea 
                  rows="3" 
                  className={styles.rejectTextarea}
                  placeholder="Tulis alasan penolakan atau pilih dari opsi di atas..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div className={styles.rejectFoot}>
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
    </main>
  );
}