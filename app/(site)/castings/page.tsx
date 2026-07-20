import type { Metadata } from 'next';
import { CastingsWithApply } from '@/components/casting/CastingsWithApply';
import { getAllCastings } from '@/lib/content/repository';

export const metadata: Metadata = { title: 'Castings' };
export const revalidate = 31536000;

export default async function CastingsPage() {
  const castings = await getAllCastings();

  return (
    <main className="castings-page">
      <h1>Castings Abertos</h1>
      <p className="page-subtitle">Oportunidades ativas para talentos representados e novos candidatos.</p>
      <CastingsWithApply castings={castings} />
    </main>
  );
}
