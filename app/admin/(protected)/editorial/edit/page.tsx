import type { Metadata } from 'next';
import { ArticleForm } from '@/components/admin/editorial/ArticleForm';
import { getDocById } from '@/lib/content/admin-repository';
import type { Article } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Editar Artigo' };

interface EditArticlePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditArticlePage({ searchParams }: EditArticlePageProps) {
  const { id } = await searchParams;
  const article = id ? await getDocById<Article>('articles', id) : null;
  return <ArticleForm article={article} id={id} />;
}
