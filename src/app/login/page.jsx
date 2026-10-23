"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
  AlertCircle,
  ArrowRight,
  Zap,
  ChevronDown,
  Check,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth, PRESET_ADMINS, OFFICIAL_CLASS_ACCOUNTS } from '../lib/AuthContext';
import styles from './login.module.css';

// Grup akun untuk dropdown "isi otomatis"
const ACCOUNT_GROUPS = [
  { label: 'SMK — RPL', filter: (a) => a.major === 'RPL' },
  { label: 'SMK — DKV', filter: (a) => a.major === 'DKV' },
  { label: 'SMK — Akuntansi', filter: (a) => a.major === 'Akuntansi' },
  { label: 'SMA', filter: (a) => a.unit === 'SMA' },
];

const ALL_QUICK_ACCOUNTS = [...OFFICIAL_CLASS_ACCOUNTS, ...PRESET_ADMINS];

// Slide foto + tema warna dinamis (accent untuk teks/progress, btnColor untuk tombol form)
const SLIDE_DURATION = 6000;
const SLIDES = [
  {
    src: '/images/mini_auditorium.jpg',
    tag: 'Ruang Presentasi & Acara',
    line1: 'Satu akun per kelas.',
    line2: 'Jadwal ruang jadi rapi.',
    place: 'Mini Auditorium · Gedung C',
    accent: '#E9C389',
    btnColor: '#9C6B28',
    glow: 'rgba(233, 195, 137, 0.22)',
  },
  {
    src: '/images/mac_computer_lab.jpg',
    tag: 'Fasilitas Praktik Kreatif',
    line1: 'Praktik desain & coding,',
    line2: 'tanpa rebutan lab.',
    place: 'Lab Komputer Mac · Gedung B',
    accent: '#7CC6FE',
    btnColor: '#1E6091',
    glow: 'rgba(124, 198, 254, 0.22)',
  },
  {
    src: '/images/sports_court.jpg',
    tag: 'Area Olahraga & Ekskul',
    line1: 'Sparring, PJOK, upacara —',
    line2: 'semua tercatat.',
    place: 'Lapangan Serbaguna · Outdoor',
    accent: '#6EE7B7',
    btnColor: '#1F5135',
    glow: 'rgba(110, 231, 183, 0.22)',
  },
  {
    src: '/images/cetiya_triratna.jpg',
    tag: 'Sarana Ibadah & Pembinaan',
    line1: 'Kebaktian & meditasi,',
    line2: 'di waktu yang tepat.',
    place: 'Cetiya Tri Ratna · Gedung A',
    accent: '#F4A261',
    btnColor: '#B5531A',
    glow: 'rgba(244, 162, 97, 0.22)',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, registerSiswa, theme, toggleTheme } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [quickId, setQuickId] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const quickRef = useRef(null);

  // Slideshow
  const [slideState, setSlideState] = useState({ cur: 0, prev: -1 });
  const slide = slideState.cur;
  const currentSlideData = SLIDES[slide];
  const [slidePaused, setSlidePaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const goToSlide = (i) =>
    setSlideState((s) => (s.cur === i ? s : { cur: i, prev: s.cur }));
  const nextSlide = () =>
    setSlideState((s) => ({ cur: (s.cur + 1) % SLIDES.length, prev: s.cur }));
  const prevSlide = () =>
    setSlideState((s) => ({
      cur: (s.cur - 1 + SLIDES.length) % SLIDES.length,
      prev: s.cur,
    }));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!reducedMotion || slidePaused) return;
    const t = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [reducedMotion, slidePaused]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickRef.current && !quickRef.current.contains(e.target)) {
        setQuickOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setQuickOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register (akun tambahan: OSIS, panitia, eskul)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regUnit, setRegUnit] = useState('SMK');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const result = login(loginIdentifier, loginPass);
    setIsSubmitting(false);

    if (result.success) {
      router.push(result.user.role === 'admin' ? '/admin/dashboard' : '/user/booking');
    } else {
      setLoginError(result.error || 'Gagal masuk. Cek lagi ID dan kata sandi.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (regPass !== regConfirmPass) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (regPass.length < 6) {
      setRegError('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    const result = registerSiswa({
      name: regName,
      email: regEmail,
      password: regPass,
      classGrade: regClass,
      unit: regUnit,
      phone: regPhone,
    });
    setIsSubmitting(false);

    if (result.success) {
      router.push('/user/booking');
    } else {
      setRegError(result.error || 'Gagal mendaftarkan akun.');
    }
  };

  const handleQuickSelect = (id) => {
    setQuickId(id);
    const acc = ALL_QUICK_ACCOUNTS.find((a) => a.id === id);
    if (!acc) return;
    setLoginIdentifier(acc.username);
    setLoginPass(acc.password);
    setLoginError('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setLoginError('');
    setRegError('');
    setQuickOpen(false);
  };

  const selectedAcc = ALL_QUICK_ACCOUNTS.find((a) => a.id === quickId);

  const matchesSearch = (acc) => {
    if (!quickSearch.trim()) return true;
    const q = quickSearch.toLowerCase();
    const label = (acc.classGrade || acc.roleLabel || '').toLowerCase();
    const user = (acc.username || '').toLowerCase();
    return label.includes(q) || user.includes(q);
  };

  const filteredGroups = ACCOUNT_GROUPS.map((g) => ({
    ...g,
    items: OFFICIAL_CLASS_ACCOUNTS.filter(g.filter).filter(matchesSearch),
  })).filter((g) => g.items.length > 0);

  const filteredAdmins = PRESET_ADMINS.filter(matchesSearch);
  const hasSearchResults = filteredGroups.length > 0 || filteredAdmins.length > 0;

  return (
    <div
      className={styles.viewport}
      style={{
        '--slide-accent': currentSlideData.accent,
        '--slide-btn': currentSlideData.btnColor,
        '--slide-glow': currentSlideData.glow,
      }}
    >
      {/* Cahaya ambient di latar belakang card */}
      <div className={styles.ambientOrb} aria-hidden="true" />

      {/* WRAPPER TWIN CARD (Kiri & Kanan Setara) */}
      <div className={styles.cardShell}>
        {/* PANEL KIRI: FOTO FASILITAS */}
        <aside
          className={`${styles.visual} ${slidePaused ? styles.visualPaused : ''}`}
          aria-roledescription="carousel"
          aria-label="Foto fasilitas sekolah"
          onMouseEnter={() => setSlidePaused(true)}
          onMouseLeave={() => setSlidePaused(false)}
        >
          <div className={styles.slides}>
            {SLIDES.map((s, i) => (
              <div
                key={s.src}
                className={`${styles.slide} ${i === slide ? styles.slideActive : ''} ${
                  i === slideState.prev ? styles.slidePrev : ''
                }`}
                aria-hidden={i !== slide}
              >
                <Image
                  src={s.src}
                  alt={s.place}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 860px) 100vw, 480px"
                  className={styles.visualImg}
                />
              </div>
            ))}
          </div>
          <div className={styles.visualShade} />

          <div className={styles.visualTop}>
            <span className={styles.mark}>TR</span>
            <span className={styles.visualBrand}>Sarpras SMK Tri Ratna</span>
            <span className={styles.slideCounter}>
              {String(slide + 1).padStart(2, '0')}
              <span>/ {String(SLIDES.length).padStart(2, '0')}</span>
            </span>
          </div>

          <div className={styles.visualBottom}>
            <div key={`tag-${slide}`} className={styles.tagBadge}>
              <span className={styles.tagDot} />
              <span>{currentSlideData.tag}</span>
            </div>

            <p className={styles.quote} key={`q-${slide}`} aria-live="polite">
              <span className={styles.quoteLine}>{currentSlideData.line1}</span>
              <br />
              <em className={styles.quoteLine}>{currentSlideData.line2}</em>
            </p>

            <div className={styles.progress}>
              {SLIDES.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  className={`${styles.progressSeg} ${i < slide ? styles.progressDone : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Tampilkan foto ${i + 1}: ${s.place}`}
                  aria-current={i === slide}
                >
                  {i === slide && (
                    <span
                      key={`fill-${slide}`}
                      className={styles.progressFill}
                      style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                      onAnimationEnd={() => !reducedMotion && nextSlide()}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className={styles.visualMeta}>
              <span key={`p-${slide}`} className={styles.metaPlace}>
                {currentSlideData.place}
              </span>

              <div className={styles.slideNav}>
                <button
                  type="button"
                  onClick={prevSlide}
                  className={styles.navArrow}
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className={styles.navArrow}
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL KANAN: FORM LOGIN / REGISTER */}
        <main className={styles.formSide}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.backBtn}>
              <ArrowLeft size={15} />
              <span>Beranda</span>
            </Link>

            <button
              onClick={toggleTheme}
              className={styles.themeBtn}
              title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              aria-label="Ganti tema"
              type="button"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          <div className={styles.formBox}>
            <header className={styles.formHead}>
              <h1>{activeTab === 'login' ? 'Selamat datang' : 'Buat akun baru'}</h1>
              <p>
                {activeTab === 'login'
                  ? 'Masuk dengan akun kelas atau akun Sarpras.'
                  : 'Khusus OSIS, ekskul, atau kepanitiaan.'}
              </p>
            </header>

            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                id="tab-login"
                aria-selected={activeTab === 'login'}
                className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
                onClick={() => switchTab('login')}
              >
                Masuk
              </button>
              <button
                type="button"
                role="tab"
                id="tab-register"
                aria-selected={activeTab === 'register'}
                className={`${styles.tab} ${activeTab === 'register' ? styles.tabActive : ''}`}
                onClick={() => switchTab('register')}
              >
                Daftar
              </button>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className={styles.form}>
                <div className={styles.quickContainer} ref={quickRef}>
                  <button
                    type="button"
                    id="quick-account-btn"
                    className={`${styles.quickTrigger} ${quickOpen ? styles.quickTriggerOpen : ''}`}
                    onClick={() => setQuickOpen(!quickOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={quickOpen}
                  >
                    <Zap size={14} className={styles.quickIcon} />
                    <span className={styles.quickLabel}>
                      {selectedAcc
                        ? `${selectedAcc.classGrade || selectedAcc.roleLabel} — ${selectedAcc.username}`
                        : 'Isi otomatis dengan akun kelas…'}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`${styles.quickChevron} ${quickOpen ? styles.quickChevronRotate : ''}`}
                    />
                  </button>

                  {quickOpen && (
                    <div className={styles.quickMenu} role="listbox" aria-labelledby="quick-account-btn">
                      <div className={styles.quickSearchWrap}>
                        <Search size={13} />
                        <input
                          type="text"
                          placeholder="Cari kelas atau admin (mis. 11 RPL)..."
                          value={quickSearch}
                          onChange={(e) => setQuickSearch(e.target.value)}
                          className={styles.quickSearchInput}
                          autoFocus
                        />
                      </div>

                      <div className={styles.quickScrollArea}>
                        {!hasSearchResults && (
                          <div className={styles.quickEmpty}>
                            Akun &ldquo;{quickSearch}&rdquo; tidak ditemukan.
                          </div>
                        )}

                        {filteredGroups.map((g) => (
                          <div key={g.label} className={styles.quickGroup}>
                            <span className={styles.quickGroupLabel}>{g.label}</span>
                            <div className={styles.quickGroupItems}>
                              {g.items.map((acc) => (
                                <button
                                  key={acc.id}
                                  type="button"
                                  className={`${styles.quickItem} ${
                                    quickId === acc.id ? styles.quickItemActive : ''
                                  }`}
                                  onClick={() => {
                                    handleQuickSelect(acc.id);
                                    setQuickOpen(false);
                                    setQuickSearch('');
                                  }}
                                >
                                  <span className={styles.quickItemName}>{acc.classGrade}</span>
                                  <span className={styles.quickItemId}>{acc.username}</span>
                                  {quickId === acc.id && (
                                    <Check size={13} className={styles.quickItemCheck} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {filteredAdmins.length > 0 && (
                          <div className={styles.quickGroup}>
                            <span className={styles.quickGroupLabel}>Admin &amp; Guru</span>
                            <div className={styles.quickGroupItems}>
                              {filteredAdmins.map((acc) => (
                                <button
                                  key={acc.id}
                                  type="button"
                                  className={`${styles.quickItem} ${
                                    quickId === acc.id ? styles.quickItemActive : ''
                                  }`}
                                  onClick={() => {
                                    handleQuickSelect(acc.id);
                                    setQuickOpen(false);
                                    setQuickSearch('');
                                  }}
                                >
                                  <span className={styles.quickItemName}>{acc.roleLabel}</span>
                                  <span className={styles.quickItemId}>{acc.username}</span>
                                  {quickId === acc.id && (
                                    <Check size={13} className={styles.quickItemCheck} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="login-id">Email atau ID kelas</label>
                  <input
                    id="login-id"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="mis. 11rpl"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      setQuickId('');
                    }}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="login-pass">Kata sandi</label>
                  <div className={styles.passWrap}>
                    <input
                      id="login-pass"
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      aria-label={showLoginPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className={styles.error} role="alert">
                    <AlertCircle size={15} />
                    <span>{loginError}</span>
                  </div>
                )}

                <button type="submit" id="login-submit" disabled={isSubmitting} className={styles.submit}>
                  <span>{isSubmitting ? 'Memproses…' : 'Masuk'}</span>
                  <ArrowRight size={16} />
                </button>

                <p className={styles.footnote}>
                  Akun kelas dipegang ketua kelas / PIC. Lupa sandi? Hubungi ruang Sarpras.
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className={styles.form}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="reg-name">Nama akun</label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="Panitia Pensi"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="reg-phone">WhatsApp</label>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="0812…"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="reg-email">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="osis@smktri-ratna.sch.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="reg-unit">Unit</label>
                    <select
                      id="reg-unit"
                      value={regUnit}
                      onChange={(e) => setRegUnit(e.target.value)}
                      className={styles.input}
                    >
                      <option value="SMK">SMK</option>
                      <option value="SMA">SMA</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="reg-class">Kelas / divisi</label>
                    <input
                      id="reg-class"
                      type="text"
                      placeholder="11 RPL / OSIS"
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="reg-pass">Kata sandi</label>
                    <input
                      id="reg-pass"
                      type={showRegPass ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 karakter"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="reg-pass2">Ulangi</label>
                    <div className={styles.passWrap}>
                      <input
                        id="reg-pass2"
                        type={showRegPass ? 'text' : 'password'}
                        required
                        placeholder="Ketik ulang"
                        value={regConfirmPass}
                        onChange={(e) => setRegConfirmPass(e.target.value)}
                        className={styles.input}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowRegPass(!showRegPass)}
                        aria-label={showRegPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      >
                        {showRegPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {regError && (
                  <div className={styles.error} role="alert">
                    <AlertCircle size={15} />
                    <span>{regError}</span>
                  </div>
                )}

                <button type="submit" id="register-submit" disabled={isSubmitting} className={styles.submit}>
                  <span>{isSubmitting ? 'Mendaftarkan…' : 'Daftar & masuk'}</span>
                  <ArrowRight size={16} />
                </button>

                <p className={styles.footnote}>
                  Akun kelas 10–12 (RPL, DKV, AK, SMA) sudah tersedia — tidak perlu daftar.
                </p>
              </form>
            )}
          </div>

          <p className={styles.copyright}>© {new Date().getFullYear()} SMK Tri Ratna · Divisi Sarpras</p>
        </main>
      </div>
    </div>
  );
}