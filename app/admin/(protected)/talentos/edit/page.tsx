import type { Metadata } from 'next';
import { TalentForm } from '@/components/admin/talentos/TalentForm';
import { getDocById, listDocs } from '@/lib/content/admin-repository';
import type { Category, Talent } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Editar Talento' };

interface EditTalentPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditTalentPage({ searchParams }: EditTalentPageProps) {
  const { id } = await searchParams;
  const [categories, talent] = await Promise.all([
    listDocs<Category>('categories'),
    id ? getDocById<Talent>('talents', id) : Promise.resolve(null),
  ]);

  return <TalentForm categories={categories} talent={talent} id={id} />;
}
