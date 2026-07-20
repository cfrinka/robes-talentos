import type { Metadata } from 'next';
import { CastingForm } from '@/components/admin/castings/CastingForm';
import { getDocById } from '@/lib/content/admin-repository';
import type { Casting } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Editar Casting' };

interface EditCastingPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditCastingPage({ searchParams }: EditCastingPageProps) {
  const { id } = await searchParams;
  const casting = id ? await getDocById<Casting>('castings', id) : null;
  return <CastingForm casting={casting} id={id} />;
}
