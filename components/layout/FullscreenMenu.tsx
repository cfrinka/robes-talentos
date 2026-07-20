'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FullscreenMenuProps {
  open: boolean;
  onClose: () => void;
}

// Must match the .fullscreen-menu.closing animation-duration in globals.css.
const CLOSE_DURATION_MS = 500;

export function FullscreenMenu({ open, onClose }: FullscreenMenuProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [closing, setClosing] = useState(false);

  // Adjust `closing` right when `open` changes, during render rather than in
  // an effect -- see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (open !== prevOpen) {
    setPrevOpen(open);
    setClosing(prevOpen && !open);
  }

  useEffect(() => {
    if (!closing) return undefined;
    const timeout = setTimeout(() => setClosing(false), CLOSE_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [closing]);

  const className = ['fullscreen-menu', open && 'open', !open && closing && 'closing'].filter(Boolean).join(' ');

  return (
    <nav className={className}>
      <div className="menu-top">
        <button className="menu-close" onClick={onClose} type="button">
          Fechar ✕
        </button>
      </div>
      <div className="menu-links">
        <Link href="/" onClick={onClose}>
          Início
        </Link>
        <Link href="/talentos" onClick={onClose}>
          Talentos
        </Link>
        <Link href="/editorial" onClick={onClose}>
          Editorial
        </Link>
        <Link href="/castings" onClick={onClose}>
          Castings
        </Link>
        <Link href="/sobre" onClick={onClose}>
          Sobre
        </Link>
        <Link href="/contato" onClick={onClose}>
          Contato
        </Link>
      </div>
      <div className="menu-bottom">
        <span>Robes Britto &copy; 2026 — Agência de Talentos</span>
        <div className="menu-social">
          <span>Instagram</span>
          <span>LinkedIn</span>
        </div>
      </div>
    </nav>
  );
}
