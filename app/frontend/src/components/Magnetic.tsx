import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Magnetic hover, child element drifts slightly toward the cursor when nearby.
 * Pure CSS transform, no React state. Disabled on touch + reduced-motion.
 *
 * Inspired by 21st.dev magnetic-button patterns; tuned conservatively for
 * editorial use (max 8px drift, slow easing back to rest).
 */
export default function Magnetic({
  children,
  strength = 0.25,
  className = '',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return;

    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      inner.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      frame = 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = (e.clientX - cx) * strength;
      ty = (e.clientY - cy) * strength;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    wrap.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <span ref={wrapRef} className={`inline-block ${className}`}>
      <span
        ref={innerRef}
        className="inline-block will-change-transform transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {children}
      </span>
    </span>
  );
}
