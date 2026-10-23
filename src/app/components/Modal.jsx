"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  X,
  MapPin,
  Users,
  CalendarDays,
  Clock3,
  CircleCheck,
  AlertTriangle,
  Copy,
  Check,
  Phone,
  User,
  Printer,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mic,
  Projector,
  PlugZap,
  Armchair,
  AirVent,
  Wrench,
  Pencil,
  CalendarClock,
  Info,
  Timer,
  FileText,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import { useBooking } from '../lib/BookingContext';
import { useAuth } from '../lib/AuthContext';
import BookingSlip from './BookingSlip';
import styles from './Modal.module.css';

/* ---------- Konstanta ---------- */

const EQUIPMENT = [
  { name: 'Sound System & Mic Wireless', icon: Mic },
  { name: 'Display / Proyektor 4K', icon: Projector },
  { name: 'Kabel Ekstensi / Terminal Listrik', icon: PlugZap },
  { name: 'Kursi Tambahan', icon: Armchair },
  { name: 'AC Tambahan', icon: AirVent },
  { name: 'Bantuan Teknisi Lab', icon: Wrench },
];

const SESSIONS = [
  { id: 'pagi', label: 'Pagi', start: '07:00', end: '10:00' },
  { id: 'siang', label: 'Siang', start: '10:00', end: '13:00' },
  { id: 'sore', label: 'Sore', start: '13:00', end: '16:00' },
  { id: 'ekskul', label: 'Ekskul', start: '15:30', end: '18:00' },
];

const STEPS = [
  { id: 1, label: 'Jadwal', title: 'Kapan ruangnya dipakai?' },
  { id: 2, label: 'Kegiatan', title: 'Ceritakan kegiatannya' },
  { id: 3, label: 'Konfirmasi', title: 'Cek lagi sebelum kirim' },
];

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_LONG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const TL_START = 6 * 60;  // 06:00
const TL_END = 20 * 60;   // 20:00
const TL_TICKS = [6, 8, 10, 12, 14, 16, 18, 20];
const PURPOSE_MAX = 300;

const STATUS_LABEL = { pending: 'Ditinjau', approved: 'Disetujui', rejected: 'Ditolak' };

