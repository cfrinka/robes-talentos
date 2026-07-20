import type { Metadata } from 'next';
import { TalentsExplorer } from '@/components/talent/TalentsExplorer';
import { getAllTalents, getAllCategories } from '@/lib/content/repository';

export const metadata: Metadata = { title: 'Talentos' };
export const revalidate = 31536000;

interface TalentosPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function TalentosPage({ searchParams }: TalentosPageProps) {
  const { category } = await searchParams;
  const [talents, categories] = await Promise.all([getAllTalents(), getAllCategories()]);

  return (
    <main className="talentos-layout">
      <TalentsExplorer talents={talents} categories={categories} initialCategory={category ?? null} />
    </main>
  );
}
