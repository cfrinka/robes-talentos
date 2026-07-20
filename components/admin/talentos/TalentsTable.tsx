'use client';

import Image from 'next/image';
import { EntityListTable } from '../EntityListTable';
import { deleteTalent } from '@/lib/actions/talents';
import type { Talent, WithId } from '@/lib/content/types';

export function TalentsTable({ rows }: { rows: WithId<Talent>[] }) {
  return (
    <EntityListTable
      rows={rows}
      columns={[
        { header: '', render: (t) => (t.image ? <Image src={t.image} alt="" width={40} height={40} /> : null) },
        { header: 'Nome', render: (t) => t.name },
        { header: 'Categoria', render: (t) => t.category },
        { header: 'Cidade', render: (t) => t.city },
      ]}
      editHref={(t) => `/admin/talentos/edit?id=${encodeURIComponent(t.id)}`}
      getLabel={(t) => t.name}
      deleteAction={deleteTalent}
      emptyMessage="Nenhum talento cadastrado ainda."
    />
  );
}
