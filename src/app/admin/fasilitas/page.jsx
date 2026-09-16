"use client";

import { useState } from 'react';
import Image from 'next/image';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  Check, 
  Wrench, 
  CheckCircle2, 
  X, 
  Layers, 
  Sparkles,
  Sliders
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useBooking } from '../../lib/BookingContext';
import styles from './fasilitas.module.css';

export default function AdminFasilitas() {
  const { facilities, requests, toggleFacilityStatus, addFacility } = useBooking();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newFacName, setNewFacName] = useState('');
  const [newFacCategory, setNewFacCategory] = useState('Lab Komputer');
  const [newFacLoc, setNewFacLoc] = useState('');
  const [newFacCap, setNewFacCap] = useState('');
  const [newFacDesc, setNewFacDesc] = useState('');
  const [newFacAmenities, setNewFacAmenities] = useState('Full AC, Proyektor, Sound System');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFacName.trim() || !newFacLoc.trim() || !newFacCap.trim()) return;

    addFacility({
      name: newFacName.trim(),
      category: newFacCategory,
      loc: newFacLoc.trim(),
      cap: `${newFacCap.trim()} Orang`,
      capacityNum: parseInt(newFacCap) || 50,
      desc: newFacDesc.trim() || "Fasilitas sarana akademik SMK Tri Ratna.",
      amenities: newFacAmenities.split(',').map(s => s.trim()).filter(Boolean),
      status: "Tersedia"
    });

    setAddModalOpen(false);
    setNewFacName('');
    setNewFacLoc('');
    setNewFacCap('');
    setNewFacDesc('');
  };

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.mainContent}>
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <span className={styles.headerBadge}>MASTER DATA SARPRAS</span>
            <h1>Kelola Fasilitas & Sarana Prasarana</h1>
            <p className={styles.headerSubtitle}>
              Atur status operasional, kapasitas, dan inventaris fasilitas SMK Tri Ratna.
            </p>
          </div>

          <button 
            className={styles.btnAddFacility} 
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>Tambah Fasilitas Baru</span>
          </button>
        </header>

        {/* FACILITIES GRID */}
        <div className={styles.grid}>
          {facilities.map((fac) => {
            const usageCount = requests.filter(r => r.facility.includes(fac.name)).length;

            return (
              <article key={fac.id} className={styles.facilityCard}>
                <div className={styles.cardImageWrapper}>
                  {fac.image ? (
                    <Image 
                      src={fac.image} 
                      alt={fac.name} 
                      fill 
                      className={styles.cardImg}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className={styles.fallbackImg}>
                      <Building2 size={40} color="var(--text-light)" />
                    </div>
                  )}

                  <span className={`${styles.statusChip} ${fac.status === 'Tersedia' ? styles.statusAvailable : styles.statusMaintenance}`}>
                    {fac.status === 'Tersedia' ? (
                      <>
                        <CheckCircle2 size={13} />
                        Operasional Tersedia
                      </>
                    ) : (
                      <>
                        <Wrench size={13} />
                        Sedang Pemeliharaan
                      </>
                    )}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3>{fac.name}</h3>
                    <span className={styles.categoryBadge}>{fac.category}</span>
                  </div>

                  <div className={styles.metaRow}>
                    <span><MapPin size={14} /> {fac.loc}</span>
                    <span><Users size={14} /> {fac.cap}</span>
                  </div>

                  <p className={styles.cardDesc}>{fac.desc}</p>

                  <div className={styles.amenitiesWrap}>
                    {fac.amenities?.map((am, i) => (
                      <span key={i} className={styles.amenityTag}>
                        <Check size={11} color="#059669" /> {am}
                      </span>
                    ))}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.usageText}>
                      Telah dipesan <strong>{usageCount} kali</strong>
                    </span>

                    <button 
                      className={`${styles.toggleBtn} ${fac.status === 'Tersedia' ? styles.btnMaint : styles.btnActive}`}
                      onClick={() => toggleFacilityStatus(fac.id, fac.status === 'Tersedia' ? 'Pemeliharaan' : 'Tersedia')}
                    >
                      {fac.status === 'Tersedia' ? (
                        <>
                          <Wrench size={14} />
                          Set Pemeliharaan
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          Aktifkan Kembali
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* ADD FACILITY MODAL */}
      {addModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAddModalOpen(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Tambah Fasilitas Baru</h3>
              <button className={styles.closeBtn} onClick={() => setAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className={styles.formBody}>
              <div className={styles.formGroup}>
                <label>Nama Fasilitas / Ruangan *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Contoh: Studio Podcast & Radio Sekolah"
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
                    <option value="Ibadah & Karakter">Ibadah & Karakter</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Ruang Rapat">Ruang Rapat & Seminar</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Kapasitas Orang *</label>
                  <input 
                    type="number" 
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
                  placeholder="Contoh: Gedung B • Lt. 3"
                  value={newFacLoc}
                  onChange={(e) => setNewFacLoc(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Peralatan & Fasilitas (pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Contoh: Full AC, 4 Mic Condenser, Soundproof"
                  value={newFacAmenities}
                  onChange={(e) => setNewFacAmenities(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Deskripsi Ruangan</label>
                <textarea 
                  rows="3" 
                  className={styles.textarea} 
                  placeholder="Deskripsikan fungsi dan ketentuan pemakaian ruangan..."
                  value={newFacDesc}
                  onChange={(e) => setNewFacDesc(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Simpan Fasilitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
