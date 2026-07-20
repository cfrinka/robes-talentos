import type { Metadata } from 'next';
import { MensagensTabs } from '@/components/admin/mensagens/MensagensTabs';
import { listDocs } from '@/lib/content/admin-repository';
import type { CastingApplication, TalentInquiry } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Mensagens' };

export default async function AdminMensagensPage() {
  const [applications, inquiries] = await Promise.all([
    listDocs<CastingApplication>('castingApplications', 'desc'),
    listDocs<TalentInquiry>('talentInquiries', 'desc'),
  ]);

  return (
    <>
      <h1>Mensagens</h1>
      <p className="subtitle">Candidaturas de casting e contatos recebidos pelo site.</p>
      <MensagensTabs applications={applications} inquiries={inquiries} />
    </>
  );
}
