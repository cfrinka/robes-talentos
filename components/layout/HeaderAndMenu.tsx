'use client';

import { useState } from 'react';
import { Header } from './Header';
import { FullscreenMenu } from './FullscreenMenu';

export function HeaderAndMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
