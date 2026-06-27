import { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'left' | 'right' | 'scale' | 'grow-x' | 'none';

interface UseRevealOptions {
  threshold?: number;
  once?: boolean;
  direction?: Direction;
  delay?: number;
}

/**
 * Single source of truth for scroll-triggered reveals across the site.
 *
 * - Uses one IntersectionObserver per element (no global)
 * - Honours prefers-reduced-motion (returns visible=true immediately)
 * - Returns a ref + visible flag + a className helper that toggles
 *   the `.reveal-*` direction class with `.revealed` once intersecting
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  once = true,
  direction = 'up',
  delay = 0,
}: UseRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            const t = setTimeout(() => setVisible(true), delay);
            return () => clearTimeout(t);
          }
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once, delay]);

  const dirClass = direction === 'none' ? '' : `reveal-${direction}`;
  const className = `${dirClass} ${visible ? 'revealed' : ''}`.trim();

  return { ref, visible, className };
}
