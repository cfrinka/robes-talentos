import Image from 'next/image';
import type { Casting } from '@/lib/content/types';

interface CastingCardProps {
  casting: Casting;
  full?: boolean;
  onApply?: () => void;
}

export function CastingCard({ casting, full = false, onApply }: CastingCardProps) {
  return (
    <div className="casting-card">
      <div className="placeholder has-img ph-4-3">
        <Image
          className="ph-img"
          src={casting.image}
          alt={casting.title}
          fill
          sizes="(max-width: 1024px) 100vw, 220px"
        />
      </div>
      <div>
        <div className="casting-type">{casting.type}</div>
        <div className="casting-title">{casting.title}</div>
        <div className="casting-meta">
          <span>{casting.city}</span>
          <span>{casting.ageRange}</span>
        </div>
        {full && <p className="casting-description">{casting.description}</p>}
        {full && (
          <div className="casting-requirements">
            <strong>Requisitos:</strong> {casting.requirements}
          </div>
        )}
        {full && (
          <div className="casting-compensation">
            <strong>Remuneração:</strong> {casting.compensation}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span className="casting-deadline">Inscrições até {casting.deadline}</span>
          {full && onApply && (
            <button className="btn-dark" type="button" onClick={onApply}>
              Candidatar-se
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
