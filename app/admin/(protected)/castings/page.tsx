import type { Metadata } from 'next';
import Link from 'next/link';
import { CastingsTable } from '@/components/admin/castings/CastingsTable';
import { ClearQueryParam } from '@/components/admin/ClearQueryParam';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { listDocs } from '@/lib/content/admin-repository';
import type { Casting } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Castings' };

interface AdminCastingsListPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminCastingsListPage({ searchParams }: AdminCastingsListPageProps) {
  const [castings, { saved }] = await Promise.all([listDocs<Casting>('castings'), searchParams]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1>Castings</h1>
          <p className="subtitle">Oportunidades de casting abertas.</p>
        </div>
        <Link className="btn" href="/admin/castings/edit">
          + Novo casting
        </Link>
      </div>
      {saved === '1' && (
        <>
          <StatusMessage text="Casting salvo com sucesso." variant="ok" />
          <ClearQueryParam param="saved" />
        </>
      )}
      <CastingsTable rows={castings} />
    </>
  );
}
