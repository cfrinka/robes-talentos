import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAboutPage } from '@/lib/content/repository';

export const metadata: Metadata = { title: 'Sobre' };
export const revalidate = 31536000;

export default async function SobrePage() {
  const about = await getAboutPage();

  return (
    <main className="sobre-page">
      <div className="kicker">A Agência</div>
      <h1>{about.heroTitle}</h1>
      <p className="page-subtitle">{about.heroSubtitle}</p>

      <section className="stats-row reveal">
        {about.stats.map((s, i) => (
          <div key={`${s.label}-${i}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="sobre-split reveal">
        <div>
          <p className="lead">{about.splitLead}</p>
          <p className="body-text">{about.splitBody}</p>
        </div>
        <div className="placeholder has-img ph-4-5">
          <Image className="ph-img" src={about.splitImage} alt={about.heroTitle} fill sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
      </section>

      <section className="values-grid reveal">
        {about.values.map((v, i) => (
          <div className="value-card" key={`${v.title}-${i}`}>
            <div className="value-title">{v.title}</div>
            <p className="value-desc">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="sobre-cta reveal">
        <p className="lead">{about.ctaLead}</p>
        <div className="sobre-cta-actions">
          <Link className="btn-accent" href="/talentos">
            Ver Talentos
          </Link>
          <Link className="btn-outline-dark" href="/contato">
            Fale Conosco
          </Link>
        </div>
      </section>
    </main>
  );
}
