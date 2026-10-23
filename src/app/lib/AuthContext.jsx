"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const PRESET_ADMINS = [
  {
    id: 'admin-sapras-1',
    username: 'admin',
    email: 'admin@smktri-ratna.sch.id',
    password: 'admin123',
    name: 'Admin Sarpras SMK Tri Ratna',
    role: 'admin',
    roleLabel: 'Admin Sarpras',
    unit: 'SMK / SMA',
    avatar: '🛡️',
    phone: '0811-2233-4455'
  },
  {
    id: 'admin-guru-1',
    username: 'guru.sapras',
    email: 'guru.sapras@smktri-ratna.sch.id',
    password: 'sapras123',
    name: 'Bpk. Handoko, S.Pd (Guru / Sarpras)',
    role: 'admin',
    roleLabel: 'Guru Pembina Sarpras',
    unit: 'SMK / SMA',
    avatar: '👨‍🏫',
    phone: '0812-9988-7766'
  }
];

// Akun Resmi Perwakilan Kelas SMK & SMA (1 Akun per Kelas untuk Ketua Kelas / PIC Resmi)
export const OFFICIAL_CLASS_ACCOUNTS = [
  // --- SMK JURUSAN RPL (Rekayasa Perangkat Lunak) ---
  {
    id: 'class-10-rpl',
    username: '10rpl',
    email: '10rpl@smktri-ratna.sch.id',
    password: '10rpl123',
    name: 'Perwakilan Kelas 10 RPL',
    unit: 'SMK',
    major: 'RPL',
    classGrade: '10 RPL',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 10 RPL',
    avatar: '💻',
    phone: '0812-1001-1001'
  },
  {
    id: 'class-11-rpl',
    username: '11rpl',
    email: '11rpl@smktri-ratna.sch.id',
    password: '11rpl123',
    name: 'Perwakilan Kelas 11 RPL',
    unit: 'SMK',
    major: 'RPL',
    classGrade: '11 RPL',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 11 RPL',
    avatar: '💻',
    phone: '0812-1101-1101'
  },
  {
    id: 'class-12-rpl',
    username: '12rpl',
    email: '12rpl@smktri-ratna.sch.id',
    password: '12rpl123',
    name: 'Perwakilan Kelas 12 RPL',
    unit: 'SMK',
    major: 'RPL',
    classGrade: '12 RPL',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 12 RPL',
    avatar: '💻',
    phone: '0812-1201-1201'
  },

  // --- SMK JURUSAN DKV (Desain Komunikasi Visual) ---
  {
    id: 'class-10-dkv',
    username: '10dkv',
    email: '10dkv@smktri-ratna.sch.id',
    password: '10dkv123',
    name: 'Perwakilan Kelas 10 DKV',
    unit: 'SMK',
    major: 'DKV',
    classGrade: '10 DKV',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 10 DKV',
    avatar: '🎨',
    phone: '0812-1002-1002'
  },
  {
    id: 'class-11-dkv',
    username: '11dkv',
    email: '11dkv@smktri-ratna.sch.id',
    password: '11dkv123',
    name: 'Perwakilan Kelas 11 DKV',
    unit: 'SMK',
    major: 'DKV',
    classGrade: '11 DKV',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 11 DKV',
    avatar: '🎨',
    phone: '0812-1102-1102'
  },
  {
    id: 'class-12-dkv',
    username: '12dkv',
    email: '12dkv@smktri-ratna.sch.id',
    password: '12dkv123',
    name: 'Perwakilan Kelas 12 DKV',
    unit: 'SMK',
    major: 'DKV',
    classGrade: '12 DKV',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 12 DKV',
    avatar: '🎨',
    phone: '0812-1202-1202'
  },

  // --- SMK JURUSAN AKUNTANSI (AK) ---
  {
    id: 'class-10-ak',
    username: '10ak',
    email: '10ak@smktri-ratna.sch.id',
    password: '10ak123',
    name: 'Perwakilan Kelas 10 Akuntansi',
    unit: 'SMK',
    major: 'Akuntansi',
    classGrade: '10 AK',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 10 Akuntansi',
    avatar: '📊',
    phone: '0812-1003-1003'
  },
  {
    id: 'class-11-ak',
    username: '11ak',
    email: '11ak@smktri-ratna.sch.id',
    password: '11ak123',
    name: 'Perwakilan Kelas 11 Akuntansi',
    unit: 'SMK',
    major: 'Akuntansi',
    classGrade: '11 AK',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 11 Akuntansi',
    avatar: '📊',
    phone: '0812-1103-1103'
  },
  {
    id: 'class-12-ak',
    username: '12ak',
    email: '12ak@smktri-ratna.sch.id',
    password: '12ak123',
    name: 'Perwakilan Kelas 12 Akuntansi',
    unit: 'SMK',
    major: 'Akuntansi',
    classGrade: '12 AK',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 12 Akuntansi',
    avatar: '📊',
    phone: '0812-1203-1203'
  },

  // --- UNIT SMA (10 SMA, 11 SMA, 12 SMA) ---
  {
    id: 'class-10-sma',
    username: '10sma',
    email: '10sma@triratna.sch.id',
    password: '10sma123',
    name: 'Perwakilan Kelas 10 SMA',
    unit: 'SMA',
    major: 'SMA',
    classGrade: '10 SMA',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 10 SMA',
    avatar: '🏛️',
    phone: '0812-1004-1004'
  },
  {
    id: 'class-11-sma',
    username: '11sma',
    email: '11sma@triratna.sch.id',
    password: '11sma123',
    name: 'Perwakilan Kelas 11 SMA',
    unit: 'SMA',
    major: 'SMA',
    classGrade: '11 SMA',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 11 SMA',
    avatar: '🏛️',
    phone: '0812-1104-1104'
  },
  {
    id: 'class-12-sma',
    username: '12sma',
    email: '12sma@triratna.sch.id',
    password: '12sma123',
    name: 'Perwakilan Kelas 12 SMA',
    unit: 'SMA',
    major: 'SMA',
    classGrade: '12 SMA',
    role: 'siswa',
    roleLabel: 'Ketua Kelas 12 SMA',
    avatar: '🏛️',
    phone: '0812-1204-1204'
  }
];

