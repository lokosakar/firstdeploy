"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Users,
  Check,
  Wrench,
  CheckCircle2,
  X,
  Search,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  CalendarCheck,
  Maximize2,
  Edit3,
  Link2,
  Eye,
  Trash2
} from 'lucide-react';
import { useBooking } from '../../lib/BookingContext';
import styles from './fasilitas.module.css';

// Pilihan gambar preset sekolah untuk ganti cepat
const PRESET_IMAGES = [
  { label: 'Mini Auditorium', src: '/images/mini_auditorium.jpg' },
  { label: 'Lab Komputer Mac', src: '/images/mac_computer_lab.jpg' },
  { label: 'Lapangan Olahraga', src: '/images/sports_court.jpg' },
  { label: 'Cetiya Tri Ratna', src: '/images/cetiya_triratna.jpg' },
];

const QUICK_AMENITIES = [
  'Full AC',
  'Proyektor HD',
  'Sound System',
  'Wi-Fi Cepat',
  'Whiteboard',
  'Mic Wireless',
  'Smart TV',
  'CCTV Keamanan'
];

const STORAGE_IMG_KEY = 'triratna_custom_facility_images';
const STORAGE_FIT_KEY = 'triratna_custom_facility_fit';

export default function AdminFasilitas() {
  const { facilities, requests, toggleFacilityStatus, addFacility, updateFacility } = useBooking();

  // State penyimpanan gambar custom & mode fit (cover / contain)
  const [customImages, setCustomImages] = useState({});
  const [imageFitMap, setImageFitMap] = useState({});
  const [toastMsg, setToastMsg] = useState(null);

  // Lightbox (Zoom Foto Layar Penuh)
  const [lightboxData, setLightboxData] = useState(null);

  useEffect(() => {
    try {
      const savedImgs = localStorage.getItem(STORAGE_IMG_KEY);
      if (savedImgs) setCustomImages(JSON.parse(savedImgs));

      const savedFits = localStorage.getItem(STORAGE_FIT_KEY);
      if (savedFits) setImageFitMap(JSON.parse(savedFits));
    } catch (e) {
      console.error('Gagal memuat gambar custom:', e);
    }
  }, []);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => {
      setToastMsg((prev) => (prev === text ? null : prev));
    }, 3200);
  };

  // Optimasi gambar ke HD (Max 1280px) agar tajam tapi muat di localStorage
  const processAndOptimizeImage = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Format file harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        callback(optimizedDataUrl, `${width}×${height}px`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveCustomImage = (facId, imgData, fitMode = 'cover') => {
    setCustomImages((prev) => {
      const updated = { ...prev };
      if (!imgData) {
        delete updated[facId];
      } else {
        updated[facId] = imgData;
      }
      try {
        localStorage.setItem(STORAGE_IMG_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Ukuran gambar terlalu besar untuk localStorage:', err);
      }
      return updated;
    });

    setImageFitMap((prev) => {
      const updatedFit = { ...prev, [facId]: fitMode };
      try {
        localStorage.setItem(STORAGE_FIT_KEY, JSON.stringify(updatedFit));
      } catch (err) {
        console.warn(err);
      }
      return updatedFit;
    });

    if (typeof updateFacility === 'function') {
      updateFacility(facId, { image: imgData });
    }
  };

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modal Tambah / Edit Fasilitas
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingFacId, setEditingFacId] = useState(null);
  const [newFacName, setNewFacName] = useState('');
  const [newFacCategory, setNewFacCategory] = useState('Lab Komputer');
  const [newFacLoc, setNewFacLoc] = useState('');
  const [newFacCap, setNewFacCap] = useState('');
  const [newFacDesc, setNewFacDesc] = useState('');
  const [newFacImage, setNewFacImage] = useState('/images/mini_auditorium.jpg');
  const [newFacImgMeta, setNewFacImgMeta] = useState('Preset Default');
  const [amenityList, setAmenityList] = useState(['Full AC', 'Proyektor HD', 'Sound System']);
  const [amenityInput, setAmenityInput] = useState('');
  const [isDraggingAdd, setIsDraggingAdd] = useState(false);
  const addFileInputRef = useRef(null);

  // Modal Ganti Gambar Khusus
  const [photoModalFac, setPhotoModalFac] = useState(null);
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [tempPhotoMeta, setTempPhotoMeta] = useState('');
  const [tempPhotoFit, setTempPhotoFit] = useState('cover');
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const editFileInputRef = useRef(null);

  // Buka Modal Tambah Baru
  const openCreateModal = () => {
    setEditingFacId(null);
    setNewFacName('');
    setNewFacCategory('Lab Komputer');
    setNewFacLoc('');
    setNewFacCap('');
    setNewFacDesc('');
    setNewFacImage('/images/mini_auditorium.jpg');
    setNewFacImgMeta('Galeri Preset');
    setAmenityList(['Full AC', 'Proyektor HD', 'Sound System']);
    setAddModalOpen(true);
  };

  // Buka Modal Edit Detail Fasilitas
  const openEditFacilityModal = (fac) => {
    const currentImg = customImages[fac.id] || fac.image || '/images/mini_auditorium.jpg';
    const rawCap = fac.capacityNum || parseInt(String(fac.cap).replace(/\D/g, ''), 10) || 40;

    setEditingFacId(fac.id);
    setNewFacName(fac.name);
    setNewFacCategory(fac.category);
    setNewFacLoc(fac.loc);
    setNewFacCap(String(rawCap));
    setNewFacDesc(fac.desc || '');
    setNewFacImage(currentImg);
    setNewFacImgMeta(currentImg.startsWith('data:') ? 'Foto Upload Tersimpan' : 'Gambar Terpasang');
    setAmenityList(fac.amenities || ['Full AC']);
    setAddModalOpen(true);
  };

  // Tambah chip fasilitas di modal
  const handleAddAmenityChip = () => {
    const clean = amenityInput.trim();
    if (!clean || amenityList.includes(clean)) {
      setAmenityInput('');
      return;
    }
    setAmenityList([...amenityList, clean]);
    setAmenityInput('');
  };

  const toggleSuggestedAmenity = (item) => {
    if (amenityList.includes(item)) {
      setAmenityList(amenityList.filter((a) => a !== item));
    } else {
      setAmenityList([...amenityList, item]);
    }
  };

  const handleAddOrEditSubmit = (e) => {
    e.preventDefault();
    if (!newFacName.trim() || !newFacLoc.trim() || !newFacCap.trim()) return;

    const finalImage = newFacImage.trim() || '/images/mini_auditorium.jpg';
    const payload = {
      name: newFacName.trim(),
      category: newFacCategory,
      loc: newFacLoc.trim(),
      cap: `${newFacCap.trim()} Orang`,
      capacityNum: parseInt(newFacCap, 10) || 50,
      desc: newFacDesc.trim() || 'Fasilitas sarana akademik Sekolah Tri Ratna Jakarta.',
      amenities: amenityList.length > 0 ? amenityList : ['Standar Ruangan'],
      image: finalImage,
    };

    if (editingFacId) {
      if (typeof updateFacility === 'function') {
        updateFacility(editingFacId, payload);
      }
      if (finalImage.startsWith('data:') || customImages[editingFacId]) {
        saveCustomImage(editingFacId, finalImage, imageFitMap[editingFacId] || 'cover');
      }
      showToast(`Data "${payload.name}" berhasil diperbarui!`);
    } else {
      addFacility({
        ...payload,
        status: 'Tersedia',
      });
      showToast(`Fasilitas "${payload.name}" berhasil ditambahkan!`);
    }

    setAddModalOpen(false);
  };

  const openPhotoModal = (fac) => {
    const currentImg = customImages[fac.id] || fac.image || '';
    setPhotoModalFac(fac);
    setTempPhotoUrl(currentImg);
    setTempPhotoFit(imageFitMap[fac.id] || 'cover');
    setTempPhotoMeta(
      currentImg.startsWith('data:')
        ? 'Foto Kustom (Tersimpan di Browser)'
        : currentImg
        ? 'Gambar Preset / Path Lokal'
        : 'Belum ada foto'
    );
  };

  const handleSavePhoto = (e) => {
    e.preventDefault();
    if (!photoModalFac) return;
    saveCustomImage(photoModalFac.id, tempPhotoUrl.trim(), tempPhotoFit);
    showToast(`Foto "${photoModalFac.name}" berhasil diperbarui!`);
    setPhotoModalFac(null);
  };

  const handleResetPhoto = () => {
    if (!photoModalFac) return;
    saveCustomImage(photoModalFac.id, null, 'cover');
    showToast(`Foto "${photoModalFac.name}" dikembalikan ke awal.`);
    setPhotoModalFac(null);
  };

  // Drag & Drop Handlers
  const handleDropPhoto = (e, target) => {
    e.preventDefault();
    setIsDraggingEdit(false);
    setIsDraggingAdd(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processAndOptimizeImage(file, (dataUrl, dims) => {
      if (target === 'edit') {
        setTempPhotoUrl(dataUrl);
        setTempPhotoMeta(`Upload HD (${dims})`);
      } else {
        setNewFacImage(dataUrl);
        setNewFacImgMeta(`Upload HD (${dims})`);
      }
    });
  };

  // Daftar kategori unik untuk filter
  const categories = ['Semua', ...Array.from(new Set(facilities.map((f) => f.category)))];

  // Filter fasilitas
  const filteredFacilities = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.loc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || fac.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Semua' || fac.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Statistik KPI
  const totalCount = facilities.length;
  const availableCount = facilities.filter((f) => f.status === 'Tersedia').length;
  const maintCount = facilities.filter((f) => f.status !== 'Tersedia').length;
  const totalBookings = requests.length;

  return (
    <main className={styles.mainContent}>
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className={styles.toastBanner}>
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER HERO BANNER */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.headerBadge}>
            <Sparkles size={13} />
            SEKOLAH TRI RATNA JAKARTA • SARPRAS
          </span>
          <h1>Kelola Fasilitas &amp; Sarana Prasarana</h1>
          <p className={styles.headerSubtitle}>
            Atur status operasional, galeri foto ruangan resolusi tinggi, kapasitas, dan inventaris sekolah.
          </p>
        </div>

        <button className={styles.btnAddFacility} onClick={openCreateModal}>
          <Plus size={18} />
          <span>Tambah Fasilitas Baru</span>
        </button>
      </header>

      {/* SUMMARY KPI CARDS */}
      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
            <Building2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalCount}</span>
            <span className={styles.statLabel}>Total Ruangan &amp; Area</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconAvail}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{availableCount}</span>
            <span className={styles.statLabel}>Siap Digunakan</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconMaint}`}>
            <Wrench size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{maintCount}</span>
            <span className={styles.statLabel}>Sedang Pemeliharaan</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconUsage}`}>
            <CalendarCheck size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalBookings}</span>
            <span className={styles.statLabel}>Total Pengajuan Pinjam</span>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH TOOLBAR */}
      <section className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama ruangan, lab, atau lokasi gedung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={styles.clearSearchBtn}
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.categoryPills}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`${styles.pill} ${selectedCategory === cat ? styles.pillActive : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.statusSelect}
            aria-label="Filter status operasional"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Pemeliharaan">Pemeliharaan</option>
          </select>
        </div>
      </section>

      {/* FACILITIES GRID */}
      {filteredFacilities.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Building2 size={36} />
          </div>
          <h3>Fasilitas tidak ditemukan</h3>
          <p>Coba ubah kata kunci pencarian atau reset filter kategori di atas.</p>
          <button
            type="button"
            className={styles.btnResetFilter}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setSelectedStatus('Semua');
            }}
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredFacilities.map((fac) => {
            const usageCount = requests.filter((r) => r.facility.includes(fac.name)).length;
            const displayImage = customImages[fac.id] || fac.image;
            const hasCustomImage = Boolean(customImages[fac.id]);
            const fitMode = imageFitMap[fac.id] || 'cover';

            return (
              <article key={fac.id} className={styles.facilityCard}>
                {/* IMAGE HEADER */}
                <div className={styles.cardImageWrapper}>
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt={fac.name}
                        className={styles.cardImg}
                        style={{ objectFit: fitMode }}
                        loading="lazy"
                        onClick={() =>
                          setLightboxData({
                            src: displayImage,
                            title: fac.name,
                            loc: fac.loc,
                            cap: fac.cap,
                          })
                        }
                      />
                      <div className={styles.imageOverlay} />
                    </>
                  ) : (
                    <div className={styles.fallbackImg} onClick={() => openPhotoModal(fac)}>
                      <Camera size={36} />
                      <span>Klik untuk tambah foto ruangan</span>
                    </div>
                  )}

                  {/* TOP LEFT BADGE */}
                  {hasCustomImage && (
                    <span className={styles.customImgBadge}>
                      <Sparkles size={11} /> Foto Diperbarui
                    </span>
                  )}

                  {/* TOP RIGHT STATUS CHIP */}
                  <span
                    className={`${styles.statusChip} ${
                      fac.status === 'Tersedia' ? styles.statusAvailable : styles.statusMaintenance
                    }`}
                  >
                    {fac.status === 'Tersedia' ? (
                      <>
                        <CheckCircle2 size={13} />
                        Tersedia
                      </>
                    ) : (
                      <>
                        <Wrench size={13} />
                        Pemeliharaan
                      </>
                    )}
                  </span>

                  {/* FLOATING PHOTO TOOLBAR ON IMAGE */}
                  <div className={styles.photoFloatingBar}>
                    <button
                      type="button"
                      className={styles.changePhotoBtn}
                      onClick={() => openPhotoModal(fac)}
                    >
                      <Camera size={14} />
                      <span>Ganti Foto</span>
                    </button>

                    {displayImage && (
                      <button
                        type="button"
                        className={styles.zoomPhotoBtn}
                        onClick={() =>
                          setLightboxData({
                            src: displayImage,
                            title: fac.name,
                            loc: fac.loc,
                            cap: fac.cap,
                          })
                        }
                        title="Lihat Foto Ukuran Penuh"
                        aria-label="Perbesar Foto"
                      >
                        <Maximize2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* CARD BODY */}
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3>{fac.name}</h3>
                    <span className={styles.categoryBadge}>{fac.category}</span>
                  </div>

                  <div className={styles.metaRow}>
                    <span>
                      <MapPin size={14} /> {fac.loc}
                    </span>
                    <span>
                      <Users size={14} /> {fac.cap}
                    </span>
                  </div>

                  <p className={styles.cardDesc}>{fac.desc}</p>

                  <div className={styles.amenitiesWrap}>
                    {fac.amenities?.map((am, i) => (
                      <span key={i} className={styles.amenityTag}>
                        <Check size={11} className={styles.amenityCheckIcon} /> {am}
                      </span>
                    ))}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.usageText}>
                      Digunakan <strong>{usageCount}×</strong>
                    </span>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => openEditFacilityModal(fac)}
                        title="Edit Detail Ruangan"
                        aria-label="Edit Detail Ruangan"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => openPhotoModal(fac)}
                        title="Atur Foto Ruangan"
                        aria-label="Atur Foto Ruangan"
                      >
                        <ImageIcon size={15} />
                      </button>

                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${
                          fac.status === 'Tersedia' ? styles.btnMaint : styles.btnActive
                        }`}
                        onClick={() => {
                          const nextStatus = fac.status === 'Tersedia' ? 'Pemeliharaan' : 'Tersedia';
                          toggleFacilityStatus(fac.id, nextStatus);
                          showToast(`Status "${fac.name}" diubah ke ${nextStatus}.`);
                        }}
                      >
                        {fac.status === 'Tersedia' ? (
                          <>
                            <Wrench size={13} />
                            <span>Rawat</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ==================== LIGHTBOX: PREVIEW FOTO JERNIH LAYAR PENUH ==================== */}
      {lightboxData && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxData(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxData(null)}
              aria-label="Tutup pratinjau"
            >
              <X size={20} />
            </button>
            <div className={styles.lightboxImgWrap}>
              <img src={lightboxData.src} alt={lightboxData.title} className={styles.lightboxImg} />
            </div>
            <div className={styles.lightboxCaption}>
              <div>
                <h4>{lightboxData.title}</h4>
                <p>
                  {lightboxData.loc} • Kapasitas {lightboxData.cap}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 1: STUDIO GANTI FOTO FASILITAS ==================== */}
      {photoModalFac && (
        <div className={styles.modalOverlay} onClick={() => setPhotoModalFac(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalSubBadge}>STUDIO FOTO SARPRAS</span>
                <h3>Atur Foto — {photoModalFac.name}</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setPhotoModalFac(null)}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className={styles.formBody}>
              {/* PREVIEW BESAR & JERNIH + DRAG & DROP */}
              <div
                className={`${styles.imgStudioBox} ${isDraggingEdit ? styles.imgStudioDragging : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingEdit(true);
                }}
                onDragLeave={() => setIsDraggingEdit(false)}
                onDrop={(e) => handleDropPhoto(e, 'edit')}
              >
                <div className={styles.imgPreviewFrameLarge}>
                  {tempPhotoUrl ? (
                    <>
                      <img
                        src={tempPhotoUrl}
                        alt="Preview"
                        className={styles.imgPreview}
                        style={{ objectFit: tempPhotoFit }}
                      />
                      <div className={styles.previewBadgeBar}>
                        <span className={styles.imgMetaPill}>{tempPhotoMeta || 'Foto Siap Disimpan'}</span>
                        <div className={styles.fitToggleGroup}>
                          <button
                            type="button"
                            className={`${styles.fitBtn} ${tempPhotoFit === 'cover' ? styles.fitBtnActive : ''}`}
                            onClick={() => setTempPhotoFit('cover')}
                            title="Penuhi Bingkai (Cover)"
                          >
                            Penuh
                          </button>
                          <button
                            type="button"
                            className={`${styles.fitBtn} ${tempPhotoFit === 'contain' ? styles.fitBtnActive : ''}`}
                            onClick={() => setTempPhotoFit('contain')}
                            title="Tampilkan Utuh Tanpa Terpotong (Contain)"
                          >
                            Utuh
                          </button>
                          <button
                            type="button"
                            className={styles.fitBtn}
                            onClick={() =>
                              setLightboxData({
                                src: tempPhotoUrl,
                                title: photoModalFac.name,
                                loc: photoModalFac.loc,
                                cap: photoModalFac.cap,
                              })
                            }
                            title="Cek Kejernihan Layar Penuh"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.imgPlaceholder}>
                      <ImageIcon size={38} />
                      <strong>Belum ada gambar dipilih</strong>
                      <span>Tarik &amp; lepas (Drag &amp; Drop) foto ke sini atau klik tombol Upload di bawah</span>
                    </div>
                  )}
                </div>

                {/* TOMBOL UPLOAD & HAPUS */}
                <div className={styles.imgUploadActions}>
                  <button
                    type="button"
                    className={styles.uploadFileBtn}
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>Pilih / Upload Foto dari Perangkat (Auto-HD)</span>
                  </button>

                  {tempPhotoUrl && (
                    <button
                      type="button"
                      className={styles.clearImgBtn}
                      onClick={() => {
                        setTempPhotoUrl('');
                        setTempPhotoMeta('Kosong');
                      }}
                      title="Kosongkan gambar"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.hiddenFileInput}
                    onChange={(e) =>
                      processAndOptimizeImage(e.target.files?.[0], (dataUrl, dims) => {
                        setTempPhotoUrl(dataUrl);
                        setTempPhotoMeta(`Upload HD (${dims})`);
                      })
                    }
                  />
                </div>

                {/* GALERI PRESET SEKOLAH */}
                <div className={styles.presetSection}>
                  <span className={styles.presetLabel}>Galeri Cepat Sekolah Tri Ratna:</span>
                  <div className={styles.presetGrid}>
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.src}
                        type="button"
                        className={`${styles.presetThumbBtn} ${
                          tempPhotoUrl === preset.src ? styles.presetThumbActive : ''
                        }`}
                        onClick={() => {
                          setTempPhotoUrl(preset.src);
                          setTempPhotoMeta(`Preset: ${preset.label}`);
                        }}
                      >
                        <img src={preset.src} alt={preset.label} className={styles.presetThumbImg} />
                        <span className={styles.presetThumbLabel}>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INPUT URL EKSTERNAL */}
              <div className={styles.formGroup}>
                <label>
                  <Link2 size={13} /> Atau Tempel Link URL Gambar / Path Lokal
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="https://... atau /images/nama_ruangan.jpg"
                  value={tempPhotoUrl.startsWith('data:') ? '' : tempPhotoUrl}
                  onChange={(e) => {
                    setTempPhotoUrl(e.target.value);
                    setTempPhotoMeta('URL Eksternal / Path');
                  }}
                />
              </div>

              <div className={styles.modalFooter}>
                {customImages[photoModalFac.id] && (
                  <button type="button" className={styles.btnResetImg} onClick={handleResetPhoto}>
                    <RotateCcw size={14} />
                    <span>Reset ke Foto Awal</span>
                  </button>
                )}

                <div className={styles.modalFooterRight}>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={() => setPhotoModalFac(null)}
                  >
                    Batal
                  </button>
                  <button type="submit" className={styles.btnSubmit}>
                    <Check size={16} />
                    <span>Simpan Foto</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: TAMBAH / EDIT FASILITAS ==================== */}
      {addModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAddModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalSubBadge}>
                  {editingFacId ? 'PERBARUI DATA RUANGAN' : 'REGISTRASI RUANGAN BARU'}
                </span>
                <h3>{editingFacId ? 'Edit Detail & Foto Fasilitas' : 'Tambah Fasilitas Baru'}</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setAddModalOpen(false)}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddOrEditSubmit} className={styles.formBody}>
              {/* UPLOAD / PILIH GAMBAR FASILITAS */}
              <div className={styles.formGroup}>
                <label>Foto Fasilitas (Bisa Drag &amp; Drop atau Pilih Preset)</label>
                <div
                  className={`${styles.imgStudioBox} ${isDraggingAdd ? styles.imgStudioDragging : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingAdd(true);
                  }}
                  onDragLeave={() => setIsDraggingAdd(false)}
                  onDrop={(e) => handleDropPhoto(e, 'add')}
                >
                  <div className={styles.imgPreviewFrame}>
                    {newFacImage ? (
                      <>
                        <img src={newFacImage} alt="Preview" className={styles.imgPreview} />
                        <div className={styles.previewBadgeBar}>
                          <span className={styles.imgMetaPill}>{newFacImgMeta}</span>
                        </div>
                      </>
                    ) : (
                      <div className={styles.imgPlaceholder}>
                        <ImageIcon size={32} />
                        <span>Tarik foto ke sini atau klik tombol Upload di bawah</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.imgUploadActions}>
                    <button
                      type="button"
                      className={styles.uploadFileBtn}
                      onClick={() => addFileInputRef.current?.click()}
                    >
                      <Upload size={15} />
                      <span>Upload Foto dari Komputer / HP</span>
                    </button>
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      className={styles.hiddenFileInput}
                      onChange={(e) =>
                        processAndOptimizeImage(e.target.files?.[0], (dataUrl, dims) => {
                          setNewFacImage(dataUrl);
                          setNewFacImgMeta(`Upload HD (${dims})`);
                        })
                      }
                    />
                  </div>

                  <div className={styles.presetGrid}>
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.src}
                        type="button"
                        className={`${styles.presetThumbBtn} ${
                          newFacImage === preset.src ? styles.presetThumbActive : ''
                        }`}
                        onClick={() => {
                          setNewFacImage(preset.src);
                          setNewFacImgMeta(`Preset: ${preset.label}`);
                        }}
                      >
                        <img src={preset.src} alt={preset.label} className={styles.presetThumbImg} />
                        <span className={styles.presetThumbLabel}>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nama Fasilitas / Ruangan *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Studio Podcast & Multimedia Tri Ratna"
                  value={newFacName}
                  onChange={(e) => setNewFacName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Kategori *</label>
                  <select
                    className={styles.select}
                    value={newFacCategory}
                    onChange={(e) => setNewFacCategory(e.target.value)}
                  >
                    <option value="Lab Komputer">Lab Komputer</option>
                    <option value="Ibadah & Karakter">Ibadah &amp; Karakter</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Ruang Rapat">Ruang Rapat &amp; Seminar</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Kapasitas (Orang) *</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.input}
                    placeholder="Contoh: 50"
                    value={newFacCap}
                    onChange={(e) => setNewFacCap(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Lokasi / Gedung *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Gedung A • Lantai 3"
                  value={newFacLoc}
                  onChange={(e) => setNewFacLoc(e.target.value)}
                  required
                />
              </div>

              {/* INTERACTIVE AMENITY TAGS */}
              <div className={styles.formGroup}>
                <label>Peralatan &amp; Fasilitas Pendukung</label>
                <div className={styles.amenityChipList}>
                  {amenityList.map((item) => (
                    <span key={item} className={styles.amenityChipEdit}>
                      {item}
                      <button
                        type="button"
                        className={styles.amenityChipRemove}
                        onClick={() => setAmenityList(amenityList.filter((a) => a !== item))}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className={styles.amenityAddRow}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ketik nama alat lalu tekan Enter atau klik Tambah..."
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenityChip();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.btnAddAmenity}
                    onClick={handleAddAmenityChip}
                  >
                    + Tambah
                  </button>
                </div>

                <div className={styles.quickSuggestRow}>
                  {QUICK_AMENITIES.map((sug) => {
                    const active = amenityList.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        className={`${styles.suggestChip} ${active ? styles.suggestChipActive : ''}`}
                        onClick={() => toggleSuggestedAmenity(sug)}
                      >
                        {active ? `✓ ${sug}` : `+ ${sug}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Deskripsi &amp; Ketentuan Ruangan</label>
                <textarea
                  rows="2"
                  className={styles.textarea}
                  placeholder="Deskripsikan fungsi dan ketentuan pemakaian ruangan..."
                  value={newFacDesc}
                  onChange={(e) => setNewFacDesc(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.modalFooterRight}>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={() => setAddModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className={styles.btnSubmit}>
                    {editingFacId ? <Check size={16} /> : <Plus size={16} />}
                    <span>{editingFacId ? 'Simpan Perubahan' : 'Simpan Fasilitas'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}