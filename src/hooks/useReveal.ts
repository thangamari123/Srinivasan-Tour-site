import { useEffect, type RefObject } from 'react';

const supportsScrollTimeline = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline: view()');

/**
 * Scroll-reveal fallback: browsers with CSS scroll-driven animations reveal `.rv`
 * elements in pure CSS; others get `.rv-in` added once via IntersectionObserver.
 * Elements listed in `inViewClassTargets` additionally receive `is-in` once visible
 * (used for the CTA brush stroke and the footer wordmark fallback).
 */
export function useReveal(root: RefObject<HTMLElement | null>, inViewClassTargets: string[] = [], refreshKey?: unknown) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const targets: Element[] = [];
    if (!supportsScrollTimeline()) targets.push(...el.querySelectorAll('.rv:not(.rv-in)'));
    inViewClassTargets.forEach((sel) => {
      if (el.matches(sel) && !el.classList.contains('is-in')) targets.push(el);
      targets.push(...el.querySelectorAll(`${sel}:not(.is-in)`));
    });
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add(e.target.classList.contains('rv') ? 'rv-in' : 'is-in');
          if (inViewClassTargets.some((sel) => e.target.matches(sel))) e.target.classList.add('is-in');
          io.unobserve(e.target);
        }),
      { threshold: 0.2 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, refreshKey]);
}

/** Inline style that staggers a card's reveal by 80ms per index (fallback path). */
export const stagger = (i: number) => ({ '--rv-d': `${i * 80}ms` }) as React.CSSProperties;
