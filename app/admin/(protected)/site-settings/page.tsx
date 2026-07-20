import type { Metadata } from 'next';
import { SiteSettingsForm } from '@/components/admin/singletons/SiteSettingsForm';
import { getSingletonDoc } from '@/lib/content/admin-repository';
import type { SiteSettings } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Configurações do Site' };

export default async function AdminSiteSettingsPage() {
  const settings = await getSingletonDoc<SiteSettings>('siteSettings');

  return (
    <>
      <h1>Configurações do Site</h1>
      <p className="subtitle">Informações de contato usadas na página Contato.</p>
      <SiteSettingsForm settings={settings} />
    </>
  );
}
