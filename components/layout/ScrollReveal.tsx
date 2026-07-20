'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Ports src/components/layout/ScrollReveal.astro: a single global
 * IntersectionObserver over every `.reveal` element, one-shot per element.
 * Re-runs the scan on every route change so newly-rendered `.reveal`
 * elements on the new page get observed too.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('reveal-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
