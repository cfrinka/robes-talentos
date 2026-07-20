import type { Metadata } from 'next';
import Link from 'next/link';
import { ClearQueryParam } from '@/components/admin/ClearQueryParam';
import { StatusMessage } from '@/components/admin/StatusMessage';
import { TalentsTable } from '@/components/admin/talentos/TalentsTable';
import { listDocs } from '@/lib/content/admin-repository';
import type { Talent } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Talentos' };

interface AdminTalentosListPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminTalentosListPage({ searchParams }: AdminTalentosListPageProps) {
  const [talents, { saved }] = await Promise.all([listDocs<Talent>('talents'), searchParams]);

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h1>Talentos</h1>
          <p className="subtitle">Talentos representados pela agência.</p>
        </div>
        <Link className="btn" href="/admin/talentos/edit">
          + Novo talento
        </Link>
      </div>
      {saved === '1' && (
        <>
          <StatusMessage text="Talento salvo com sucesso." variant="ok" />
          <ClearQueryParam param="saved" />
        </>
      )}
      <TalentsTable rows={talents} />
    </>
  );
}
