import Link from 'next/link';
import Image from 'next/image';
import type { Talent } from '@/lib/content/types';

interface TalentCardProps {
  talent: Talent;
  badge?: boolean;
  showAge?: boolean;
}

export function TalentCard({ talent, badge = false, showAge = false }: TalentCardProps) {
  return (
    <Link
      className="talent-card"
      href={`/talentos/${talent.slug}`}
      data-category={talent.category}
      data-name={talent.name}
    >
      <div className="placeholder has-img ph-3-4" style={{ position: 'relative' }}>
        <Image className="ph-img" src={talent.image} alt={talent.name} fill sizes="(max-width: 640px) 50vw, 25vw" />
        {badge && <div className="availability-badge">{talent.availability}</div>}
      </div>
      <div className="talent-category">{talent.category}</div>
      <div className="talent-name">{talent.name}</div>
      <div className="talent-meta">
        {talent.city}
        {showAge ? ` · ${talent.age} anos` : ''}
      </div>
    </Link>
  );
}
