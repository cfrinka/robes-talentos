import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoriasTable } from '@/components/admin/categorias/CategoriasTable';
import { ClearQueryParam } from '@/components/admin/ClearQueryParam';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { listDocs } from '@/lib/content/admin-repository';
import type { Category } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Categorias' };

interface AdminCategoriasListPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminCategoriasListPage({ searchParams }: AdminCategoriasListPageProps) {
  const [categories, { saved }] = await Promise.all([listDocs<Category>('categories'), searchParams]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1>Categorias</h1>
          <p className="subtitle">Categorias de talentos (Atores, Modelos, etc).</p>
        </div>
        <Link className="btn" href="/admin/categorias/edit">
          + Nova categoria
        </Link>
      </div>
      {saved === '1' && (
        <>
          <StatusMessage text="Categoria salva com sucesso." variant="ok" />
          <ClearQueryParam param="saved" />
        </>
      )}
      <CategoriasTable rows={categories} />
    </>
  );
}
