"use client";

import { Printer, X, ShieldCheck, Calendar, Clock, MapPin, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import styles from './BookingSlip.module.css';

export default function BookingSlip({ booking, onClose }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          label: 'DISETUJUI SARPRAS',
          sub: 'Verifikasi Resmi • Siap Digunakan',
          className: styles.statusApproved,
          icon: <CheckCircle2 size={16} />
        };
      case 'rejected':
        return {
          label: 'TIDAK DISETUJUI',
          sub: booking.rejectReason || 'Ditolak oleh Admin Sarpras',
          className: styles.statusRejected,
          icon: <XCircle size={16} />
        };
      default:
        return {
          label: 'DALAM PENINJAUAN',
          sub: 'Menunggu Persetujuan Sarpras',
          className: styles.statusPending,
          icon: <Clock3 size={16} />
        };
    }
  };

  const statusInfo = getStatusConfig(booking.status);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top Action Bar (Disembunyikan saat Print) */}
        <div className={styles.actionsBar}>
          <div className={styles.actionsLeft}>
            <span className={styles.previewDot} />
            <span className={styles.previewTag}>Pratinjau Bukti Reservasi</span>
          </div>
          <div className={styles.actionsRight}>
            <button onClick={handlePrint} className={styles.btnPrint}>
              <Printer size={15} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button onClick={onClose} className={styles.btnClose} aria-label="Tutup">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Area Kertas Resmi */}
        <div className={styles.printableArea} id="printableBookingSlip">
          {/* Header Instansi */}
          <header className={styles.slipHeader}>
            <div className={styles.headerLogo}>
              <div className={styles.logoBadge}>TR</div>
              <div>
                <h2 className={styles.schoolName}>SMK TRI RATNA JAKARTA</h2>
                <p className={styles.schoolSub}>LAYANAN SARANA & PRASARANA DIGITAL</p>
                <span className={styles.schoolAddress}>
                  Jl. Talib I No. 35, Taman Sari, Jakarta Barat 11140 • (021) 634-1234
                </span>
              </div>
            </div>

            <div className={styles.regBadge}>
              <div className={styles.regBadgeTop}>
                <ShieldCheck size={15} />
                <span>NO. REGISTRASI</span>
              </div>
              <strong className={styles.regCode}>{booking.id}</strong>
            </div>
          </header>

          {/* Banner Judul & Status */}
          <div className={styles.titleBanner}>
            <div>
              <h3 className={styles.docTitle}>BUKTI PEMINJAMAN RUANGAN</h3>
              <p className={styles.docSubtitle}>Dokumen sah penggunaan fasilitas sekolah</p>
            </div>
            <div className={`${styles.statusBadge} ${statusInfo.className}`}>
              {statusInfo.icon}
              <div>
                <strong>{statusInfo.label}</strong>
                <small>{statusInfo.sub}</small>
              </div>
            </div>
          </div>

          {/* Highlight Utama: Ruangan, Tanggal, Waktu */}
          <div className={styles.highlightBar}>
            <div className={styles.highlightItem}>
              <span className={styles.highlightLabel}>
                <MapPin size={13} /> Fasilitas / Ruangan
              </span>
              <strong className={styles.highlightValue}>{booking.facility}</strong>
            </div>
            <div className={styles.highlightItem}>
              <span className={styles.highlightLabel}>
                <Calendar size={13} /> Tanggal Peminjaman
              </span>
              <strong className={styles.highlightValue}>{booking.formattedDate || booking.date}</strong>
            </div>
            <div className={styles.highlightItem}>
              <span className={styles.highlightLabel}>
                <Clock size={13} /> Waktu Pelaksanaan
              </span>
              <strong className={styles.highlightValue}>{booking.time} WIB</strong>
            </div>
          </div>

          {/* Grid Detail Informasi (Menggantikan Tabel Kaku) */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Akun Pemohon</span>
              <strong className={styles.infoMain}>{booking.user}</strong>
              <span className={styles.infoSub}>{booking.email || '-'}</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Penanggung Jawab (PIC)</span>
              <strong className={styles.infoMain}>{booking.picName || booking.user}</strong>
              <span className={styles.infoSub}>
                {booking.role} • WA: {booking.phone || '-'}
              </span>
            </div>

            <div className={`${styles.infoCard} ${styles.fullWidth}`}>
              <span className={styles.infoLabel}>Tujuan / Agenda Kegiatan</span>
              <p className={styles.infoText}>{booking.purpose || '-'}</p>
            </div>

            <div className={`${styles.infoCard} ${styles.fullWidth}`}>
              <span className={styles.infoLabel}>Peralatan Tambahan</span>
              {booking.equipment && booking.equipment.length > 0 ? (
                <div className={styles.tagList}>
                  {booking.equipment.map((item, idx) => (
                    <span key={idx} className={styles.equipTag}>{item}</span>
                  ))}
                </div>
              ) : (
                <span className={styles.infoSub}>Tidak ada permintaan perlengkapan khusus</span>
              )}
            </div>
          </div>

          {/* Area Pengesahan / Tanda Tangan */}
          <div className={styles.signatureSection}>
            <div className={styles.sigBox}>
              <span>Pemohon Kegiatan,</span>
              <div className={styles.sigSpace} />
              <strong>{booking.user}</strong>
              <small>{booking.role}</small>
            </div>

            <div className={styles.sigBox}>
              <span>Mengetahui & Menyetujui,</span>
              <div className={styles.sigSpace} />
              <strong>Staf Administrasi Sarpras</strong>
              <small>NIP. 19850412 201001 1 008</small>
            </div>
          </div>

          {/* Catatan Kaki */}
          <footer className={styles.slipFooterNotes}>
            <p>• Tunjukkan bukti ini atau kode registrasi kepada petugas keamanan sebelum memasuki ruangan.</p>
            <p>• Wajib menjaga kebersihan serta mematikan AC, lampu, dan proyektor setelah kegiatan selesai.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}