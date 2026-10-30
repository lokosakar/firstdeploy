import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './lib/AuthContext';
import { BookingProvider } from './lib/BookingContext';

// Font judul: serif editorial berkarakter
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

// Font teks & UI
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Font angka / kode booking
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Sarpras SMK Tri Ratna — Peminjaman Ruang & Fasilitas',
  description:
    'Pinjam lab, auditorium, cetiya, dan lapangan SMK Tri Ratna secara online. Cek jadwal kosong, ajukan, dan pantau status persetujuan Sarpras.',
};

// Set tema sebelum halaman tampil supaya tidak "kedip" terang → gelap
const themeScript = `(function(){try{var t=localStorage.getItem('sarpras_theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased selection:bg-amber-500/20">
        <AuthProvider>
          <BookingProvider>{children}</BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}