'use client';

import { useEffect, useRef } from 'react';

const HOVER_SELECTOR =
  'a, button, input, textarea, .talent-card, .category-tile, .category-check, .gallery-main, .gallery-thumb, .tab';
const RING_LERP_FACTOR = 0.18;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS already hides these on coarse/no-hover devices (see the
    // (hover:none),(pointer:coarse) rule in globals.css) -- skipping the
    // listeners here just avoids wiring up dead mousemove/rAF work.
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let frame = 0;

    function handleMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }

    function loop() {
      ringX += (mouseX - ringX) * RING_LERP_FACTOR;
      ringY += (mouseY - ringY) * RING_LERP_FACTOR;
      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);

    function handleMouseOver(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest?.(HOVER_SELECTOR)) {
        dot?.classList.add('is-hover');
        ring?.classList.add('is-hover');
      }
    }

    function handleMouseOut(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest?.(HOVER_SELECTOR)) {
        dot?.classList.remove('is-hover');
        ring?.classList.remove('is-hover');
      }
    }

    function handleWindowMouseLeave() {
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    }

    function handleWindowMouseEnter() {
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
    }

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleWindowMouseLeave);
    document.addEventListener('mouseenter', handleWindowMouseEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleWindowMouseLeave);
      document.removeEventListener('mouseenter', handleWindowMouseEnter);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
