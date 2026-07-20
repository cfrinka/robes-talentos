'use client';

import { useState } from 'react';
import { CastingCard } from './CastingCard';
import { ApplyModal, type ApplyModalTarget } from './ApplyModal';
import type { Casting } from '@/lib/content/types';

interface CastingsWithApplyProps {
  castings: Casting[];
}

export function CastingsWithApply({ castings }: CastingsWithApplyProps) {
  const [target, setTarget] = useState<ApplyModalTarget | null>(null);

  return (
    <>
      <div className="casting-list reveal">
        {castings.map((casting, i) => (
          <CastingCard
            key={`${casting.title}-${i}`}
            casting={casting}
            full
            onApply={() => setTarget({ title: casting.title, type: casting.type, deadline: casting.deadline })}
          />
        ))}
      </div>
      <ApplyModal casting={target} onClose={() => setTarget(null)} />
    </>
  );
}
