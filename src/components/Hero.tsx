import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRipple } from './effects/CursorAndParticles';
import { useSound } from '../hooks/useKinna';

interface HeroProps {
  onEnter: () => void;
}

export function Hero({ onEnter }: HeroProps) {
  const [shaking, setShaking] = useState(false);
  const ripple = useRipple();
  const { playBoom, playSuccess } = useSound();
  const heroRef = useRef<HTMLDivElement>(null);

  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);
    playBoom();
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      playSuccess();
      onEnter();
    }, 600);
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden grid-bg ${shaking ? 'animate-camera-shake' : ''}`}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,215,0,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center px-4 py-20">
        {/* Classified badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-8 flex-wrap"
        >
          <span className="badge">⬛ CLASSIFIED</span>
          <span className="badge-danger">⚠ THREAT LEVEL: 99%</span>
          <span className="badge">🔐 FILE #KNA-2006</span>
        </motion.div>

        {/* Profile image */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.4 }}
          className="relative flex justify-center mb-10"
        >
          <ProfileImage />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h1
            className="font-display font-black text-6xl md:text-8xl lg:text-9xl mb-3"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFED4A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.6))',
            }}
          >
            KINNA.EXE
          </h1>
          <p
            className="font-mono-custom text-sm md:text-base tracking-[0.4em] uppercase mb-2"
            style={{ color: 'rgba(255,215,0,0.7)' }}
          >
            Government Classified Specimen
          </p>
          <p className="font-mono-custom text-xs tracking-widest" style={{ color: 'rgba(255,215,0,0.4)' }}>
            Subject ID: KNA-2006 | Status: ACTIVE | Danger: EXTREME
          </p>
        </motion.div>

        {/* Warning card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="glass-card max-w-sm mx-auto mt-8 p-4 text-left"
        >
          <div className="font-mono-custom text-xs tracking-widest mb-3" style={{ color: 'rgba(255,215,0,0.5)' }}>
            ▌ CLASSIFIED ANALYSIS REPORT
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.7)' }}>THREAT LEVEL</span>
                <span className="font-mono-custom text-xs" style={{ color: '#ff0040' }}>99%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: '99%' }}
                  transition={{ delay: 1.3, duration: 1, ease: 'easeOut' }}
                  style={{ background: 'linear-gradient(90deg, #ff6b6b, #ff0040)' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-custom">
              <div>
                <span style={{ color: 'rgba(255,215,0,0.5)' }}>STATUS:</span>{' '}
                <span className="badge-danger text-xs">Highly Suspicious</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255,215,0,0.5)' }}>SPECIES:</span>{' '}
                <span style={{ color: '#FFD700' }}>Human (Probably)</span>
              </div>
            </div>
            <div className="text-xs font-mono-custom" style={{ color: 'rgba(255,165,0,0.7)' }}>
              ⚠ WARNING: Subject is known to be extremely late to everything.
              Do not expect punctuality. Approach with snacks.
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-10"
        >
          <button
            onClick={handleEnter}
            className="btn-gold px-10 py-4 text-lg rounded-lg font-display tracking-widest"
          >
            ▶ ENTER THE DATABASE
          </button>
          <p className="font-mono-custom text-xs mt-3" style={{ color: 'rgba(255,215,0,0.3)' }}>
            BY CLICKING YOU AGREE THAT KINNA IS SUSPICIOUS
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, repeat: Infinity, repeatType: 'reverse' }}
          className="mt-12"
        >
          <div className="font-mono-custom text-xs tracking-widest" style={{ color: 'rgba(255,215,0,0.3)' }}>
            ▼ SCROLL TO INVESTIGATE ▼
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProfileImage() {
  return (
    <div className="relative" style={{ width: '220px', height: '220px' }}>
      {/* Outer pulse rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-yellow-400/20"
          style={{
            animation: `pulseRing ${1.5 + i * 0.5}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Rotating outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '-12px',
          border: '2px solid transparent',
          borderTopColor: '#FFD700',
          borderRightColor: 'rgba(255,215,0,0.3)',
          borderRadius: '50%',
          animation: 'ringRotate 4s linear infinite',
          boxShadow: '0 0 20px rgba(255,215,0,0.4)',
        }}
      />

      {/* Second rotating ring (reverse) */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '-20px',
          border: '1px dashed rgba(255,165,0,0.4)',
          borderRadius: '50%',
          animation: 'ringRotate 8s linear infinite reverse',
        }}
      />

      {/* Third ring with dots */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '-28px',
          border: '1px solid transparent',
          borderBottomColor: 'rgba(255,215,0,0.2)',
          borderLeftColor: 'rgba(255,215,0,0.5)',
          borderRadius: '50%',
          animation: 'ringRotate 12s linear infinite',
        }}
      />

      {/* Gold glow backdrop */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      />

      {/* Image container */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: '220px',
          height: '220px',
          border: '3px solid rgba(255,215,0,0.6)',
          boxShadow: '0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,165,0,0.3), inset 0 0 30px rgba(255,215,0,0.1)',
        }}
      >
        <img
          src="/kinna.jpg"
          alt="Kinna - Government Classified Specimen"
          className="w-full h-full object-cover object-top"
          style={{ filter: 'contrast(1.1) saturate(1.2)' }}
        />

        {/* Scanner overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,215,0,0.02) 50%, transparent 100%)',
            animation: 'scanLine 3s linear infinite',
          }}
        />

        {/* Eye glow effect on top */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 40% 10% at 50% 42%, rgba(255,215,0,0.15) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Scanning label */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono-custom text-xs tracking-widest whitespace-nowrap"
        style={{ color: '#00ff41', textShadow: '0 0 8px #00ff41' }}
      >
        ● SCANNING...
      </div>

      {/* Corner brackets */}
      {[
        { top: '-4px', left: '-4px', borderTop: '3px solid #FFD700', borderLeft: '3px solid #FFD700' },
        { top: '-4px', right: '-4px', borderTop: '3px solid #FFD700', borderRight: '3px solid #FFD700' },
        { bottom: '-4px', left: '-4px', borderBottom: '3px solid #FFD700', borderLeft: '3px solid #FFD700' },
        { bottom: '-4px', right: '-4px', borderBottom: '3px solid #FFD700', borderRight: '3px solid #FFD700' },
      ].map((style, i) => (
        <div
          key={i}
          className="absolute"
          style={{ ...style, width: '20px', height: '20px', borderRadius: '2px' }}
        />
      ))}
    </div>
  );
}
