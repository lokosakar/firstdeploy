"use client";

import Sidebar from '../components/Sidebar';
import { useAuth } from '../lib/AuthContext';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import styles from './adminLayout.module.css';

export default function AdminLayout({ children }) {
  const { currentUser, isAdmin, isLoadingAuth } = useAuth();

  // Show subtle loader while checking user authentication
  if (isLoadingAuth) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Memverifikasi hak akses Administrator...</p>
      </div>
    );
  }

  // Auth Guard: If not logged in as Admin, lock access and display friendly barrier
  if (!isAdmin) {
    return (
      <div className={styles.restrictedContainer}>
        <div className={styles.restrictedCard}>
          <div className={styles.alertIcon}>
            <ShieldAlert size={34} />
          </div>
          <h2>Akses Terbatas Sarpras</h2>
          <p>
            {currentUser ? (
              <>
                Anda saat ini terhubung sebagai <strong>{currentUser.name}</strong> ({currentUser.roleLabel || 'Siswa'}). 
                Panel Sarpras ini hanya dikhususkan bagi Administrator Sarpras resmi.
              </>
            ) : (
              'Panel Manajemen Sarpras SMK Tri Ratna dilindungi. Silakan masuk terlebih dahulu menggunakan akun Administrator.'
            )}
          </p>
          <div className={styles.actionButtons}>
            <Link href="/" className={styles.btnSecondary}>
              <ArrowLeft size={16} />
              <span>Kembali ke Beranda</span>
            </Link>
            <Link href="/login" className={styles.btnPrimary}>
              <LogIn size={16} />
              <span>{currentUser ? 'Ganti ke Akun Admin' : 'Masuk sebagai Admin'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.adminContentArea}>
        {children}
      </div>
    </div>
  );
}
