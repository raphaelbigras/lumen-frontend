import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '900'],
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
