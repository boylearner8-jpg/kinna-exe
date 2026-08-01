import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, randomItem } from '../../hooks/useKinna';
import { ROASTS } from '../../data/content';
import { useRipple } from '../effects/CursorAndParticles';

export function RoastGenerator() {
  const { ref, visible } = useScrollReveal(0.1);
  const [currentRoast, setCurrentRoast] = useState('');
  const [roastCount, setRoastCount] = useState(0);
  const [key, setKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const ripple = useRipple();

  const generateRoast = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);
    if (isAnimating) return;
    setIsAnimating(true);
    setKey((k) => k + 1);
    setCurrentRoast(randomItem(ROASTS));
    setRoastCount((c) => c + 1);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section id="roast" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,100,0,0.04) 0%, transparent 60%)' }}
      />
      <div className="max-w-3xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ CLASSIFIED EVIDENCE</span>
          <h2 className="section-title">Roast Generator</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            {ROASTS.length}+ certified roasts stored in government servers
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          {/* Roast display */}
          <div
            className="min-h-32 flex items-center justify-center mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,215,0,0.15)' }}
          >
            <AnimatePresence mode="wait">
              {currentRoast ? (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
                >
                  <div className="text-3xl mb-4">🔥</div>
                  <p
                    className="font-mono-custom text-base md:text-lg leading-relaxed"
                    style={{ color: '#FFD700', textShadow: '0 0 10px rgba(255,215,0,0.3)' }}
                  >
                    "{currentRoast}"
                  </p>
                  <div
                    className="mt-4 font-mono-custom text-xs"
                    style={{ color: 'rgba(255,215,0,0.4)' }}
                  >
                    — Government Intelligence File #{Math.floor(Math.random() * 99999)}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="font-mono-custom"
                  style={{ color: 'rgba(255,215,0,0.3)' }}
                >
                  <div className="text-4xl mb-3">⚡</div>
                  <p className="text-sm tracking-widest">CLICK THE BUTTON TO GENERATE A ROAST</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(255,215,0,0.2)' }}>
                    Warning: May cause laughing
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate button */}
          <button
            onClick={generateRoast}
            disabled={isAnimating}
            className="btn-gold px-10 py-4 rounded-xl text-lg font-display font-black tracking-widest"
            style={{ opacity: isAnimating ? 0.7 : 1 }}
          >
            {isAnimating ? '⚡ GENERATING...' : '🔥 GENERATE ROAST'}
          </button>

          {roastCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 font-mono-custom text-xs"
              style={{ color: 'rgba(255,215,0,0.4)' }}
            >
              Roasts generated: {roastCount} | Kinna's feelings hurt: {roastCount}
            </motion.div>
          )}

          {/* Roast meter */}
          {roastCount >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-card rounded-xl p-4"
            >
              <div className="font-mono-custom text-xs mb-2" style={{ color: 'rgba(255,215,0,0.6)' }}>
                ROAST INTENSITY LEVEL
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(roastCount * 10, 100)}%`,
                    background: 'linear-gradient(90deg, #FFA500, #ff6b6b, #ff0040)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div className="font-mono-custom text-xs mt-2" style={{ color: '#ff6b6b' }}>
                {roastCount >= 10 ? '🔥 MAXIMUM ROAST ACHIEVED 🔥' : `${roastCount}/10 to Maximum Roast`}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
