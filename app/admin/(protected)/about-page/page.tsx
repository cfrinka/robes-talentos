import type { Metadata } from 'next';
import { AboutPageForm } from '@/components/admin/singletons/AboutPageForm';
import { getSingletonDoc } from '@/lib/content/admin-repository';
import type { AboutPageContent } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Página Sobre' };

export default async function AdminAboutPagePage() {
  const about = await getSingletonDoc<AboutPageContent>('aboutPage');

  return (
    <>
      <h1>Página Sobre</h1>
      <p className="subtitle">Conteúdo da página Sobre.</p>
      <AboutPageForm about={about} />
    </>
  );
}
