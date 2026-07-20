import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/content/types';

interface ArticleCardProps {
  article: Pick<Article, 'slug' | 'title' | 'category' | 'excerpt' | 'image'>;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link className="article-card" href={`/editorial/${article.slug}`} data-category={article.category}>
      <div className="placeholder has-img ph-16-9">
        <Image className="ph-img" src={article.image} alt={article.title} fill sizes="(max-width: 1024px) 100vw, 33vw" />
      </div>
      <div className="article-category">{article.category}</div>
      <div className="article-title">{article.title}</div>
      <div className="article-excerpt">{article.excerpt}</div>
    </Link>
  );
}
