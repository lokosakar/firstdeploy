"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const INITIAL_FACILITIES = [
  {
    id: 1,
    name: "Cetiya Tri Ratna",
    category: "Ibadah & Karakter",
    loc: "Gedung A • Lt. 3",
    cap: "120 Orang",
    capacityNum: 120,
    status: "Tersedia",
    image: "/images/cetiya_triratna.jpg",
    desc: "Ruang ibadah kebaktian siswa, meditasi hening, dan pembinaan karakter moral berkarpet mewah dengan altar megah.",
    amenities: ["Karpet Nyaman", "Sound System 3000W", "Full AC", "Altar Buddhis", "Mimbar Ceramah"],
    colorTheme: "from-amber-600 to-emerald-700",
    bgColor: "#FEF3C7",
    textColor: "#92400E",
    iconName: "Flame"
  },
  {
    id: 2,
    name: "Lab Komputer Mac & Multimedia",
    category: "Lab Komputer",
    loc: "Gedung B • Lt. 2",
    cap: "40 iMac Workstations",
    capacityNum: 40,
    status: "Tersedia",
    image: "/images/mac_computer_lab.jpg",
    desc: "Pusat praktikum desain grafis, editing video 4K, rekayasa perangkat lunak, dan sertifikasi keahlian berstandar industri.",
    amenities: ["40 iMac Apple", "Display Proyektor 4K", "Gigabit Internet", "Studio Lighting", "Central AC"],
    colorTheme: "from-blue-600 to-indigo-800",
    bgColor: "#E0F2FE",
    textColor: "#075985",
    iconName: "Monitor"
  },
  {
    id: 3,
    name: "Lapangan Olahraga Serbaguna",
    category: "Olahraga",
    loc: "Kampus Tengah (Outdoor)",
    cap: "300 Pax",
    capacityNum: 300,
    status: "Tersedia",
    image: "/images/sports_court.jpg",
    desc: "Sarana kebugaran untuk kegiatan PJOK, turnamen basket, futsal, bulutangkis, serta upacara bendera sekolah.",
    amenities: ["Ring Basket Hidrolik", "Gawang Futsal", "Tribun Penonton", "Lampu Sorot LED Malam", "Locker Room"],
    colorTheme: "from-emerald-600 to-teal-800",
    bgColor: "#DCFCE7",
    textColor: "#166534",
    iconName: "Trophy"
  },
  {
    id: 4,
    name: "Mini Auditorium Tri Ratna",
    category: "Auditorium",
    loc: "Gedung C • Lt. 4",
    cap: "85 Kursi Teater",
    capacityNum: 85,
    status: "Tersedia",
    image: "/images/mini_auditorium.jpg",
    desc: "Panggung presentasi karya siswa, seminar industri, nonton film edukasi, dan lokakarya akademik dengan akustik berstandar audio tinggi.",
    amenities: ["Kursi Teater Ergonomis", "Layar Lebar 180 Inci", "Wireless Mic Shure", "Lighting Panggung RGB", "Ruang Operator"],
    colorTheme: "from-purple-600 to-slate-900",
    bgColor: "#F3E8FF",
    textColor: "#6B21A8",
    iconName: "Presentation"
  }
];

