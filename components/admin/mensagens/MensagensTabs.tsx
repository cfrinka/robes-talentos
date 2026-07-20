'use client';

import { useState } from 'react';
import { CandidaturasTable } from './CandidaturasTable';
import { ContatosTable } from './ContatosTable';
import type { CastingApplication, TalentInquiry, WithId } from '@/lib/content/types';

interface MensagensTabsProps {
  applications: WithId<CastingApplication>[];
  inquiries: WithId<TalentInquiry>[];
}

export function MensagensTabs({ applications, inquiries }: MensagensTabsProps) {
  const [tab, setTab] = useState<'candidaturas' | 'contatos'>('candidaturas');

  return (
    <>
      <div className="tab-row">
        <button type="button" className={`tab${tab === 'candidaturas' ? ' active' : ''}`} onClick={() => setTab('candidaturas')}>
          Candidaturas ({applications.length})
        </button>
        <button type="button" className={`tab${tab === 'contatos' ? ' active' : ''}`} onClick={() => setTab('contatos')}>
          Contatos ({inquiries.length})
        </button>
      </div>
      {tab === 'candidaturas' ? <CandidaturasTable rows={applications} /> : <ContatosTable rows={inquiries} />}
    </>
  );
}
