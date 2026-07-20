'use client';

import Image from 'next/image';
import { EntityListTable } from '../EntityListTable';
import { deleteCasting } from '@/lib/actions/castings';
import type { Casting, WithId } from '@/lib/content/types';

export function CastingsTable({ rows }: { rows: WithId<Casting>[] }) {
  return (
    <EntityListTable
      rows={rows}
      columns={[
        { header: '', render: (c) => (c.image ? <Image src={c.image} alt="" width={40} height={40} /> : null) },
        { header: 'Título', render: (c) => c.title },
        { header: 'Tipo', render: (c) => c.type },
        { header: 'Prazo', render: (c) => c.deadline },
      ]}
      editHref={(c) => `/admin/castings/edit?id=${encodeURIComponent(c.id)}`}
      getLabel={(c) => c.title}
      deleteAction={deleteCasting}
      emptyMessage="Nenhum casting cadastrado ainda."
    />
  );
}
