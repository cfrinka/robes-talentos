import { TalentCard } from './TalentCard';
import type { Talent } from '@/lib/content/types';

interface TalentGridProps {
  talents: Talent[];
  badge?: boolean;
  showAge?: boolean;
  id?: string;
}

export function TalentGrid({ talents, badge = false, showAge = false, id }: TalentGridProps) {
  return (
    <div className="talent-grid" id={id}>
      {talents.map((t) => (
        <TalentCard key={t.slug} talent={t} badge={badge} showAge={showAge} />
      ))}
    </div>
  );
}
