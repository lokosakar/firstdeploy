import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { BookingProvider } from './lib/BookingContext';

// Konfigurasi Font
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'SMK Tri Ratna - Sistem Peminjaman Fasilitas Cerdas',
  description: 'Layanan Reservasi & Manajemen Prasarana Akademik Cerdas SMK Tri Ratna.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body>
        <BookingProvider>
          {children}
        </BookingProvider>
      </body>
    </html>
  );
}