export const INITIAL_REQUESTS = [
  {
    id: "TR-2025-089",
    user: "Budi Santoso",
    role: "OSIS Tri Ratna",
    phone: "0812-9876-5432",
    facilityId: 1,
    facility: "Cetiya Tri Ratna",
    date: "2025-05-24",
    formattedDate: "24 Mei 2025",
    timeStart: "13:00",
    timeEnd: "16:30",
    time: "13:00 - 16:30",
    purpose: "Latihan Kebaktian Bersama & Pembekalan Waisak Siswa",
    equipment: ["Sound System", "Mic Wireless (2)", "Karpet Tambahan"],
    status: "pending",
    createdAt: "2025-05-20T10:15:00"
  },
  {
    id: "TR-2025-088",
    user: "Hendra Wijaya, S.Kom",
    role: "Guru Jurusan RPL",
    phone: "0813-1122-3344",
    facilityId: 2,
    facility: "Lab Komputer Mac & Multimedia",
    date: "2025-05-23",
    formattedDate: "23 Mei 2025",
    timeStart: "08:00",
    timeEnd: "11:30",
    time: "08:00 - 11:30",
    purpose: "Ujian Sertifikasi Kompetensi Internasional Siswa Kelas XII",
    equipment: ["Display Proyektor", "Kabel LAN Cadangan"],
    status: "approved",
    createdAt: "2025-05-18T14:30:00"
  },
  {
    id: "TR-2025-086",
    user: "Arya Pratama",
    role: "Siswa XII AKL",
    phone: "0857-4433-2211",
    facilityId: 4,
    facility: "Mini Auditorium Tri Ratna",
    date: "2025-05-21",
    formattedDate: "21 Mei 2025",
    timeStart: "14:00",
    timeEnd: "18:00",
    time: "14:00 - 18:00",
    purpose: "Kegiatan Nonton Film Komersial (Non-Akademik)",
    equipment: [],
    status: "rejected",
    rejectReason: "Agenda di luar jam akademik tanpa izin pembina kesiswaan.",
    createdAt: "2025-05-15T09:00:00"
  },
  {
    id: "TR-2025-085",
    user: "Dewi Lestari",
    role: "Eskul Basket",
    phone: "0819-7788-9900",
    facilityId: 3,
    facility: "Lapangan Olahraga Serbaguna",
    date: "2025-05-25",
    formattedDate: "25 Mei 2025",
    timeStart: "15:30",
    timeEnd: "17:30",
    time: "15:30 - 17:30",
    purpose: "Sparring Persahabatan Basket Antar Jurusan RPL vs AKL",
    equipment: ["Bola Basket (3)", "Papan Skor Digital"],
    status: "approved",
    createdAt: "2025-05-19T11:20:00"
  }
];