export function AuthProvider({ children }) {
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState('light');
  // Current logged in user (null if guest)
  const [currentUser, setCurrentUser] = useState(null);
  // Registered Siswa accounts in localStorage
  const [registeredUsers, setRegisteredUsers] = useState([]);
  // Loading status until localStorage is read
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Initialize theme & auth on client mount
  useEffect(() => {
    try {
      // 1. Theme initialization
      const savedTheme = localStorage.getItem('sarpras_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
      }

      // 2. Load registered users
      const savedUsers = localStorage.getItem('sarpras_registered_users');
      if (savedUsers) {
        setRegisteredUsers(JSON.parse(savedUsers));
      }

      // 3. Load active session
      const savedSession = localStorage.getItem('sarpras_session');
      if (savedSession) {
        setCurrentUser(JSON.parse(savedSession));
      }
    } catch (err) {
      console.error('Error initializing auth/theme:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('sarpras_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    } catch (e) {
      console.error(e);
    }
  };

  // Login handler with identifier (email OR username / class code)
  const login = (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Silakan isi email/ID kelas dan kata sandi.' };
    }

    // 1. Check if matches pre-set admin (by email or username)
    const foundAdmin = PRESET_ADMINS.find(
      (a) => (a.email.toLowerCase() === cleanId || a.username.toLowerCase() === cleanId) && a.password === cleanPass
    );
    if (foundAdmin) {
      const sessionUser = {
        id: foundAdmin.id,
        email: foundAdmin.email,
        username: foundAdmin.username,
        name: foundAdmin.name,
        role: 'admin',
        roleLabel: foundAdmin.roleLabel,
        unit: foundAdmin.unit,
        avatar: foundAdmin.avatar,
        phone: foundAdmin.phone
      };
      setCurrentUser(sessionUser);
      localStorage.setItem('sarpras_session', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    // 2. Check if matches official class account (by email or username/class code)
    const foundClass = OFFICIAL_CLASS_ACCOUNTS.find(
      (c) => (c.email.toLowerCase() === cleanId || c.username.toLowerCase() === cleanId) && c.password === cleanPass
    );
    if (foundClass) {
      const sessionUser = {
        id: foundClass.id,
        email: foundClass.email,
        username: foundClass.username,
        name: foundClass.name,
        role: 'siswa',
        roleLabel: foundClass.roleLabel,
        unit: foundClass.unit,
        major: foundClass.major,
        classGrade: foundClass.classGrade,
        avatar: foundClass.avatar,
        phone: foundClass.phone
      };
      setCurrentUser(sessionUser);
      localStorage.setItem('sarpras_session', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    // 3. Check if matches custom registered user
    const foundCustom = registeredUsers.find(
      (u) => (u.email.toLowerCase() === cleanId || (u.username && u.username.toLowerCase() === cleanId)) && u.password === cleanPass
    );
    if (foundCustom) {
      const sessionUser = {
        id: foundCustom.id,
        email: foundCustom.email,
        username: foundCustom.username || foundCustom.email.split('@')[0],
        name: foundCustom.name,
        role: 'siswa',
        roleLabel: 'Siswa / Perwakilan',
        unit: foundCustom.unit || 'SMK',
        classGrade: foundCustom.classGrade || 'Siswa',
        avatar: foundCustom.avatar || '🎓',
        phone: foundCustom.phone || '-'
      };
      setCurrentUser(sessionUser);
      localStorage.setItem('sarpras_session', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    // Check if ID exists with wrong password
    const allUsers = [...PRESET_ADMINS, ...OFFICIAL_CLASS_ACCOUNTS, ...registeredUsers];
    const exists = allUsers.some(
      (u) => u.email.toLowerCase() === cleanId || (u.username && u.username.toLowerCase() === cleanId)
    );
    if (exists) {
      return { success: false, error: 'Kata sandi yang Anda masukkan salah.' };
    }

    return { 
      success: false, 
      error: 'Akun atau ID kelas tidak ditemukan. Silakan gunakan akun resmi kelas Anda.' 
    };
  };

  // Register Siswa handler (Siswa only)
  const registerSiswa = ({ name, email, password, classGrade, unit, phone }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanName = (name || '').trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'Nama, Email, dan Password wajib diisi.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'Password minimal 6 karakter.' };
    }

    const allUsers = [...PRESET_ADMINS, ...OFFICIAL_CLASS_ACCOUNTS, ...registeredUsers];
    const isTaken = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (isTaken) {
      return { success: false, error: 'Email tersebut sudah terdaftar dalam sistem.' };
    }

    const newSiswa = {
      id: `custom-siswa-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      password: cleanPass,
      role: 'siswa',
      roleLabel: `Perwakilan ${classGrade || 'Kelas'}`,
      unit: unit || 'SMK',
      classGrade: classGrade ? classGrade.trim() : 'Siswa',
      phone: phone ? phone.trim() : '-',
      avatar: '🎓',
      createdAt: new Date().toISOString()
    };

    const updatedList = [...registeredUsers, newSiswa];
    setRegisteredUsers(updatedList);
    try {
      localStorage.setItem('sarpras_registered_users', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }

    const sessionUser = {
      id: newSiswa.id,
      email: newSiswa.email,
      username: newSiswa.username,
      name: newSiswa.name,
      role: 'siswa',
      roleLabel: newSiswa.roleLabel,
      unit: newSiswa.unit,
      classGrade: newSiswa.classGrade,
      avatar: newSiswa.avatar,
      phone: newSiswa.phone
    };

    setCurrentUser(sessionUser);
    try {
      localStorage.setItem('sarpras_session', JSON.stringify(sessionUser));
    } catch (e) {
      console.error(e);
    }

    return { success: true, user: sessionUser };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sarpras_session');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        isAdmin: currentUser?.role === 'admin',
        isSiswa: currentUser?.role === 'siswa',
        isAuthenticated: !!currentUser,
        isLoadingAuth,
        login,
        registerSiswa,
        logout,
        PRESET_ADMINS,
        OFFICIAL_CLASS_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
