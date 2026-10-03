import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { snappy } from './motion.jsx';

export function AnimatedOptions({ active, children, className = '', ...props }) {
  const ref = useRef(null);
  const [marker, setMarker] = useState(null);
  const x = useSpring(0, snappy), y = useSpring(0, snappy), width = useSpring(0, snappy), height = useSpring(0, snappy);
  const placed = useRef(false);
  useLayoutEffect(() => {
    const track = ref.current;
    const measure = () => {
      const selected = track.querySelector(':scope > button[aria-selected="true"], :scope > button[aria-pressed="true"]');
      if (!selected) return;
      const next = { x: selected.offsetLeft, y: selected.offsetTop, width: selected.offsetWidth, height: selected.offsetHeight };
      // First placement jumps; later moves spring from wherever the marker currently is.
      [[x, next.x], [y, next.y], [width, next.width], [height, next.height]].forEach(([value, target]) => placed.current ? value.set(target) : value.jump(target));
      placed.current = true;
      setMarker(previous => previous && Object.keys(next).every(key => previous[key] === next[key]) ? previous : next);
    };
    measure();
    const selected = track.querySelector(':scope > button[aria-selected="true"], :scope > button[aria-pressed="true"]');
    if (selected && track.scrollWidth > track.clientWidth) {
      const left = selected.offsetLeft;
      const right = left + selected.offsetWidth;
      if (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth) {
        track.scrollTo({ left: Math.max(0, left - (track.clientWidth - selected.offsetWidth) / 2), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [active]);
  return <div ref={ref} className={`animated-options ${className}`} data-marker-ready={Boolean(marker)} {...props}>
    <motion.span className="selection-marker" aria-hidden="true" style={{ x, y, width, height }}/>
    {children}
  </div>;
}
