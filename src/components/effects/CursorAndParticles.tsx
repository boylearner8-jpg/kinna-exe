import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    let animFrame: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      trailPos.current.x = lerp(trailPos.current.x, pos.current.x, 0.08);
      trailPos.current.y = lerp(trailPos.current.y, pos.current.y, 0.08);
      if (trailRef.current) {
        trailRef.current.style.left = `${trailPos.current.x}px`;
        trailRef.current.style.top = `${trailPos.current.y}px`;
      }
      animFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', move);
    animFrame = requestAnimationFrame(animate);

    const addHoverEffect = () => {
      const interactives = document.querySelectorAll('button, a, [data-cursor-hover]');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursorRef.current?.classList.add('scale-150');
          trailRef.current?.classList.add('scale-150');
        });
        el.addEventListener('mouseleave', () => {
          cursorRef.current?.classList.remove('scale-150');
          trailRef.current?.classList.remove('scale-150');
        });
      });
    };
    addHoverEffect();

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="cursor-glow transition-transform duration-100"
        style={{
          position: 'fixed',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#FFD700',
          boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 40px #FFA500',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'transform 0.1s ease',
        }}
      />
      {/* Trailing glow */}
      <div
        ref={trailRef}
        className="transition-transform duration-300"
        style={{
          position: 'fixed',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05), transparent)',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'transform 0.2s ease',
        }}
      />
    </>
  );
}

// ═══ Floating Particles ═══
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  delay: number;
}

export function FloatingParticles({ count = 30 }: { count?: number }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 15 + 10,
      opacity: Math.random() * 0.5 + 0.1,
      color: ['#FFD700', '#FFA500', '#FFED4A', '#FF8C00'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 10,
    }))
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            opacity: p.opacity,
            animation: `particleFloat ${p.speed}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            bottom: 0,
          }}
        />
      ))}
    </div>
  );
}

// ═══ Scan Line Overlay ═══
export function ScanLines() {
  return (
    <>
      {/* Static scanlines */}
      <div className="scanlines" />
      {/* Moving scanline */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)',
          animation: 'scanLine 8s linear infinite',
          pointerEvents: 'none',
          zIndex: 9997,
        }}
      />
    </>
  );
}

// ═══ Ripple Click Effect ═══
export function useRipple() {
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return handleClick;
}
