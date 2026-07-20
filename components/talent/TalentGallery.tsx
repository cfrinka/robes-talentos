'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/lib/hooks/useIsClient';

interface GalleryImage {
  src: string;
  alt: string;
}

interface TalentGalleryProps {
  images: GalleryImage[];
}

// Ported from src/islands/TalentGallery.astro. The featured image is always
// promoted to the large slot; every other image fills the thumbnail row in
// its original order (not a simple carousel) -- clicking a thumbnail swaps
// which index is "current" rather than reordering the array.
//
// `currentIndex` (background main image + thumbnail order) and `modalIndex`
// (which image the lightbox is showing) are deliberately separate pieces of
// state: browsing with the modal's arrows/keyboard must not reshuffle the
// thumbnail grid behind it. Only clicking an actual thumbnail changes the
// background.
export function TalentGallery({ images }: TalentGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!modalOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  function openModal(index: number) {
    setModalIndex(index);
    setModalOpen(true);
  }

  const showNext = () => setModalIndex((i) => (i + 1) % images.length);
  const showPrev = () => setModalIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (!modalOpen) return undefined;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, images.length]);

  const featured = images[currentIndex];
  const modalImage = images[modalIndex];
  const thumbnails = images.map((img, i) => ({ img, i })).filter(({ i }) => i !== currentIndex);

  function activate(handler: () => void) {
    return {
      role: 'button' as const,
      tabIndex: 0,
      onClick: handler,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      },
    };
  }

  return (
    <>
      <div className="placeholder has-img ph-4-5 gallery-main" aria-label="Ver imagem ampliada" {...activate(() => openModal(currentIndex))}>
        <Image className="ph-img" src={featured.src} alt={featured.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="gallery-grid">
        {thumbnails.map(({ img, i }) => (
          <div
            key={i}
            className="placeholder has-img ph-3-4 gallery-thumb"
            aria-label="Destacar foto"
            {...activate(() => setCurrentIndex(i))}
          >
            <Image className="ph-img" src={img.src} alt={img.alt} fill sizes="25vw" />
          </div>
        ))}
      </div>

      {isClient &&
        createPortal(
          <div
            className={`gallery-modal${modalOpen ? ' open' : ''}`}
            aria-hidden={!modalOpen}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <button
              className="gallery-modal-close"
              aria-label="Fechar"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Fechar ✕
            </button>
            <div className="gallery-modal-counter">
              {modalIndex + 1} / {images.length}
            </div>
            <button className="gallery-modal-nav gallery-modal-prev" aria-label="Foto anterior" type="button" onClick={showPrev}>
              ‹
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox needs viewport-constrained intrinsic sizing, not a fill container */}
            <img className="gallery-modal-img" src={modalImage.src} alt={modalImage.alt} />
            <button className="gallery-modal-nav gallery-modal-next" aria-label="Próxima foto" type="button" onClick={showNext}>
              ›
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
