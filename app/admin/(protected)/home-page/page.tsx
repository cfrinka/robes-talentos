import type { Metadata } from 'next';
import { HomePageForm } from '@/components/admin/singletons/HomePageForm';
import { getSingletonDoc } from '@/lib/content/admin-repository';
import type { HomePageContent } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Página Inicial' };

export default async function AdminHomePagePage() {
  const home = await getSingletonDoc<HomePageContent>('homePage');

  return (
    <>
      <h1>Página Inicial</h1>
      <p className="subtitle">Hero e seção &quot;A Agência&quot; da página Início.</p>
      <HomePageForm home={home} />
    </>
  );
}
