import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FiX, FiAward } from 'react-icons/fi';

interface MissionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MissionCompleteModal({ isOpen, onClose }: MissionCompleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti animation
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FFED4A', '#00ff41'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FFED4A', '#ff0040'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateX: 30 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card max-w-lg w-full rounded-3xl p-8 text-center border-2 border-yellow-400 shadow-[0_0_80px_rgba(255,215,0,0.6)] relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-yellow-500/5 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Golden Badge Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 p-1 shadow-[0_0_40px_#FFD700]"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-yellow-200">
                <FiAward className="w-14 h-14 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Header */}
            <div className="font-mono-custom text-xs font-bold tracking-[0.3em] text-yellow-400/80 uppercase mb-2">
              ★ TOP SECRET ACHIEVEMENT UNLOCKED ★
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-yellow-400 mb-4 drop-shadow-[0_0_20px_#FFD700]">
              MISSION COMPLETE
            </h2>

            {/* Message */}
            <div className="glass-card rounded-2xl p-4 mb-6 border border-yellow-500/30 text-yellow-100 font-mono-custom text-sm space-y-2">
              <p className="text-lg font-bold text-yellow-400">🎉 Congratulations!</p>
              <p className="text-yellow-200/90">You Survived Kinna.</p>
              <p className="text-xs text-yellow-500/60 pt-2 border-t border-yellow-500/20">
                You have successfully collected all 15 hidden classified artifacts across the Kinna Universe.
              </p>
            </div>

            {/* Golden Badge Reward */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-display font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <span>🏆 GOLDEN SURVIVOR BADGE GRANTED</span>
            </div>

            <div className="mt-8">
              <button
                onClick={onClose}
                className="btn-gold px-10 py-3 rounded-xl font-display font-bold tracking-widest text-sm"
              >
                CLAIM VICTORY & CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
