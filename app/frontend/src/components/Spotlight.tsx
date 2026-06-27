import { useEffect, useRef } from 'react';

/**
 * Radial bronze glow that follows the cursor inside its container.
 * Inspired by 21st.dev spotlight cards, retuned for editorial luxury:
 * extremely soft, single-hue, no parallax, fades out at the edges.
 *
 * Writes --sx / --sy CSS variables via rAF — zero React state churn.
 * Auto-disables on touch + reduced-motion.
 */
export default function Spotlight({
  className = '',
  intensity = 0.35,
  size = 520,
}: {
  className?: string;
  intensity?: number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      el.style.setProperty('--sx', `${mx}px`);
      el.style.setProperty('--sy', `${my}px`);
      frame = 0;
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.style.setProperty('--sx', '-9999px');
      el.style.setProperty('--sy', '-9999px');
    };
    // Initial position: off-screen so the spotlight is invisible until cursor enters
    onLeave();
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[5] ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at var(--sx, -9999px) var(--sy, -9999px), rgba(201, 152, 121, ${intensity}), transparent 60%)`,
        mixBlendMode: 'screen',
        transition: 'background 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    />
  );
}
