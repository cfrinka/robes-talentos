'use client';

import Image from 'next/image';
import { EntityListTable } from '../EntityListTable';
import { deleteCategory } from '@/lib/actions/categories';
import type { Category, WithId } from '@/lib/content/types';

export function CategoriasTable({ rows }: { rows: WithId<Category>[] }) {
  return (
    <EntityListTable
      rows={rows}
      columns={[
        { header: '', render: (c) => (c.image ? <Image src={c.image} alt="" width={40} height={40} /> : null) },
        { header: 'Nome', render: (c) => c.name },
        { header: 'Descrição', render: (c) => (c.description ?? '').slice(0, 80) },
      ]}
      editHref={(c) => `/admin/categorias/edit?id=${encodeURIComponent(c.id)}`}
      getLabel={(c) => c.name}
      deleteAction={deleteCategory}
      emptyMessage="Nenhuma categoria cadastrada ainda."
      confirmMessage={(label) => `Excluir "${label}"? Talentos que usam essa categoria não serão apagados.`}
    />
  );
}
