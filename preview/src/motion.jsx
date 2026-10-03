import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

// Shared spring for anything the hand directly drives: quick to respond, no wobble.
export const snappy = { type: 'spring', stiffness: 420, damping: 40, mass: .9 };
const glide = { type: 'spring', stiffness: 170, damping: 30, mass: 1 };

export function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis, frame, cancelled = false;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ lerp: .11, wheelMultiplier: .95, anchors: { offset: -100 } });
      const raf = time => { lenis.raf(time); frame = requestAnimationFrame(raf) };
      frame = requestAnimationFrame(raf);
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); lenis?.destroy() };
  }, []);
}

// Hero: three paper layers (artwork, cut card, phone) move at different depths under the pointer and on scroll.
export function HeroStage({ children: [art, label, phone] }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0), py = useMotionValue(0);
  const sx = useSpring(px, glide), sy = useSpring(py, glide);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 40%', 'end start'] });
  const rotateX = useTransform(sy, v => v * -2.4), rotateY = useTransform(sx, v => v * 3.4);
  const depth = (amount, scroll) => ({ x: useTransform(sx, v => v * amount), y: useTransform([sy, scrollYProgress], ([v, s]) => v * amount * .6 + s * scroll) });
  const artLayer = depth(-6, 46), labelLayer = depth(12, -40), phoneLayer = depth(22, -110);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const move = e => {
    if (reduce || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - .5); py.set((e.clientY - rect.top) / rect.height - .5);
  };
  const leave = () => { px.set(0); py.set(0) };
  return <motion.div ref={ref} className="hero-stage" onPointerMove={move} onPointerLeave={leave} style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1600 }}>
    <motion.div className="hero-layer" style={reduce ? undefined : artLayer}>{art}</motion.div>
    <motion.div className="hero-layer" style={reduce ? undefined : labelLayer}>{label}</motion.div>
    <motion.div className="hero-layer" style={reduce ? undefined : { ...phoneLayer, rotate: phoneRotate }}>{phone}</motion.div>
  </motion.div>;
}

// Vertical drift tied to the element's pass through the viewport.
export function Parallax({ range = 30, className, children, ...props }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  return <motion.div ref={ref} className={className} style={reduce ? undefined : { y }} {...props}>{children}</motion.div>;
}

// Native screenshots slide like an iOS push; pixels are never altered, only moved.
// Every screen stays mounted and decoded, and only transform/opacity animate, so a switch never waits on an image.
export function ScreenDeck({ index, mode = 'push', children }) {
  const layers = [].concat(children);
  const last = useRef(index), from = useRef(index);
  if (last.current !== index) { from.current = last.current; last.current = index }
  const previous = from.current, direction = index >= previous ? 1 : -1;
  const spring = { type: 'spring', stiffness: 300, damping: 36, mass: .9 };
  const fade = { duration: .32, ease: [.22, 1, .36, 1] };
  const state = i => {
    if (i === index) return mode === 'fade' ? { x: '0%', opacity: 1, zIndex: 2, transition: fade } : { x: previous === index ? '0%' : [`${direction * 100}%`, '0%'], opacity: 1, zIndex: 2, transition: { ...spring, opacity: { duration: 0 } } };
    if (i === previous) return mode === 'fade' ? { opacity: [1, 1], zIndex: 1, transition: fade, transitionEnd: { opacity: 0 } } : { x: ['0%', `${direction * -30}%`], opacity: 1, zIndex: 1, transition: spring, transitionEnd: { opacity: 0 } };
    return { opacity: 0, zIndex: 0, transition: { duration: 0 } };
  };
  return layers.map((layer, i) => <motion.div key={i} className="screen-swap" initial={false} animate={state(i)} style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 2 : 0 }} aria-hidden={i !== index || undefined}>
    {layer}
    {mode !== 'fade' && <motion.span className="screen-dim" initial={false} animate={{ opacity: i === previous && i !== index ? .16 : 0 }} transition={spring}/>}
  </motion.div>);
}

// The device itself is lifted out and set down again when the subject changes.
export function DeviceSwap({ id, className, children }) {
  return <AnimatePresence initial={false} mode="wait">
    <motion.div key={id} className={className} initial={{ opacity: 0, y: 28, rotate: 2.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -14, rotate: -1.5, transition: { duration: .16, ease: 'easeIn' } }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      {children}
    </motion.div>
  </AnimatePresence>;
}

export function CountUp({ to, duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const [value, setValue] = useState(to);
  const armed = useRef(false);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!inView) { if (!armed.current) { armed.current = true; setValue(0) } return }
    const controls = animate(0, to, { duration, ease: [.16, 1, .3, 1], onUpdate: v => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView]);
  return <span ref={ref} className="count-up">{value}</span>;
}
