import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactAgencyButton } from '@/components/talent/ContactAgencyButton';
import { TalentGallery } from '@/components/talent/TalentGallery';
import { getAllTalents, getTalentBySlug } from '@/lib/content/repository';

export const revalidate = 31536000;

export async function generateStaticParams() {
  const talents = await getAllTalents();
  return talents.map((t) => ({ slug: t.slug }));
}

interface TalentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TalentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug);
  return { title: talent?.name ?? 'Talento' };
}

export default async function TalentPage({ params }: TalentPageProps) {
  const { slug } = await params;
  const talent = await getTalentBySlug(slug);
  if (!talent) notFound();

  const galleryImages = [
    { src: talent.image, alt: talent.name },
    ...talent.gallery.map((src, i) => ({ src, alt: `${talent.name} — Galeria ${i + 1}` })),
  ];

  return (
    <main className="profile">
      <Link className="back-link" href="/talentos">
        ← Voltar aos talentos
      </Link>
      <div className="profile-grid reveal">
        <div className="profile-media">
          <TalentGallery images={galleryImages} />
          {talent.reelThumbnail && (
            <div className="reel-section">
              <div className="filter-label">Reel de Vídeo</div>
              {talent.reelUrl ? (
                <a
                  className="video-placeholder"
                  href={talent.reelUrl}
                  target="_blank"
                  rel="noopener"
                  style={{ backgroundImage: `url('${talent.reelThumbnail}')` }}
                >
                  <div className="play-btn" />
                  {talent.reelDuration && <span className="video-time">{talent.reelDuration}</span>}
                </a>
              ) : (
                <div className="video-placeholder" style={{ backgroundImage: `url('${talent.reelThumbnail}')` }}>
                  <div className="play-btn" />
                  {talent.reelDuration && <span className="video-time">{talent.reelDuration}</span>}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-category">{talent.category}</div>
          <h1 className="profile-name">{talent.name}</h1>
          <div className="profile-meta">
            {talent.city} · {talent.availability}
          </div>
          <p className="profile-bio">{talent.bio}</p>
          <div className="ficha-grid">
            <div className="ficha-item">
              <div className="ficha-label">Idade</div>
              <div className="ficha-value">{talent.age} anos</div>
            </div>
            <div className="ficha-item">
              <div className="ficha-label">Altura</div>
              <div className="ficha-value">{talent.height}</div>
            </div>
            <div className="ficha-item">
              <div className="ficha-label">Gênero</div>
              <div className="ficha-value">{talent.gender}</div>
            </div>
            <div className="ficha-item">
              <div className="ficha-label">Idiomas</div>
              <div className="ficha-value">{talent.languages}</div>
            </div>
          </div>
          <div className="filter-label">Habilidades</div>
          <div className="skills-row">
            {talent.skills.map((s, i) => (
              <span key={`${s}-${i}`} className="skill-chip">
                {s}
              </span>
            ))}
          </div>
          <div className="profile-actions">
            <ContactAgencyButton talentSlug={talent.slug} talentName={talent.name} />
            <button className="btn-outline-dark" type="button">
              Instagram
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
