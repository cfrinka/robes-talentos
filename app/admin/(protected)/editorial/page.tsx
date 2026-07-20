import type { Metadata } from 'next';
import Link from 'next/link';
import { ClearQueryParam } from '@/components/admin/ClearQueryParam';
import { ArticlesTable } from '@/components/admin/editorial/ArticlesTable';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { listDocs } from '@/lib/content/admin-repository';
import type { Article } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Editorial' };

interface AdminEditorialListPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminEditorialListPage({ searchParams }: AdminEditorialListPageProps) {
  const [articles, { saved }] = await Promise.all([listDocs<Article>('articles', 'desc'), searchParams]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1>Editorial</h1>
          <p className="subtitle">Artigos do editorial.</p>
        </div>
        <Link className="btn" href="/admin/editorial/edit">
          + Novo artigo
        </Link>
      </div>
      {saved === '1' && (
        <>
          <StatusMessage text="Artigo salvo com sucesso." variant="ok" />
          <ClearQueryParam param="saved" />
        </>
      )}
      <ArticlesTable rows={articles} />
    </>
  );
}
