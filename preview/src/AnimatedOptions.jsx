import { useLayoutEffect, useRef, useState } from 'react';

export function AnimatedOptions({ active, children, className = '', ...props }) {
  const ref = useRef(null);
  const [marker, setMarker] = useState(null);
  useLayoutEffect(() => {
    const track = ref.current;
    const measure = () => {
      const selected = track.querySelector(':scope > button[aria-selected="true"], :scope > button[aria-pressed="true"]');
      if (!selected) return;
      const next = { x: selected.offsetLeft, y: selected.offsetTop, width: selected.offsetWidth, height: selected.offsetHeight };
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
    <span className="selection-marker" aria-hidden="true" style={marker ? { width: marker.width, height: marker.height, transform: `translate3d(${marker.x}px, ${marker.y}px, 0)` } : undefined}/>
    {children}
  </div>;
}
