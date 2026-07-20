import type { Metadata } from 'next';
import { CategoriaForm } from '@/components/admin/categorias/CategoriaForm';
import { getDocById } from '@/lib/content/admin-repository';
import type { Category } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Editar Categoria' };

interface EditCategoriaPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditCategoriaPage({ searchParams }: EditCategoriaPageProps) {
  const { id } = await searchParams;
  const category = id ? await getDocById<Category>('categories', id) : null;
  return <CategoriaForm category={category} id={id} />;
}
