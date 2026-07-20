'use client';

import { useState } from 'react';
import { ContactAgencyModal } from './ContactAgencyModal';

interface ContactAgencyButtonProps {
  talentSlug: string;
  talentName: string;
}

export function ContactAgencyButton({ talentSlug, talentName }: ContactAgencyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn-accent" type="button" onClick={() => setOpen(true)}>
        Contatar Agência
      </button>
      <ContactAgencyModal open={open} onClose={() => setOpen(false)} talentSlug={talentSlug} talentName={talentName} />
    </>
  );
}
