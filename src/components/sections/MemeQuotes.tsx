import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { MEME_QUOTES } from '../../data/content';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function MemeQuotes() {
  const { ref, visible } = useScrollReveal(0.1);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % MEME_QUOTES.length);
    }, 4000);
    return () => clearInterval(t);
  }, [auto]);

  const go = (dir: number) => {
    setAuto(false);
    setDirection(dir);
    setCurrent((c) => (c + dir + MEME_QUOTES.length) % MEME_QUOTES.length);
    setTimeout(() => setAuto(true), 8000);
  };

  const quote = MEME_QUOTES[current];

  return (
    <section id="quotes" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(255,215,0,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-3xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ PHILOSOPHICAL ARCHIVES</span>
          <h2 className="section-title">Meme Quotes</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Words of wisdom from the subject
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-10 text-center relative overflow-hidden"
        >
          {/* Quote marks */}
          <div
            className="absolute top-4 left-6 font-display text-8xl"
            style={{ color: 'rgba(255,215,0,0.1)', lineHeight: 1 }}
          >
            &ldquo;
          </div>
          <div
            className="absolute bottom-4 right-6 font-display text-8xl"
            style={{ color: 'rgba(255,215,0,0.1)', lineHeight: 1 }}
          >
            &rdquo;
          </div>

          {/* Quote */}
          <div className="relative z-10 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -50 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <p
                  className="font-display font-bold text-2xl md:text-3xl mb-6 leading-relaxed"
                  style={{
                    color: '#FFD700',
                    textShadow: '0 0 20px rgba(255,215,0,0.3)',
                  }}
                >
                  &ldquo;{quote.quote}&rdquo;
                </p>
                <p className="font-mono-custom text-sm" style={{ color: 'rgba(255,215,0,0.5)' }}>
                  {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => go(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                color: '#FFD700',
              }}
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {MEME_QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); setAuto(false); }}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === current ? '#FFD700' : 'rgba(255,215,0,0.2)',
                    boxShadow: i === current ? '0 0 8px #FFD700' : 'none',
                    transform: i === current ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                color: '#FFD700',
              }}
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