/* ---------- Helper tanggal & waktu (pakai waktu lokal, bukan UTC) ---------- */

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const longDate = (iso) => {
  if (!iso) return '-';
  const d = fromISO(iso);
  return `${DAY_LONG[d.getDay()]}, ${d.getDate()} ${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

const shortDate = (iso) => {
  if (!iso) return '-';
  const d = fromISO(iso);
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
};

const toMin = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const durationText = (start, end) => {
  const diff = toMin(end) - toMin(start);
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h && m) return `${h} jam ${m} mnt`;
  if (h) return `${h} jam`;
  return `${m} mnt`;
};

const tlPos = (t) => {
  const v = Math.min(Math.max(toMin(t), TL_START), TL_END);
  return ((v - TL_START) / (TL_END - TL_START)) * 100;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/* ====================================================================== */

export default function Modal({ facility, onClose }) {
  const { submitBooking, requests } = useBooking();
  const { currentUser } = useAuth();

  const today = useMemo(() => new Date(), []);
  const todayISO = toISO(today);
  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        return { iso: toISO(d), d };
      }),
    [today]
  );

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState('fwd');

  const [date, setDate] = useState(days[1].iso);
  const [timeStart, setTimeStart] = useState('08:00');
  const [timeEnd, setTimeEnd] = useState('11:00');

  const [picName, setPicName] = useState('');
  const [phone, setPhone] = useState(
    currentUser?.phone && currentUser?.phone !== '-' ? currentUser.phone : ''
  );
  const [participants, setParticipants] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [agree, setAgree] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSlip, setShowSlip] = useState(false);

  // Kunci scroll halaman & tutup dengan Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !showSlip) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, showSlip]);

  /* ---------- Data turunan ---------- */

  const facilityBookings = useMemo(
    () =>
      facility
        ? requests.filter((r) => r.facility === facility.name && r.status !== 'rejected')
        : [],
    [requests, facility]
  );

  const dayBookings = useMemo(
    () =>
      facilityBookings
        .filter((r) => r.date === date)
        .sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || '')),
    [facilityBookings, date]
  );

  const upcoming = useMemo(
    () =>
      facilityBookings
        .filter((r) => r.date >= todayISO)
        .sort((a, b) => `${a.date}${a.timeStart}`.localeCompare(`${b.date}${b.timeStart}`))
        .slice(0, 4),
    [facilityBookings, todayISO]
  );

  const countByDay = useMemo(() => {
    const map = {};
    facilityBookings.forEach((r) => {
      map[r.date] = (map[r.date] || 0) + 1;
    });
    return map;
  }, [facilityBookings]);

  if (!facility) return null;

  const isConflictWith = (s, e) =>
    dayBookings.some((r) =>
      overlaps(toMin(s), toMin(e), toMin(r.timeStart || '00:00'), toMin(r.timeEnd || '23:59'))
    );

  const validTime = timeStart && timeEnd && timeStart < timeEnd;
  const isConflict = validTime && isConflictWith(timeStart, timeEnd);
  const capNum = facility.capacityNum || 0;
  const partNum = Number(participants) || 0;
  const overCapacity = capNum > 0 && partNum > capNum;
  const isAvailable = facility.status === 'Tersedia';

  /* ---------- Aksi ---------- */

  const toggleEquipment = (item) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const pickSession = (s) => {
    setTimeStart(s.start);
    setTimeEnd(s.end);
    setErrorMsg('');
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!date) return 'Pilih tanggal peminjaman dulu.';
      if (date < todayISO) return 'Tanggal sudah lewat. Pilih hari ini atau setelahnya.';
      if (!validTime) return 'Jam mulai harus lebih awal dari jam selesai.';
      if (isConflict) return 'Jam ini bentrok dengan jadwal lain. Geser jam atau pilih tanggal lain.';
    }
    if (s === 2) {
      if (!picName.trim()) return 'Nama PIC / ketua kelas wajib diisi.';
      if (!phone.trim()) return 'Nomor WhatsApp wajib diisi untuk konfirmasi.';
      if (!purpose.trim()) return 'Tulis agenda kegiatannya, ya.';
      if (overCapacity) return `Jumlah peserta melebihi kapasitas ruang (${facility.cap}).`;
    }
    if (s === 3) {
      if (!agree) return 'Centang persetujuan ketentuan dulu sebelum kirim.';
    }
    return '';
  };

  const goTo = (target) => {
    if (target > step) {
      for (let s = step; s < target; s++) {
        const err = validateStep(s);
        if (err) {
          setErrorMsg(err);
          return;
        }
      }
    }
    setErrorMsg('');
    setDir(target > step ? 'fwd' : 'back');
    setStep(target);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!currentUser) return;
    if (step < 3) {
      goTo(step + 1);
      return;
    }

    for (const s of [1, 2, 3]) {
      const err = validateStep(s);
      if (err) {
        setErrorMsg(err);
        if (s < step) {
          setDir('back');
          setStep(s);
        }
        return;
      }
    }

    const result = submitBooking({
      facilityId: facility.id,
      facility: facility.name,
      user: currentUser.name,
      picName: picName.trim(),
      email: currentUser.email || '-',
      classGrade: currentUser.classGrade || (currentUser.role === 'admin' ? 'Sarpras' : 'Siswa'),
      unit: currentUser.unit || 'SMK',
      role:
        currentUser.role === 'admin'
          ? 'Pengurus Sarpras / Guru'
          : `Ketua / PIC Kelas ${currentUser.classGrade || ''}`,
      phone: phone.trim(),
      date,
      timeStart,
      timeEnd,
      purpose: purpose.trim(),
      participants: partNum || null,
      equipment: selectedEquipment,
    });

    if (result.success) {
      setErrorMsg('');
      setSuccessBooking(result.booking);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1F5135', '#C8872B', '#E9C389', '#74C495'],
        });
      } catch {
        // abaikan
      }
    } else {
      setErrorMsg(result.message || 'Gagal mengajukan permohonan.');
    }
  };

  const copyBookingCode = () => {
    if (!successBooking) return;
    navigator.clipboard?.writeText(successBooking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  /* ---------- Render: panel detail (kiri) ---------- */

  const detailPane = (
    <aside className={styles.detailPane}>
      <div className={styles.hero}>
        {facility.image ? (
          <Image
            src={facility.image}
            alt={facility.name}
            fill
            sizes="(max-width: 880px) 100vw, 420px"
            className={styles.heroImg}
            preload
          />
        ) : (
          <div className={styles.heroFallback} />
        )}
        <div className={styles.heroShade} />
        <div className={styles.heroTop}>
          <span className={`${styles.statusChip} ${!isAvailable ? styles.statusChipOff : ''}`}>
            <span className={`pulse-dot ${styles.statusDot}`} />
            {facility.status}
          </span>
        </div>
        <div className={styles.heroBottom}>
          <span className={styles.heroCat}>{facility.category}</span>
          <h2 id="modalTitle" className={styles.heroTitle}>{facility.name}</h2>
          <span className={styles.heroLoc}>
            <MapPin size={13} /> {facility.loc}
          </span>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.statRow}>
          <div className={styles.stat}>
            <Users size={15} />
            <div>
              <strong>{capNum || '-'}</strong>
              <span>kapasitas</span>
            </div>
          </div>
          <div className={styles.stat}>
            <CalendarClock size={15} />
            <div>
              <strong>{upcoming.length}</strong>
              <span>jadwal dekat</span>
            </div>
          </div>
          <div className={styles.stat}>
            <ShieldCheck size={15} />
            <div>
              <strong>H-0</strong>
              <span>bisa diajukan</span>
            </div>
          </div>
        </div>

        <p className={styles.desc}>{facility.desc}</p>

        {facility.amenities?.length > 0 && (
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Yang ada di ruangan</h4>
            <ul className={styles.amenityList}>
              {facility.amenities.map((a) => (
                <li key={a}>
                  <Check size={13} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.block}>
          <h4 className={styles.blockTitle}>Jadwal terdekat</h4>
          {upcoming.length === 0 ? (
            <div className={styles.emptyUpcoming}>
              <Sparkles size={15} />
              <span>Belum ada jadwal mendatang — ruang ini masih kosong.</span>
            </div>
          ) : (
            <ul className={styles.upcomingList}>
              {upcoming.map((r) => {
                const d = fromISO(r.date);
                return (
                  <li key={r.id} className={styles.upcomingItem}>
                    <span className={styles.dateBadge}>
                      <small>{MONTH_SHORT[d.getMonth()]}</small>
                      <strong>{d.getDate()}</strong>
                    </span>
                    <div className={styles.upcomingInfo}>
                      <strong>{r.time}</strong>
                      <span>{r.purpose}</span>
                    </div>
                    <span className={`${styles.miniStatus} ${styles[`mini_${r.status}`]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={styles.rules}>
          <Info size={15} />
          <ul>
            <li>Gunakan sesuai jadwal & kembalikan alat seperti semula.</li>
            <li>Kebersihan ruang tanggung jawab peminjam.</li>
            <li>Sarpras bisa membatalkan untuk agenda sekolah mendesak.</li>
          </ul>
        </div>
      </div>
    </aside>
  );

  /* ---------- Render: gerbang login ---------- */

  const gateView = (
    <div className={styles.gate}>
      <div className={styles.gateIcon}>
        <Lock size={26} />
      </div>
      <span className={styles.gatePill}>
        <ShieldCheck size={13} /> Akun kelas diperlukan
      </span>
      <h3 className={styles.gateTitle}>Masuk dulu untuk meminjam</h3>
      <p className={styles.gateDesc}>
        Supaya tidak ada reservasi fiktif, peminjaman diajukan lewat <strong>akun resmi kelas</strong>{' '}
        (dipegang ketua kelas) atau akun guru/Sarpras. Detail ruang tetap bisa kamu lihat di samping.
      </p>

      <div className={styles.gateGrid}>
        {[
          ['SMK RPL', '10rpl · 11rpl · 12rpl'],
          ['SMK DKV', '10dkv · 11dkv · 12dkv'],
          ['SMK Akuntansi', '10ak · 11ak · 12ak'],
          ['SMA', '10sma · 11sma · 12sma'],
        ].map(([t, ids]) => (
          <div key={t} className={styles.gateCard}>
            <strong>{t}</strong>
            <code>{ids}</code>
          </div>
        ))}
      </div>
      <p className={styles.gateHint}>
        Sandi default: <code>[id]123</code> — contoh <code>11rpl123</code>
      </p>

      <div className={styles.gateActions}>
        <Link href="/login" className={styles.btnPrimary} id="modal-login-btn">
          <span>Masuk akun kelas</span>
          <ArrowRight size={16} />
        </Link>
        <button type="button" onClick={onClose} className={styles.btnGhost}>
          Nanti saja
        </button>
      </div>
    </div>
  );

  /* ---------- Render: sukses ---------- */

  const successView = successBooking && (
    <div className={styles.success}>
      <div className={styles.successBadge}>
        <svg viewBox="0 0 52 52" className={styles.checkSvg} aria-hidden="true">
          <circle cx="26" cy="26" r="24" className={styles.checkCircle} />
          <path d="M15 27 l7 7 l15 -15" className={styles.checkPath} />
        </svg>
      </div>
      <h3 className={styles.successTitle}>Pengajuan terkirim!</h3>
      <p className={styles.successSub}>
        Tim Sarpras akan meninjau. Simpan kode di bawah untuk melacak statusnya.
      </p>

      <div className={styles.ticket}>
        <div className={styles.ticketHead}>
          <div>
            <span className={styles.ticketLabel}>Kode reservasi</span>
            <span className={styles.ticketCode}>{successBooking.id}</span>
          </div>
          <button type="button" onClick={copyBookingCode} className={styles.copyBtn}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
        <div className={styles.ticketCut} aria-hidden="true" />
        <dl className={styles.ticketGrid}>
          <div>
            <dt>Ruang</dt>
            <dd>{successBooking.facility}</dd>
          </div>
          <div>
            <dt>Tanggal</dt>
            <dd>{longDate(successBooking.date)}</dd>
          </div>
          <div>
            <dt>Waktu</dt>
            <dd>{successBooking.time}</dd>
          </div>
          <div>
            <dt>PIC</dt>
            <dd>{successBooking.picName || '-'}</dd>
          </div>
          <div>
            <dt>Akun</dt>
            <dd>{successBooking.user}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`${styles.miniStatus} ${styles.mini_pending}`}>
                <Hourglass size={11} /> Ditinjau
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className={styles.successActions}>
        <button type="button" className={styles.btnGhost} onClick={() => setShowSlip(true)}>
          <Printer size={15} />
          <span>Cetak bukti</span>
        </button>
        <button type="button" className={styles.btnPrimary} onClick={onClose}>
          Selesai
        </button>
      </div>
    </div>
  );

  /* ---------- Render: langkah 1 — jadwal ---------- */

  const step1 = (
    <>
      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <span className={styles.label}>Tanggal</span>
          <label className={styles.otherDate}>
            <CalendarDays size={13} />
            <span>Tanggal lain</span>
            <input
              type="date"
              min={todayISO}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrorMsg('');
              }}
              aria-label="Pilih tanggal lain"
            />
          </label>
        </div>
        <div className={styles.dayStrip} role="listbox" aria-label="Pilih tanggal">
          {days.map(({ iso, d }, i) => {
            const count = countByDay[iso] || 0;
            const active = iso === date;
            return (
              <button
                key={iso}
                type="button"
                role="option"
                aria-selected={active}
                className={`${styles.dayChip} ${active ? styles.dayChipActive : ''} ${d.getDay() === 0 ? styles.daySunday : ''}`}
                onClick={() => {
                  setDate(iso);
                  setErrorMsg('');
                }}
              >
                <span className={styles.dayName}>{i === 0 ? 'Hari ini' : DAY_SHORT[d.getDay()]}</span>
                <span className={styles.dayNum}>{d.getDate()}</span>
                <span className={styles.dayMonth}>{MONTH_SHORT[d.getMonth()]}</span>
                <span className={styles.dayDots} aria-label={`${count} jadwal`}>
                  {count === 0 ? (
                    <i className={styles.dotFree} />
                  ) : (
                    Array.from({ length: Math.min(count, 3) }).map((_, k) => (
                      <i key={k} className={styles.dotBusy} />
                    ))
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <span className={styles.label}>Ketersediaan · {shortDate(date)}</span>
          <span className={styles.legend}>
            <i className={styles.lgBooked} /> Terisi
            <i className={styles.lgPending} /> Ditinjau
            <i className={styles.lgYou} /> Pilihanmu
          </span>
        </div>
        <div className={styles.timeline}>
          <div className={styles.tlTrack}>
            {TL_TICKS.map((h) => (
              <span
                key={h}
                className={styles.tlTick}
                style={{ left: `${((h * 60 - TL_START) / (TL_END - TL_START)) * 100}%` }}
              />
            ))}
            {dayBookings.map((r) => (
              <span
                key={r.id}
                className={`${styles.tlBlock} ${r.status === 'pending' ? styles.tlPending : styles.tlBooked}`}
                style={{
                  left: `${tlPos(r.timeStart)}%`,
                  width: `${Math.max(tlPos(r.timeEnd) - tlPos(r.timeStart), 1)}%`,
                }}
                title={`${r.time} · ${r.purpose}`}
              />
            ))}
            {validTime && (
              <span
                className={`${styles.tlYou} ${isConflict ? styles.tlYouConflict : ''}`}
                style={{
                  left: `${tlPos(timeStart)}%`,
                  width: `${Math.max(tlPos(timeEnd) - tlPos(timeStart), 1)}%`,
                }}
              />
            )}
          </div>
          <div className={styles.tlLabels}>
            {TL_TICKS.map((h) => (
              <span
                key={h}
                style={{ left: `${((h * 60 - TL_START) / (TL_END - TL_START)) * 100}%` }}
              >
                {String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
        {dayBookings.length > 0 && (
          <ul className={styles.dayBookedList}>
            {dayBookings.map((r) => (
              <li key={r.id}>
                <Clock3 size={12} />
                <strong>{r.time}</strong>
                <span>{r.purpose}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Sesi cepat</span>
        <div className={styles.sessionGrid}>
          {SESSIONS.map((s) => {
            const busy = isConflictWith(s.start, s.end);
            const active = timeStart === s.start && timeEnd === s.end;
            return (
              <button
                key={s.id}
                type="button"
                disabled={busy}
                onClick={() => pickSession(s)}
                className={`${styles.session} ${active ? styles.sessionActive : ''} ${busy ? styles.sessionBusy : ''}`}
              >
                <span className={styles.sessionName}>{s.label}</span>
                <span className={styles.sessionTime}>
                  {s.start}–{s.end}
                </span>
                <span className={styles.sessionState}>{busy ? 'Terisi' : active ? 'Dipilih' : 'Kosong'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Atau atur sendiri</span>
        <div className={styles.timeRow}>
          <label className={styles.timeBox}>
            <small>Mulai</small>
            <input
              type="time"
              value={timeStart}
              onChange={(e) => {
                setTimeStart(e.target.value);
                setErrorMsg('');
              }}
              className={styles.timeInput}
              id="booking-time-start"
            />
          </label>
          <ArrowRight size={16} className={styles.timeArrow} />
          <label className={styles.timeBox}>
            <small>Selesai</small>
            <input
              type="time"
              value={timeEnd}
              onChange={(e) => {
                setTimeEnd(e.target.value);
                setErrorMsg('');
              }}
              className={styles.timeInput}
              id="booking-time-end"
            />
          </label>
          <span className={styles.durationPill}>
            <Timer size={13} />
            {durationText(timeStart, timeEnd)}
          </span>
        </div>
      </div>

      {validTime &&
        (isConflict ? (
          <div className={`${styles.availBanner} ${styles.availBad}`}>
            <AlertTriangle size={16} />
            <span>Bentrok dengan jadwal lain di jam ini. Coba geser jamnya.</span>
          </div>
        ) : (
          <div className={`${styles.availBanner} ${styles.availGood}`}>
            <CircleCheck size={16} />
            <span>
              Ruang kosong — <strong>{shortDate(date)}</strong>, {timeStart}–{timeEnd}
            </span>
          </div>
        ))}
    </>
  );

  /* ---------- Render: langkah 2 — kegiatan ---------- */

  const capPct = capNum ? Math.min((partNum / capNum) * 100, 100) : 0;

  const step2 = (
    <>
      <div className={styles.accountCard}>
        <span className={styles.accountAvatar}>
          {(currentUser?.classGrade && currentUser.classGrade !== '-'
            ? currentUser.classGrade
            : currentUser?.name || '?'
          )
            .replace(/\s+/g, '')
            .slice(0, 4)
            .toUpperCase()}
        </span>
        <div className={styles.accountInfo}>
          <strong>{currentUser?.name}</strong>
          <span>
            {currentUser?.email} · {currentUser?.unit || 'SMK'}
          </span>
        </div>
        <span className={styles.verifiedTag}>
          <ShieldCheck size={12} /> Terverifikasi
        </span>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="booking-pic">
            Nama PIC / ketua kelas
          </label>
          <div className={styles.inputWrap}>
            <User size={15} className={styles.inputIcon} />
            <input
              id="booking-pic"
              type="text"
              className={styles.input}
              placeholder="mis. Budi Santoso"
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="booking-phone">
            WhatsApp aktif
          </label>
          <div className={styles.inputWrap}>
            <Phone size={15} className={styles.inputIcon} />
            <input
              id="booking-phone"
              type="tel"
              className={styles.input}
              placeholder="0812-3456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <label className={styles.label} htmlFor="booking-participants">
            Perkiraan peserta
          </label>
          <span className={`${styles.capText} ${overCapacity ? styles.capOver : ''}`}>
            {partNum || 0} / {capNum || '-'} orang
          </span>
        </div>
        <div className={styles.inputWrap}>
          <Users size={15} className={styles.inputIcon} />
          <input
            id="booking-participants"
            type="number"
            min="1"
            max={capNum || undefined}
            className={styles.input}
            placeholder={`maks. ${capNum || '-'}`}
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
        </div>
        <div className={styles.capBar}>
          <span
            className={`${styles.capFill} ${overCapacity ? styles.capFillOver : capPct > 80 ? styles.capFillWarn : ''}`}
            style={{ width: `${overCapacity ? 100 : capPct}%` }}
          />
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <label className={styles.label} htmlFor="booking-purpose">
            Agenda kegiatan
          </label>
          <span className={styles.counter}>
            {purpose.length}/{PURPOSE_MAX}
          </span>
        </div>
        <textarea
          id="booking-purpose"
          rows={3}
          maxLength={PURPOSE_MAX}
          className={styles.textarea}
          placeholder="mis. Latihan presentasi project akhir kelas 12 RPL bersama guru pembimbing."
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <span className={styles.label}>Alat tambahan</span>
          <span className={styles.counter}>{selectedEquipment.length} dipilih · opsional</span>
        </div>
        <div className={styles.equipGrid}>
          {EQUIPMENT.map(({ name, icon: Icon }) => {
            const on = selectedEquipment.includes(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => toggleEquipment(name)}
                className={`${styles.equip} ${on ? styles.equipOn : ''}`}
              >
                <span className={styles.equipIcon}>
                  <Icon size={16} />
                </span>
                <span className={styles.equipName}>{name}</span>
                <span className={styles.equipCheck}>
                  <Check size={11} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  /* ---------- Render: langkah 3 — konfirmasi ---------- */

  const step3 = (
    <>
      <div className={styles.review}>
        <div className={styles.reviewHead}>
          {facility.image && (
            <span className={styles.reviewThumb}>
              <Image src={facility.image} alt="" fill sizes="64px" />
            </span>
          )}
          <div>
            <span className={styles.reviewCat}>{facility.category}</span>
            <strong className={styles.reviewName}>{facility.name}</strong>
            <span className={styles.reviewLoc}>{facility.loc}</span>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.reviewSectionHead}>
            <span>
              <CalendarDays size={14} /> Jadwal
            </span>
            <button type="button" onClick={() => goTo(1)} className={styles.editBtn}>
              <Pencil size={12} /> Ubah
            </button>
          </div>
          <div className={styles.reviewBig}>
            <strong>{longDate(date)}</strong>
            <span>
              {timeStart} – {timeEnd} · {durationText(timeStart, timeEnd)}
            </span>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.reviewSectionHead}>
            <span>
              <FileText size={14} /> Kegiatan
            </span>
            <button type="button" onClick={() => goTo(2)} className={styles.editBtn}>
              <Pencil size={12} /> Ubah
            </button>
          </div>
          <dl className={styles.reviewGrid}>
            <div>
              <dt>PIC</dt>
              <dd>{picName || '-'}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{phone || '-'}</dd>
            </div>
            <div>
              <dt>Peserta</dt>
              <dd>{partNum ? `${partNum} orang` : '-'}</dd>
            </div>
            <div>
              <dt>Akun</dt>
              <dd>{currentUser?.name}</dd>
            </div>
          </dl>
          <p className={styles.reviewPurpose}>&ldquo;{purpose || '-'}&rdquo;</p>
          {selectedEquipment.length > 0 && (
            <div className={styles.reviewEquip}>
              {selectedEquipment.map((eq) => (
                <span key={eq}>{eq}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className={`${styles.agree} ${agree ? styles.agreeOn : ''}`}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => {
            setAgree(e.target.checked);
            setErrorMsg('');
          }}
          id="booking-agree"
        />
        <span className={styles.agreeBox}>
          <Check size={12} />
        </span>
        <span>
          Saya bertanggung jawab atas kebersihan ruang & alat selama dipakai, dan data di atas sudah benar.
        </span>
      </label>
    </>
  );

  /* ---------- Render: wizard ---------- */

  const wizard = (
    <form onSubmit={handleSubmit} className={styles.wizard} noValidate>
      <header className={styles.wizHead}>
        <ol className={styles.stepper}>
          {STEPS.map((s) => {
            const state = s.id < step ? 'done' : s.id === step ? 'current' : 'todo';
            return (
              <li key={s.id} className={`${styles.stepItem} ${styles[`step_${state}`]}`}>
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  className={styles.stepBtn}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  <span className={styles.stepNum}>
                    {state === 'done' ? <Check size={13} /> : s.id}
                  </span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className={styles.stepBar}>
          <span style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
        <h3 className={styles.wizTitle} key={`t-${step}`}>
          {STEPS[step - 1].title}
        </h3>
      </header>

      <div className={styles.wizBody}>
        {!isAvailable && (
          <div className={`${styles.availBanner} ${styles.availWarn}`}>
            <AlertTriangle size={16} />
            <span>
              Status ruang saat ini <strong>{facility.status}</strong>. Pengajuan tetap bisa dikirim, tapi
              mungkin ditolak.
            </span>
          </div>
        )}
        <div key={step} className={`${styles.stepPane} ${dir === 'back' ? styles.stepPaneBack : ''}`}>
          {step === 1 && step1}
          {step === 2 && step2}
          {step === 3 && step3}
        </div>
      </div>

      {errorMsg && (
        <div className={styles.errorBar} role="alert">
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      <footer className={styles.wizFoot}>
        <div className={styles.footSummary}>
          <span>
            <CalendarDays size={13} /> {shortDate(date)}
          </span>
          <span>
            <Clock3 size={13} /> {validTime ? `${timeStart}–${timeEnd}` : '—'}
          </span>
        </div>
        <div className={styles.footActions}>
          {step > 1 ? (
            <button type="button" className={styles.btnGhost} onClick={() => goTo(step - 1)}>
              <ArrowLeft size={15} />
              <span>Kembali</span>
            </button>
          ) : (
            <button type="button" className={styles.btnGhost} onClick={onClose}>
              Batal
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => goTo(step + 1)}
              id={`booking-next-${step}`}
            >
              <span>Lanjut</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button type="submit" className={styles.btnPrimary} id="booking-submit" disabled={!agree}>
              <span>Kirim pengajuan</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </footer>
    </form>
  );

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.card}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
        >
          <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup" type="button">
            <X size={18} />
          </button>

          {detailPane}

          <section className={styles.bookPane}>
            {!currentUser ? gateView : successBooking ? successView : wizard}
          </section>
        </div>
      </div>

      {showSlip && successBooking && (
        <BookingSlip booking={successBooking} onClose={() => setShowSlip(false)} />
      )}
    </>
  );
}
