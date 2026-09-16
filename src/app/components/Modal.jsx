"use client";

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Sparkles, 
  Phone, 
  User, 
  Printer,
  Layers
} from 'lucide-react';
import { useBooking } from '../lib/BookingContext';
import BookingSlip from './BookingSlip';
import styles from './Modal.module.css';

const COMMON_EQUIPMENT = [
  "Sound System & Mic Wireless",
  "Display / Proyektor 4K",
  "Kabel Ekstensi / Terminal Listrik",
  "Kursi Tambahan",
  "AC Tambahan",
  "Bantuan Teknisi Lab"
];

export default function Modal({ facility, onClose }) {
  const { submitBooking, checkScheduleConflict } = useBooking();

  const [applicantName, setApplicantName] = useState('');
  const [role, setRole] = useState('Siswa / OSIS');
  const [phone, setPhone] = useState('');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [timeStart, setTimeStart] = useState('08:00');
  const [timeEnd, setTimeEnd] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  
  const [successBooking, setSuccessBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSlip, setShowSlip] = useState(false);

  if (!facility) return null;

  const isConflict = checkScheduleConflict(facility.name, date, timeStart, timeEnd);

  const toggleEquipment = (item) => {
    setSelectedEquipment(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applicantName.trim()) {
      setErrorMsg('Nama pemohon wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi untuk konfirmasi.');
      return;
    }
    if (!date) {
      setErrorMsg('Tanggal peminjaman wajib dipilih.');
      return;
    }
    if (!timeStart || !timeEnd || timeStart >= timeEnd) {
      setErrorMsg('Waktu mulai harus lebih awal dari waktu selesai.');
      return;
    }
    if (!purpose.trim()) {
      setErrorMsg('Tujuan dan agenda kegiatan wajib dijelaskan.');
      return;
    }

    if (isConflict) {
      setErrorMsg('Jadwal bentrok dengan permohonan lain. Silakan pilih waktu atau tanggal lain.');
      return;
    }

    const result = submitBooking({
      facilityId: facility.id,
      facility: facility.name,
      user: applicantName.trim(),
      role,
      phone: phone.trim(),
      date,
      timeStart,
      timeEnd,
      purpose: purpose.trim(),
      equipment: selectedEquipment
    });

    if (result.success) {
      setSuccessBooking(result.booking);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // fallback safe
      }
    } else {
      setErrorMsg(result.message || 'Gagal mengajukan permohonan.');
    }
  };

  const copyBookingCode = () => {
    if (successBooking) {
      navigator.clipboard.writeText(successBooking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div 
          className={`modal-anim ${styles.modalCard}`} 
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
        >
          <div className={styles.modalHeader}>
            <div>
              <span className={styles.categoryBadge}>{facility.category}</span>
              <h2 id="modalTitle" className={styles.modalTitle}>{facility.name}</h2>
              <p className={styles.facilityLoc}>{facility.loc} • Kapasitas {facility.cap}</p>
            </div>
            <button 
              className={styles.closeBtn} 
              onClick={onClose} 
              aria-label="Tutup form reservasi"
            >
              <X size={22} />
            </button>
          </div>

          {successBooking ? (
            <div className={styles.successView}>
              <div className={styles.successIconBox}>
                <CheckCircle2 size={48} color="#059669" />
              </div>

              <h3 className={styles.successTitle}>Permohonan Berhasil Diajukan!</h3>
              <p className={styles.successSubtitle}>
                Data reservasi Anda telah tercatat dalam sistem Sarpras SMK Tri Ratna.
              </p>

              <div className={styles.receiptCard}>
                <div className={styles.receiptRow}>
                  <span className={styles.rcLabel}>Kode Reservasi:</span>
                  <div className={styles.codeGroup}>
                    <span className={styles.codeText}>{successBooking.id}</span>
                    <button 
                      onClick={copyBookingCode} 
                      className={styles.btnCopy}
                      title="Salin Kode"
                    >
                      {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                      <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.receiptDivider} />

                <div className={styles.receiptGrid}>
                  <div>
                    <span className={styles.rcLabel}>Fasilitas</span>
                    <p className={styles.rcVal}>{successBooking.facility}</p>
                  </div>
                  <div>
                    <span className={styles.rcLabel}>Pemohon</span>
                    <p className={styles.rcVal}>{successBooking.user}</p>
                  </div>
                  <div>
                    <span className={styles.rcLabel}>Tanggal</span>
                    <p className={styles.rcVal}>{successBooking.formattedDate}</p>
                  </div>
                  <div>
                    <span className={styles.rcLabel}>Waktu</span>
                    <p className={styles.rcVal}>{successBooking.time}</p>
                  </div>
                </div>
              </div>

              <div className={styles.nextInfo}>
                <Sparkles size={18} color="#059669" />
                <span>Simpan kode reservasi untuk memantau status persetujuan dari Admin Sarpras melalui fitur <strong>Lacak Booking</strong>.</span>
              </div>

              <div className={styles.successActionRow}>
                <button className={styles.btnPrintSlip} onClick={() => setShowSlip(true)}>
                  <Printer size={16} />
                  <span>Cetak Surat Bukti</span>
                </button>
                <button className={styles.btnFinish} onClick={onClose}>
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formContent}>
              {isConflict && (
                <div className={styles.conflictBanner}>
                  <AlertTriangle size={20} className={styles.conflictIcon} />
                  <div>
                    <strong>Jadwal Tidak Tersedia:</strong>
                    <p>Fasilitas ini sudah memiliki jadwal peminjaman pada jam tersebut. Silakan atur waktu atau tanggal lain.</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className={styles.errorBanner}>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className={styles.sectionHeader}>
                <User size={16} />
                <span>Data Pemohon</span>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Nama Lengkap Penanggung Jawab *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Contoh: Budi Santoso / Ibu Ratna"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Peran / Organisasi *</label>
                  <select 
                    className={styles.select}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Siswa / OSIS">OSIS Tri Ratna</option>
                    <option value="Siswa / MPK">MPK Tri Ratna</option>
                    <option value="Siswa (Kelas)">Perwakilan Siswa Kelas</option>
                    <option value="Guru / Tenaga Pengajar">Guru / Pengajar</option>
                    <option value="Ekstrakurikuler">Klub / Ekstrakurikuler</option>
                    <option value="Panitia Khusus">Panitia Acara Khusus</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>No. WhatsApp Aktif (untuk konfirmasi) *</label>
                <div className={styles.inputWithIcon}>
                  <Phone size={16} className={styles.fieldIcon} />
                  <input 
                    type="tel" 
                    className={`${styles.input} ${styles.hasIcon}`}
                    placeholder="Contoh: 0812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: '0.75rem' }}>
                <Calendar size={16} />
                <span>Jadwal Peminjaman</span>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Tanggal Pelaksanaan *</label>
                  <input 
                    type="date" 
                    className={styles.input} 
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Rentang Waktu (Mulai - Selesai) *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="time" 
                      className={styles.input}
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      required 
                    />
                    <span style={{ color: 'var(--text-muted)' }}>s/d</span>
                    <input 
                      type="time" 
                      className={styles.input}
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: '0.75rem' }}>
                <Layers size={16} />
                <span>Fasilitas & Peralatan Tambahan (Opsional)</span>
              </div>

              <div className={styles.equipmentGrid}>
                {COMMON_EQUIPMENT.map((eq) => (
                  <label key={eq} className={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={selectedEquipment.includes(eq)}
                      onChange={() => toggleEquipment(eq)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxText}>{eq}</span>
                  </label>
                ))}
              </div>

              <div className={styles.formGroup} style={{ marginTop: '0.75rem' }}>
                <label>Tujuan & Uraian Kegiatan *</label>
                <textarea 
                  rows="3" 
                  className={styles.textarea} 
                  placeholder="Jelaskan secara jelas keperluan kegiatan, perkiraan jumlah peserta, dan penanggung jawab teknis..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={onClose}>
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                  disabled={isConflict}
                >
                  Kirim Permohonan Reservasi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showSlip && successBooking && (
        <BookingSlip 
          booking={successBooking} 
          onClose={() => setShowSlip(false)} 
        />
      )}
    </>
  );
}
