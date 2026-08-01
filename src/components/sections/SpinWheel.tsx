import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { WHEEL_ITEMS } from '../../data/content';

export function SpinWheel() {
  const { ref, visible } = useScrollReveal(0.1);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof WHEEL_ITEMS)[0] | null>(null);
  const [key, setKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngle = useRef(0);

  const ITEM_COUNT = WHEEL_ITEMS.length;
  const SLICE_ANGLE = (2 * Math.PI) / ITEM_COUNT;

  useEffect(() => {
    drawWheel(currentAngle.current);
  }, []);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = cx - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    WHEEL_ITEMS.forEach((item, i) => {
      const startAngle = angle + i * SLICE_ANGLE;
      const endAngle = startAngle + SLICE_ANGLE;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + SLICE_ANGLE / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Orbitron, sans-serif';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(item.label, radius - 15, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const extraSpins = 5 + Math.random() * 5;
    const resultIndex = Math.floor(Math.random() * ITEM_COUNT);
    const targetAngle = extraSpins * 2 * Math.PI + (ITEM_COUNT - resultIndex) * SLICE_ANGLE - SLICE_ANGLE / 2;
    const totalRotation = targetAngle;
    const duration = 4000;
    const startTime = performance.now();
    const startAngle = currentAngle.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRot = startAngle + totalRotation * eased;
      currentAngle.current = currentRot;
      drawWheel(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentAngle.current = currentRot % (2 * Math.PI);
        setSpinning(false);
        setResult(WHEEL_ITEMS[resultIndex]);
        setKey((k) => k + 1);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <section id="wheel" className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(155,89,182,0.03) 0%, transparent 60%)' }}
      />
      <div className="max-w-2xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ PUNISHMENT DIVISION</span>
          <h2 className="section-title">Spin The Wheel</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Spin and face your fate. No escape.
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Wheel */}
          <div className="relative inline-block">
            {/* Pointer */}
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '24px solid #FFD700',
                filter: 'drop-shadow(0 0 8px #FFD700)',
              }}
            />

            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded-full"
              style={{
                border: '4px solid rgba(255,215,0,0.4)',
                boxShadow: '0 0 30px rgba(255,215,0,0.2)',
              }}
            />
          </div>

          {/* Spin button */}
          <div className="mt-8">
            <button
              onClick={spin}
              disabled={spinning}
              className="btn-gold px-12 py-4 rounded-xl font-display font-black text-xl tracking-widest"
              style={{ opacity: spinning ? 0.7 : 1 }}
            >
              {spinning ? '🌀 SPINNING...' : '🎯 SPIN!'}
            </button>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && !spinning && (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mt-6 p-6 rounded-2xl glass-card"
                style={{ border: `2px solid ${result.color}66` }}
              >
                <div className="text-4xl mb-3">{result.icon}</div>
                <div
                  className="font-display font-black text-2xl mb-2"
                  style={{ color: result.color, textShadow: `0 0 20px ${result.color}` }}
                >
                  {result.label}
                </div>
                <p className="font-mono-custom text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {result.result}
                </p>

                {/* Winning animation */}
                <div className="mt-4 text-2xl" style={{ animation: 'float 1s ease-in-out infinite' }}>
                  🎉🎊🎉
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