export function BookingProvider({ children }) {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedFacilities = localStorage.getItem('tr_facilities');
      const savedRequests = localStorage.getItem('tr_requests');
      if (savedFacilities) {
        const parsed = JSON.parse(savedFacilities);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Gabungkan data tersimpan dengan data bawaan supaya foto fasilitas
          // bawaan tidak pernah hilang (cache lama sering tidak menyimpan path gambar).
          const merged = parsed.map((fac) => {
            const base = INITIAL_FACILITIES.find((f) => f.id === fac.id);
            if (!base) return fac;
            const hasValidImage =
              typeof fac.image === 'string' &&
              (fac.image.startsWith('/images/') || fac.image.startsWith('data:'));
            return {
              ...base,
              ...fac,
              image: hasValidImage ? fac.image : base.image,
              amenities: fac.amenities?.length ? fac.amenities : base.amenities,
            };
          });
          // Pastikan fasilitas bawaan yang hilang dari cache dikembalikan
          INITIAL_FACILITIES.forEach((base) => {
            if (!merged.some((f) => f.id === base.id)) merged.push(base);
          });
          merged.sort((a, b) => a.id - b.id);
          setFacilities(merged);
        }
      }
      if (savedRequests) setRequests(JSON.parse(savedRequests));
    } catch (e) {
      console.warn(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('tr_facilities', JSON.stringify(facilities));
        localStorage.setItem('tr_requests', JSON.stringify(requests));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [facilities, requests, isLoaded]);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const closeToast = () => setToast(null);

  const checkScheduleConflict = (facilityName, dateStr, start, end, excludeId = null) => {
    return requests.some((req) => {
      if (req.id === excludeId) return false;
      if (req.facility !== facilityName) return false;
      if (req.date !== dateStr) return false;
      if (req.status === 'rejected') return false;
      
      const reqStart = req.timeStart || "00:00";
      const reqEnd = req.timeEnd || "23:59";
      
      return (start < reqEnd && end > reqStart);
    });
  };

  const submitBooking = (data) => {
    const isConflict = checkScheduleConflict(
      data.facility,
      data.date,
      data.timeStart,
      data.timeEnd
    );

    if (isConflict) {
      showToast(`Jadwal bentrok! ${data.facility} sudah dipesan pada jam tersebut. Silakan pilih waktu lain.`, 'error');
      return { success: false, message: 'Jadwal bentrok dengan permohonan lain.' };
    }

    const nextIdNum = requests.length + 90;
    const bookingCode = `TR-${new Date().getFullYear()}-${String(nextIdNum).padStart(3, '0')}`;
    
    const dateObj = new Date(data.date);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const formattedDate = !isNaN(dateObj.getTime())
      ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
      : data.date;

    const newBooking = {
      id: bookingCode,
      user: data.user,
      email: data.email || "-",
      classGrade: data.classGrade || "-",
      unit: data.unit || "SMK",
      picName: data.picName || "",
      role: data.role || "Perwakilan Kelas",
      phone: data.phone || "-",
      facilityId: data.facilityId,
      facility: data.facility,
      date: data.date,
      formattedDate: formattedDate,
      timeStart: data.timeStart,
      timeEnd: data.timeEnd,
      time: `${data.timeStart} - ${data.timeEnd}`,
      purpose: data.purpose,
      participants: data.participants || null,
      equipment: data.equipment || [],
      status: data.status || "pending",
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [newBooking, ...prev]);
    showToast(`Berhasil! Permohonan ${bookingCode} diajukan & tersimpan di sistem.`, 'success');
    return { success: true, booking: newBooking };
  };

  const updateBookingStatus = (id, newStatus, reason = "") => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: newStatus,
          rejectReason: reason || req.rejectReason
        };
      }
      return req;
    }));

    if (newStatus === 'approved') {
      showToast(`Permohonan ${id} disetujui! Ruangan siap digunakan sesuai jadwal.`, 'success');
    } else if (newStatus === 'rejected') {
      showToast(`Permohonan ${id} telah ditolak oleh Admin Sarpras.`, 'warning');
    }
  };

  const toggleFacilityStatus = (id, newStatus) => {
    setFacilities(prev => prev.map(fac => {
      if (fac.id === id) {
        return { ...fac, status: newStatus };
      }
      return fac;
    }));
    showToast(`Status fasilitas berhasil diubah menjadi ${newStatus}.`, 'info');
  };

  const addFacility = (newFac) => {
    const id = facilities.length + 1;
    const facilityObj = {
      id,
      ...newFac,
      status: newFac.status || 'Tersedia'
    };
    setFacilities(prev => [...prev, facilityObj]);
    showToast(`Fasilitas baru "${facilityObj.name}" berhasil ditambahkan!`, 'success');
  };

  const searchBooking = (query) => {
    if (!query) return null;
    const cleanQuery = query.trim().toLowerCase();
    return requests.find(r => 
      r.id.toLowerCase() === cleanQuery || 
      r.user.toLowerCase().includes(cleanQuery)
    );
  };

  const exportBookingsToCSV = () => {
    const headers = ["ID Reservasi", "Pemohon", "Peran", "WhatsApp", "Fasilitas", "Tanggal", "Waktu", "Agenda Kegiatan", "Status"];
    const rows = requests.map(r => [
      r.id,
      `"${r.user.replace(/"/g, '""')}"`,
      `"${r.role}"`,
      `"${r.phone}"`,
      `"${r.facility}"`,
      `"${r.formattedDate || r.date}"`,
      `"${r.time}"`,
      `"${r.purpose.replace(/"/g, '""')}"`,
      `"${r.status === 'approved' ? 'Disetujui' : r.status === 'pending' ? 'Menunggu' : 'Ditolak'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Reservasi_Sarpras_TriRatna_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Rekap data CSV berhasil diunduh!", "success");
  };

  return (
    <BookingContext.Provider
      value={{
        facilities,
        requests,
        toast,
        submitBooking,
        updateBookingStatus,
        toggleFacilityStatus,
        addFacility,
        searchBooking,
        checkScheduleConflict,
        exportBookingsToCSV,
        showToast,
        closeToast
      }}
    >
      {children}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.15rem',
          borderRadius: '9px',
          background: 'var(--surface-card)',
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-xl)',
          fontSize: '0.88rem',
          fontWeight: '500',
          maxWidth: '420px',
          animation: 'slideUpToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid var(--border-color)',
          borderLeft: `4px solid ${
            toast.type === 'error'
              ? 'var(--status-rejected-text)'
              : toast.type === 'warning'
              ? 'var(--status-pending-text)'
              : 'var(--primary)'
          }`
        }}>
          <span>{toast.message}</span>
          <button
            onClick={closeToast}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.15rem',
              cursor: 'pointer',
              marginLeft: 'auto',
              padding: '0 0.2rem',
              lineHeight: 1
            }}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      )}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
