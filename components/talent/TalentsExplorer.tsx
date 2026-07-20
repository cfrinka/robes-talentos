'use client';

import { useMemo, useState } from 'react';
import { TalentFilterBar } from './TalentFilterBar';
import { TalentCard } from './TalentCard';
import type { Category, Talent } from '@/lib/content/types';

interface TalentsExplorerProps {
  talents: Talent[];
  categories: Category[];
  initialCategory: string | null;
}

const PAGE_SIZE = 12;

// Combines the old TalentFilterBar + TalentGrid islands into one stateful
// container: the two need to share `activeCategory`/`search`, so in React
// that state lives here instead of being synced through the DOM.
export function TalentsExplorer({ talents, categories, initialCategory }: TalentsExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return talents.filter((t) => {
      const matchesCategory = !activeCategory || t.category === activeCategory;
      const matchesSearch = !query || t.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [talents, activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectCategory(name: string) {
    setActiveCategory((current) => (current === name ? null : name));
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <>
      <TalentFilterBar
        categories={categories}
        activeCategory={activeCategory}
        search={search}
        onSelectCategory={selectCategory}
        onSearchChange={updateSearch}
      />
      <div className="reveal">
        <div className="results-bar">
          <span>{filtered.length} talentos encontrados</span>
          <span>Ordenar: Relevância</span>
        </div>
        <div className="talent-grid" id="talentGrid">
          {paginated.map((t) => (
            <TalentCard key={t.slug} talent={t} badge showAge />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <span
                key={n}
                className={n === currentPage ? 'active' : undefined}
                onClick={() => setPage(n)}
                role="button"
                tabIndex={0}
              >
                {n}
              </span>
            ))}
            <span
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              role="button"
              tabIndex={0}
              aria-disabled={currentPage === totalPages}
            >
              →
            </span>
          </div>
        )}
      </div>
    </>
  );
}
