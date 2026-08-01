import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useKinna';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  { text: 'Connecting to Government Database...', delay: 0, color: '#00ff41' },
  { text: 'Establishing Secure Connection...', delay: 250, color: '#00d4ff' },
  { text: 'Decrypting Files...', delay: 500, color: '#FFD700' },
  { text: 'Bypassing Security Protocols...', delay: 750, color: '#FF6B6B' },
  { text: 'Scanning Subject...', delay: 1000, color: '#00ff41' },
  { text: 'Running Facial Recognition...', delay: 1250, color: '#00d4ff' },
  { text: 'Cross-referencing Database...', delay: 1500, color: '#FFD700' },
  { text: 'Identity Found...', delay: 1750, color: '#FFA500' },
  { text: 'K I N N A', delay: 2000, color: '#FFD700' },
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [glitching, setGlitching] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const { playTypeKey, playSuccess, playScanner } = useSound();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playScanner();

    LOADING_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        setProgress(((i + 1) / LOADING_STEPS.length) * 100);

        if (step.text === 'K I N N A') {
          playSuccess();
          let letterIdx = 0;
          const interval = setInterval(() => {
            letterIdx++;
            setDisplayedLines((prev) => {
              const updated = [...prev];
              updated[i] = '> ' + step.text.slice(0, letterIdx * 2);
              return updated;
            });
            playTypeKey();
            if (letterIdx >= step.text.replace(/ /g, '').length) clearInterval(interval);
          }, 50);
        } else {
          let charIdx = 0;
          const interval = setInterval(() => {
            charIdx++;
            setDisplayedLines((prev) => {
              const updated = [...prev];
              updated[i] = '> ' + step.text.slice(0, charIdx);
              return updated;
            });
            playTypeKey();
            if (charIdx >= step.text.length) clearInterval(interval);
          }, 12);
        }
      }, step.delay);
    });

    // Glitch then finish faster
    setTimeout(() => {
      setGlitching(true);
      setTimeout(() => {
        setGlitching(false);
        setDone(true);
        setTimeout(() => onComplete(), 300);
      }, 300);
    }, 2500);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 bg-black z-[99999] flex items-center justify-center overflow-hidden"
        >
          {/* Background grid */}
          <div className="absolute inset-0 grid-bg opacity-30" />

          {/* Scan lines */}
          <div className="scanlines" />

          {/* Glitch overlay */}
          {glitching && (
            <div
              className="absolute inset-0 z-50"
              style={{
                background: 'repeating-linear-gradient(0deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1) 2px, transparent 4px)',
                animation: 'glitch 0.1s ease-in-out infinite',
              }}
            />
          )}

          <div className="relative z-10 w-full max-w-2xl px-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div
                className="font-display font-black text-2xl tracking-widest mb-2"
                style={{ color: '#FFD700', textShadow: '0 0 20px #FFD700' }}
              >
                ⬛ KINNA.EXE
              </div>
              <div className="font-mono-custom text-xs tracking-widest" style={{ color: 'rgba(255,215,0,0.5)' }}>
                CLASSIFIED GOVERNMENT INTELLIGENCE SYSTEM v2.0
              </div>
            </motion.div>

            {/* Terminal window */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot" style={{ background: '#ff5f56' }} />
                <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
                <div className="terminal-dot" style={{ background: '#27c93f' }} />
                <span className="font-mono-custom text-xs ml-2" style={{ color: 'rgba(255,215,0,0.5)' }}>
                  classified_terminal — bash
                </span>
              </div>

              <div
                ref={terminalRef}
                className="p-4 h-64 overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
              >
                {LOADING_STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: i <= currentStep ? 1 : 0 }}
                    className="mb-1"
                  >
                    <span
                      className="font-mono-custom text-sm"
                      style={{
                        color: i === currentStep && step.text === 'K I N N A' ? '#FFD700' : step.color,
                        textShadow: step.text === 'K I N N A' ? '0 0 20px #FFD700' : 'none',
                        fontSize: step.text === 'K I N N A' ? '1.5rem' : '0.875rem',
                        fontWeight: step.text === 'K I N N A' ? '900' : '400',
                        letterSpacing: step.text === 'K I N N A' ? '0.3em' : 'normal',
                      }}
                    >
                      {displayedLines[i] || ''}
                      {i === currentStep && step.text !== 'K I N N A' && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '14px',
                            background: step.color,
                            marginLeft: '2px',
                            animation: 'typeCursor 0.7s step-end infinite',
                            verticalAlign: 'text-bottom',
                          }}
                        />
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.5)' }}>
                  LOADING...
                </span>
                <span className="font-mono-custom text-xs" style={{ color: '#FFD700' }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
                />
              </div>
            </div>

            {/* Warning badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-center"
            >
              <span className="badge-danger text-xs">
                ⚠ UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE ⚠
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
