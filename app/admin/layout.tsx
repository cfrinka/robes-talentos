import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import './admin.css';

// A separate root layout (own <html>/<body>) from the marketing site's, so
// the admin panel never loads the public chrome (Header/Footer/CustomCursor).
// It reuses the same design tokens and typefaces as the public site
// (see admin.css) so the two feel like one product, just without the
// marketing chrome.
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
  title: { template: '%s — Painel', default: 'Painel' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
