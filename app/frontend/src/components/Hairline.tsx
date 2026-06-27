import { useReveal } from '@/hooks/useReveal';

/**
 * Bronze hairline that grows from its left edge as it enters the viewport.
 * Drop-in replacement for the `<div className="h-px w-N bg-gradient-...">` pattern.
 *
 * `align` controls horizontal placement of the rule itself:
 *   - 'center' (default): centered with `mx-auto`
 *   - 'left':  flush-left
 *   - 'right': flush-right
 */
export default function Hairline({
  width = 'w-24',
  align = 'center',
  className = '',
}: {
  width?: string;
  align?: 'center' | 'left' | 'right';
  className?: string;
}) {
  const { ref, visible } = useReveal({ threshold: 0.2 });
  const alignClass =
    align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
  return (
    <div
      ref={ref}
      className={`${alignClass} h-px ${width} bg-gradient-to-r from-transparent via-bronze-warm/70 to-transparent reveal-grow-x ${visible ? 'revealed' : ''} ${className}`}
      aria-hidden
    />
  );
}
