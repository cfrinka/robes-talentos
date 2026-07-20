'use client';

import Image from 'next/image';
import { EntityListTable } from '../EntityListTable';
import { deleteArticle } from '@/lib/actions/articles';
import type { Article, WithId } from '@/lib/content/types';

export function ArticlesTable({ rows }: { rows: WithId<Article>[] }) {
  return (
    <EntityListTable
      rows={rows}
      columns={[
        { header: '', render: (a) => (a.image ? <Image src={a.image} alt="" width={40} height={40} /> : null) },
        { header: 'Título', render: (a) => a.title },
        { header: 'Categoria', render: (a) => a.category },
        { header: 'Data', render: (a) => a.date },
      ]}
      editHref={(a) => `/admin/editorial/edit?id=${encodeURIComponent(a.id)}`}
      getLabel={(a) => a.title}
      deleteAction={deleteArticle}
      emptyMessage="Nenhum artigo cadastrado ainda."
    />
  );
}
