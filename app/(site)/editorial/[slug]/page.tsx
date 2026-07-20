import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/article/ArticleCard';
import { getAllArticles, getArticleBySlug } from '@/lib/content/repository';

export const revalidate = 31536000;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return { title: article?.title ?? 'Editorial' };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const articles = await getAllArticles();
  const moreArticles = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <main className="article-page">
      <div className="article-container">
        <Link className="back-link" href="/editorial">
          ← Voltar ao editorial
        </Link>
        <div className="placeholder has-img ph-16-9 article-hero reveal">
          <Image className="ph-img" src={article.image} alt={article.title} fill sizes="(max-width: 1024px) 100vw, 760px" />
        </div>
        <div className="article-header reveal">
          <div className="article-category">{article.category}</div>
          <h1 className="article-heading">{article.title}</h1>
          <div className="article-byline">
            {article.author} · {article.date} · {article.readTime}
          </div>
        </div>
        <div className="article-content reveal">
          {article.body.map((block, i) =>
            block.type === 'image' ? (
              <figure className="article-image" key={i}>
                <div className="placeholder has-img ph-16-9">
                  <Image className="ph-img" src={block.src} alt={block.alt} fill sizes="(max-width: 1024px) 100vw, 760px" />
                </div>
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            ) : (
              <p key={i}>{block.text}</p>
            )
          )}
        </div>
      </div>

      <div className="article-more reveal">
        <div className="section-head">
          <h2>Mais do Editorial</h2>
          <Link className="link-arrow" href="/editorial">
            Ver todos →
          </Link>
        </div>
        <div className="article-grid">
          {moreArticles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </main>
  );
}
