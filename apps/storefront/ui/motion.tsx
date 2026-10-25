'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Server content is fully visible; motion is an optional enhancement.
export function MotionEnhancement() {
  const pathname = usePathname();
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const showAll = () => elements.forEach(element => { element.dataset.motion = 'visible'; });
    if (preference.matches || !('IntersectionObserver' in window)) { showAll(); return; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.motion = 'visible';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    try {
      elements.forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight * .94) element.dataset.motion = 'visible';
        else { element.dataset.motion = 'pending'; observer.observe(element); }
      });
    } catch { showAll(); }
    const preferenceChanged = () => { if (preference.matches) { showAll(); observer.disconnect(); } };
    preference.addEventListener('change', preferenceChanged);
    return () => { observer.disconnect(); showAll(); preference.removeEventListener('change', preferenceChanged); };
  }, [pathname]);
  return null;
}
