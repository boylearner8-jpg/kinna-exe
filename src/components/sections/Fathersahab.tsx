import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import { FiAward, FiCheckCircle, FiHeart, FiStar } from 'react-icons/fi';

export function Fathersahab() {
  const { ref } = useScrollReveal(0.1);
  const { playClick, playSuccess } = useSound();
  const [respectPaid, setRespectPaid] = useState(false);
  const [saluteCount, setSaluteCount] = useState(1008);

  const handlePayRespect = () => {
    playClick();
    playSuccess();
    setRespectPaid(true);
    setSaluteCount((prev) => prev + 1);
    setTimeout(() => setRespectPaid(false), 3500);
  };

  return (
    <section id="fathersahab" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiAward className="w-4 h-4 text-yellow-400" />
            ◆ SUPREME AUTHORITY & TRIBUTE DOSSIER
          </span>
          <h2 className="section-title">Fathersahab</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.6)' }}>
            Dedicated in Honor of Kinna's Father — Pradhan Ji
          </p>
          <div className="section-divider" />
        </div>

        {/* Tribute Frame Display Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-3xl p-6 md:p-10 border-2 border-yellow-400 shadow-[0_0_60px_rgba(255,215,0,0.25)] text-center relative overflow-hidden"
        >
          {/* Classified Stamp Header */}
          <div className="flex items-center justify-between border-b border-yellow-500/20 pb-4 mb-6 flex-wrap gap-2 font-mono-custom text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-yellow-400 font-bold uppercase tracking-widest">
                CLASSIFIED TRIBUTE EXHIBIT #FATHER-AND-SON
              </span>
            </div>
            <div className="px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
              PRADHAN JI • SUPREME COMMANDER
            </div>
          </div>

          {/* Framed Photo Display */}
          <div className="relative max-w-lg mx-auto mb-8 group">
            {/* Outer Rotating Glowing Border Frame */}
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

            {/* Picture Frame */}
            <div className="relative rounded-2xl overflow-hidden border-4 border-yellow-400/80 shadow-[0_0_40px_rgba(255,215,0,0.5)] bg-black">
              <img
                src="/pradhan_ji.jpg"
                alt="Father & Son - Kinna & Pradhan Ji"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Photo Overlay Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 font-mono-custom">
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-display font-black text-sm tracking-widest">
                  <FiStar className="w-4 h-4 fill-yellow-400" />
                  <span>FATHER & SON — PRADHAN JI & KINNA</span>
                  <FiStar className="w-4 h-4 fill-yellow-400" />
                </div>
                <div className="text-[10px] text-yellow-500/70 uppercase tracking-wider mt-0.5">
                  THE ULTIMATE PILLAR & INSPIRATION
                </div>
              </div>
            </div>
          </div>

          {/* Titles & Bio */}
          <div className="font-mono-custom text-xs font-bold text-yellow-400 tracking-[0.3em] uppercase mb-1 flex items-center justify-center gap-2">
            <span>LEVEL 10 SUPREME COMMANDER</span>
          </div>
          <h3 className="font-display font-black text-3xl md:text-5xl text-yellow-400 mb-2 drop-shadow-[0_0_20px_#FFD700]">
            PRADHAN JI
          </h3>
          <p className="font-mono-custom text-xs text-yellow-500/60 uppercase tracking-widest mb-6">
            CLEARANCE: ABSOLUTE • STATUS: IMMUNE TO EXCUSES • RESPECT LEVEL: ∞
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8 font-mono-custom text-xs">
            <div className="glass-card p-3 rounded-xl border border-yellow-500/20">
              <span className="text-yellow-500/50 block text-[10px]">AUTHORITY</span>
              <span className="font-bold text-yellow-400 text-sm">100% ABSOLUTE</span>
            </div>
            <div className="glass-card p-3 rounded-xl border border-yellow-500/20">
              <span className="text-yellow-500/50 block text-[10px]">EXCUSE REJECTION</span>
              <span className="font-bold text-green-400 text-sm">100% RATE</span>
            </div>
            <div className="glass-card p-3 rounded-xl border border-yellow-500/20">
              <span className="text-yellow-500/50 block text-[10px]">WISDOM & GUIDANCE</span>
              <span className="font-bold text-yellow-300 text-sm">INFINITY</span>
            </div>
            <div className="glass-card p-3 rounded-xl border border-yellow-500/20">
              <span className="text-yellow-500/50 block text-[10px]">KINNA'S RESPECT</span>
              <span className="font-bold text-amber-400 text-sm">MAXIMUM</span>
            </div>
          </div>

          {/* Pay Respect Button */}
          <div className="relative inline-block">
            <button
              onClick={handlePayRespect}
              className="btn-gold px-8 py-3.5 rounded-2xl font-display font-bold text-xs tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all hover:scale-105"
            >
              <FiHeart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>PAY RESPECTS TO PRADHAN JI</span>
            </button>
          </div>

          {/* Respect Confirmation Banner */}
          <AnimatePresence>
            {respectPaid && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-mono-custom text-xs shadow-[0_0_20px_#FFD700]"
              >
                <FiCheckCircle className="w-4 h-4 text-yellow-400" />
                <span>SALUTE ACKNOWLEDGED! Total Respects Paid to Pradhan Ji: {saluteCount}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
