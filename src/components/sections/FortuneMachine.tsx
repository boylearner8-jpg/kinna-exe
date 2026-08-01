import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, randomItem } from '../../hooks/useKinna';
import { FORTUNES } from '../../data/content';
import { useRipple } from '../effects/CursorAndParticles';

export function FortuneMachine() {
  const { ref, visible } = useScrollReveal(0.1);
  const [fortune, setFortune] = useState('');
  const [key, setKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const ripple = useRipple();

  const reveal = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      setFortune(randomItem(FORTUNES));
      setKey((k) => k + 1);
      setSpinning(false);
    }, 600);
  };

  return (
    <section id="fortune" className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,215,0,0.03) 0%, transparent 60%)' }}
      />
      <div className="max-w-2xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ PROPHECY DIVISION</span>
          <h2 className="section-title">Fortune Machine</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            AI-powered predictions for Kinna's day
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          {/* Crystal ball */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.3), rgba(255,165,0,0.1), rgba(0,0,0,0.8))',
                border: '2px solid rgba(255,215,0,0.4)',
                boxShadow: '0 0 40px rgba(255,215,0,0.2), inset 0 0 40px rgba(255,215,0,0.1)',
                animation: 'pulse-glow 3s ease-in-out infinite',
              }}
            >
              <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px gold)' }}>
                {spinning ? '🌀' : '🔮'}
              </div>
            </div>
            {/* Glow rings */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-yellow-400/10"
                style={{ animation: `pulseRing ${i * 0.8 + 1}s ease-out infinite`, animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>

          {/* Fortune display */}
          <div
            className="min-h-24 flex items-center justify-center mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,215,0,0.15)' }}
          >
            <AnimatePresence mode="wait">
              {fortune ? (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -90 }}
                  transition={{ duration: 0.4 }}
                >
                  <p
                    className="font-mono-custom text-base md:text-lg"
                    style={{ color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,0.4)' }}
                  >
                    🌟 {fortune}
                  </p>
                </motion.div>
              ) : (
                <div className="font-mono-custom text-sm" style={{ color: 'rgba(255,215,0,0.3)' }}>
                  The oracle awaits your query...
                </div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={reveal}
            disabled={spinning}
            className="btn-gold px-10 py-4 rounded-xl font-display font-black text-lg tracking-widest"
            style={{ opacity: spinning ? 0.7 : 1 }}
          >
            {spinning ? '🔮 CONSULTING ORACLE...' : "🔮 REVEAL TODAY'S PREDICTION"}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
