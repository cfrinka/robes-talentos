import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { TalentGrid } from '@/components/talent/TalentGrid';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { ArticleCard } from '@/components/article/ArticleCard';
import { CastingCard } from '@/components/casting/CastingCard';
import {
  getFeaturedTalents,
  getAllCategories,
  getFeaturedArticles,
  getFeaturedCastings,
  getHomePage,
} from '@/lib/content/repository';

export const metadata: Metadata = { title: 'Início' };
export const revalidate = 31536000;

export default async function HomePage() {
  const [featuredTalents, categories, featuredArticles, featuredCastings, home] = await Promise.all([
    getFeaturedTalents(4),
    getAllCategories(),
    getFeaturedArticles(3),
    getFeaturedCastings(2),
    getHomePage(),
  ]);

  return (
    <main>
      <section className="hero">
        <div className="placeholder dark has-img" style={{ position: 'absolute', inset: 0 }}>
          <Image className="ph-img" src={home.heroImage} alt={home.heroTitleLine1} fill sizes="100vw" priority />
        </div>
        <div className="hero-content">
          <div className="kicker">{home.heroKicker}</div>
          <h1>
            {home.heroTitleLine1}
            <br />
            {home.heroTitleLine2}
          </h1>
          <Link className="btn-outline-light" href="/talentos">
            Ver Talentos
          </Link>
        </div>
      </section>

      <section className="about-split reveal">
        <div>
          <div className="kicker">{home.aboutKicker}</div>
          <p className="lead">{home.aboutLead}</p>
          <p className="body-text">{home.aboutBody}</p>
        </div>
        <div className="placeholder has-img ph-4-5">
          <Image
            className="ph-img"
            src={home.aboutImage}
            alt={home.aboutKicker}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="section reveal">
        <div className="section-head">
          <h2>Talentos em Destaque</h2>
          <Link className="link-arrow" href="/talentos">
            Ver todos →
          </Link>
        </div>
        <TalentGrid talents={featuredTalents} />
      </section>

      <section className="section reveal">
        <h2 style={{ marginBottom: 48 }}>Categorias</h2>
        <div className="category-grid">
          {categories.map((c, i) => (
            <CategoryTile key={`${c.name}-${i}`} category={c} />
          ))}
        </div>
      </section>

      <section className="section reveal">
        <div className="section-head">
          <h2>Editorial</h2>
          <Link className="link-arrow" href="/editorial">
            Ver todos →
          </Link>
        </div>
        <div className="article-grid">
          {featuredArticles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      <section className="section reveal">
        <div className="section-head">
          <h2>Castings Abertos</h2>
          <Link className="link-arrow" href="/castings">
            Ver todos →
          </Link>
        </div>
        <div className="casting-list">
          {featuredCastings.map((k, i) => (
            <CastingCard key={`${k.title}-${i}`} casting={k} />
          ))}
        </div>
      </section>
    </main>
  );
}
