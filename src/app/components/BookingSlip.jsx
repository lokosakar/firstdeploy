"use client";

import { useRef } from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import styles from './BookingSlip.module.css';

export default function BookingSlip({ booking, onClose }) {
  if (!booking) return null;


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.actionsBar}>
          <div className={styles.actionsLeft}>
            <span className={styles.previewTag}>Pratinjau Cetak Resmi</span>
          </div>
          <div className={styles.actionsRight}>
            <button onClick={handlePrint} className={styles.btnPrint}>
              <Printer size={16} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button onClick={onClose} className={styles.btnClose} aria-label="Tutup">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.printableArea} id="printableBookingSlip">
          <div className={styles.slipHeader}>
            <div className={styles.headerLogo}>
              <div className={styles.logoBadge}>TR</div>
              <div>
                <h2 className={styles.schoolName}>SMK TRI RATNA JAKARTA</h2>
                <p className={styles.schoolSub}>LAYANAN PENGELOLAAN SARANA & PRASARANA DIGITAL</p>
                <span className={styles.schoolAddress}>Jl. Talib I No. 35, Krukut, Kec. Taman Sari, Jakarta Barat 11140 • Telp: (021) 634-1234</span>
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.qrPlaceholder}>
                <div className={styles.qrInner}>
                  <ShieldCheck size={28} color="#059669" />
                  <span className={styles.qrCodeText}>{booking.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.slipDivider} />

          <div className={styles.slipTitleRow}>
            <h3 className={styles.docTitle}>SURAT BUKTI PERMOHONAN PEMINJAMAN RUANGAN</h3>
            <span className={styles.docNumber}>No. Registrasi: {booking.id}</span>
          </div>

          <table className={styles.slipTable}>
            <tbody>
              <tr>
                <td className={styles.thCol}>Akun Resmi Pemohon</td>
                <td className={styles.tdCol}><strong>{booking.user}</strong><br /><small style={{ color: '#475569' }}>{booking.email || '-'}</small></td>
                <td className={styles.thCol}>Siswa PIC Lapangan</td>
                <td className={styles.tdCol}><strong>{booking.picName || booking.user}</strong><br /><small style={{ color: '#475569' }}>{booking.role}</small></td>
              </tr>
              <tr>
                <td className={styles.thCol}>Fasilitas / Ruangan</td>
                <td className={styles.tdCol}><strong>{booking.facility}</strong></td>
                <td className={styles.thCol}>Kontak WhatsApp</td>
                <td className={styles.tdCol}>{booking.phone || '-'}</td>
              </tr>
              <tr>
                <td className={styles.thCol}>Tanggal Peminjaman</td>
                <td className={styles.tdCol}><strong>{booking.formattedDate || booking.date}</strong></td>
                <td className={styles.thCol}>Waktu Pelaksanaan</td>
                <td className={styles.tdCol}><strong>{booking.time}</strong> WIB</td>
              </tr>
              <tr>
                <td className={styles.thCol}>Peralatan Tambahan</td>
                <td className={styles.tdCol} colSpan={3}>
                  {booking.equipment && booking.equipment.length > 0 
                    ? booking.equipment.join(', ') 
                    : 'Tidak ada permintaan perlengkapan khusus'}
                </td>
              </tr>
              <tr>
                <td className={styles.thCol}>Tujuan / Agenda</td>
                <td className={styles.tdCol} colSpan={3}>
                  {booking.purpose}
                </td>
              </tr>
            </tbody>
          </table>

          <div className={styles.signatureSection}>
            <div className={styles.sigBox}>
              <span>Pemohon Kegiatan,</span>
              <div className={styles.sigSpace} />
              <strong>{booking.user}</strong>
              <small>{booking.role}</small>
            </div>

            <div className={styles.sigBoxCenter}>
              <div className={styles.statusStamp}>
                {booking.status === 'approved' && (
                  <div className={styles.stampApproved}>
                    <span>VERIFIKASI RESMI</span>
                    <strong>DISETUJUI SARPRAS</strong>
                    <small>SMK TRI RATNA</small>
                  </div>
                )}
                {booking.status === 'pending' && (
                  <div className={styles.stampPending}>
                    <span>STATUS PENGAJUAN</span>
                    <strong>DALAM PENINJAUAN</strong>
                    <small>MENUNGGU TTD SARPRAS</small>
                  </div>
                )}
                {booking.status === 'rejected' && (
                  <div className={styles.stampRejected}>
                    <span>STATUS PENGAJUAN</span>
                    <strong>TIDAK DISETUJUI</strong>
                    <small>{booking.rejectReason || 'Alasan Sarpras'}</small>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.sigBox}>
              <span>Petugas Sarpras,</span>
              <div className={styles.sigSpace} />
              <strong>Staf Administrasi Sarpras</strong>
              <small>NIP. 19850412 201001 1 008</small>
            </div>
          </div>

          <div className={styles.slipFooterNotes}>
            <p>* Harap menunjukkan surat bukti ini atau kode reservasi kepada petugas keamanan / penjaga gedung sebelum memasuki ruangan.</p>
            <p>* Wajib menjaga ketertiban, kebersihan, serta mematikan seluruh perangkat elektronik (AC/Lampu/Proyektor) setelah selesai.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
