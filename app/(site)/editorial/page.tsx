import type { Metadata } from 'next';
import { EditorialExplorer } from '@/components/article/EditorialExplorer';
import { getAllArticles } from '@/lib/content/repository';

export const metadata: Metadata = { title: 'Editorial' };
export const revalidate = 31536000;

export default async function EditorialPage() {
  const articles = await getAllArticles();

  return (
    <main className="editorial-page">
      <h1>Editorial</h1>
      <EditorialExplorer articles={articles} />
    </main>
  );
}
