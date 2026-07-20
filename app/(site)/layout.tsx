import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import '../globals.css';
import { HeaderAndMenu } from '@/components/layout/HeaderAndMenu';
import { Footer } from '@/components/layout/Footer';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { ScrollReveal } from '@/components/layout/ScrollReveal';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-d-raw',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-b-raw',
});

export const metadata: Metadata = {
  title: {
    template: '%s — Robes Britto',
    default: 'Robes Britto',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <CustomCursor />
        <HeaderAndMenu />
        {children}
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
