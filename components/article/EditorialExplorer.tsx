'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticleCard } from './ArticleCard';
import type { Article } from '@/lib/content/types';

interface EditorialExplorerProps {
  articles: Article[];
}

// Ported from the inline script in src/pages/editorial/index.astro: category
// tabs filter the already-fetched articles client-side, no refetch. Kept as
// one lightweight component rather than a separate "island", matching how
// thin the original inline script was.
export function EditorialExplorer({ articles }: EditorialExplorerProps) {
  const [activeCategory, setActiveCategory] = useState('');
  const categories = useMemo(() => [...new Set(articles.map((a) => a.category))], [articles]);

  const filtered = activeCategory ? articles.filter((a) => a.category === activeCategory) : articles;
  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="tab-row">
        <span className={`tab${activeCategory === '' ? ' active' : ''}`} onClick={() => setActiveCategory('')}>
          Todos
        </span>
        {categories.map((c) => (
          <span key={c} className={`tab${activeCategory === c ? ' active' : ''}`} onClick={() => setActiveCategory(c)}>
            {c}
          </span>
        ))}
      </div>

      {featured && (
        <Link className="featured-article reveal" href={`/editorial/${featured.slug}`} data-category={featured.category}>
          <div className="placeholder has-img ph-4-3">
            <Image
              className="ph-img"
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div>
            <div className="article-category">{featured.category}</div>
            <div className="article-title" style={{ fontSize: 'clamp(26px,2.6vw,38px)', fontWeight: 300 }}>
              {featured.title}
            </div>
            <p className="article-excerpt">{featured.excerpt}</p>
          </div>
        </Link>
      )}

      <div className="article-grid reveal" id="restArticles">
        {rest.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </>
  );
}
