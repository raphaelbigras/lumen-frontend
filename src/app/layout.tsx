import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';

const orbitron = localFont({
  src: [
    { path: './fonts/Orbitron-Bold.ttf', weight: '700', style: 'normal' },
    { path: './fonts/Orbitron-Black.ttf', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: 'Lumen — Billetterie IT',
  description: 'Systeme de billetterie IT interne',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={orbitron.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
