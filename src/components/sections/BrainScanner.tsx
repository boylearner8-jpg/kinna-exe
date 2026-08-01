import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, randomItem } from '../../hooks/useKinna';
import { BRAIN_SCAN_RESULTS } from '../../data/content';
import { useRipple } from '../effects/CursorAndParticles';
import { useSound } from '../../hooks/useKinna';

export function BrainScanner() {
  const { ref, visible } = useScrollReveal(0.1);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<(typeof BRAIN_SCAN_RESULTS)[0] | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [key, setKey] = useState(0);
  const ripple = useRipple();
  const { playScanner, playSuccess } = useSound();

  const handleScan = (e: React.MouseEvent<HTMLButtonElement>) => {
    ripple(e);
    if (scanning) return;
    setScanning(true);
    setResult(null);
    setScanProgress(0);
    playScanner();

    let prog = 0;
    const interval = setInterval(() => {
      prog += 2;
      setScanProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setResult(randomItem(BRAIN_SCAN_RESULTS));
          setKey((k) => k + 1);
          setScanning(false);
          playSuccess();
        }, 300);
      }
    }, 25);
  };

  return (
    <section id="brain" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.03) 0%, transparent 60%)' }}
      />
      <div className="max-w-2xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ MEDICAL DIVISION</span>
          <h2 className="section-title">Brain Scanner</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Advanced AI-powered neurological analysis
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          {/* Brain visualization */}
          <div
            className="relative w-48 h-48 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
              border: '2px solid rgba(0,212,255,0.2)',
              boxShadow: scanning ? '0 0 40px rgba(0,212,255,0.3)' : '0 0 20px rgba(0,212,255,0.1)',
              transition: 'box-shadow 0.3s',
            }}
          >
            <div className="text-7xl" style={{ filter: scanning ? 'drop-shadow(0 0 20px cyan)' : 'none' }}>
              🧠
            </div>

            {/* Scanning rings */}
            {scanning && (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-cyan-500/30"
                    style={{ animation: `pulseRing ${i * 0.5}s ease-out infinite`, animationDelay: `${i * 0.2}s` }}
                  />
                ))}
                {/* Scan line */}
                <div
                  className="absolute w-full h-0.5 left-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.8), transparent)',
                    animation: 'scanLine 1.2s linear infinite',
                    boxShadow: '0 0 10px rgba(0,212,255,0.6)',
                  }}
                />
              </>
            )}
          </div>

          {/* Progress during scan */}
          {scanning && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-mono-custom text-xs" style={{ color: 'rgba(0,212,255,0.7)' }}>
                  SCANNING NEURAL PATHWAYS...
                </span>
                <span className="font-mono-custom text-xs" style={{ color: '#00d4ff' }}>
                  {scanProgress}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${scanProgress}%`,
                    background: 'linear-gradient(90deg, #00d4ff, #00ff41)',
                    transition: 'width 0.05s linear',
                  }}
                />
              </div>
              <div className="font-mono-custom text-xs mt-2" style={{ color: 'rgba(0,212,255,0.5)' }}>
                {scanProgress < 30 ? 'Locating brain...' :
                  scanProgress < 60 ? 'Analyzing neural activity...' :
                  scanProgress < 90 ? 'Processing results...' : 'Finalizing scan...'}
              </div>
            </div>
          )}

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && !scanning && (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-6 p-5 rounded-xl"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: `1px solid ${result.color}33`,
                  boxShadow: `0 0 20px ${result.color}22`,
                }}
              >
                <div className="text-4xl mb-3">{result.icon}</div>
                <div
                  className="font-display font-black text-2xl mb-2"
                  style={{ color: result.color, textShadow: `0 0 20px ${result.color}` }}
                >
                  {result.title}
                </div>
                <p className="font-mono-custom text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {result.detail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={scanning}
            className="btn-gold px-10 py-4 rounded-xl text-lg font-display font-black tracking-widest"
            style={{
              borderColor: '#00d4ff',
              color: '#00d4ff',
              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
              opacity: scanning ? 0.7 : 1,
            }}
          >
            {scanning ? '🔬 SCANNING...' : '🧠 SCAN BRAIN'}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
