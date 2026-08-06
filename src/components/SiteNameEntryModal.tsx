import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiArrowRight, FiShield } from 'react-icons/fi';
import { updateCurrentVisitorName } from '../lib/tracker';
import { playGlobalBackgroundMusic } from '../hooks/useBackgroundMusic';

interface SiteNameEntryModalProps {
  isOpen: boolean;
  onComplete: (name: string) => void;
}

export function SiteNameEntryModal({ isOpen, onComplete }: SiteNameEntryModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('⚠️ PLEASE ENTER YOUR NAME TO ACCESS THE SITE!');
      return;
    }
    updateCurrentVisitorName(trimmed);
    playGlobalBackgroundMusic();
    onComplete(trimmed);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-md bg-black/95 border-2 border-yellow-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(255,215,0,0.3)] space-y-5"
        >
          {/* Top Shield Badge */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 text-3xl shadow-[0_0_20px_rgba(255,215,0,0.4)] animate-pulse">
            <FiShield />
          </div>

          <div>
            <span className="font-mono-custom text-[10px] text-yellow-400 font-bold uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
              IDENTIFICATION REQUIRED
            </span>
            <h2 className="font-display font-black text-2xl text-yellow-400 tracking-wide mt-2">
              WELCOME TO KINNA.EXE
            </h2>
            <p className="font-mono-custom text-xs text-yellow-500/70 mt-1">
              Please enter your name to access the site dossiers &amp; games
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
              <label className="block font-mono-custom text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 text-center">
                YOUR NAME / OPERATIVE HANDLE:
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-400 w-4 h-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setError(null);
                  }}
                  placeholder="Enter your name..."
                  maxLength={30}
                  className={`w-full bg-black/90 border rounded-2xl pl-10 pr-4 py-3 text-yellow-300 font-mono-custom text-sm text-center outline-none transition-all ${
                    error
                      ? 'border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse text-red-300'
                      : 'border-yellow-500/40 focus:border-yellow-400'
                  }`}
                />
              </div>
              {error && (
                <div className="text-red-400 font-mono-custom font-bold text-xs text-center mt-2 animate-bounce">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-yellow-500 text-black font-display font-black text-sm tracking-widest inline-flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>ENTER SITE DOSSIER</span>
              <FiArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
