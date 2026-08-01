import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KINNA_NOTIFICATION_MESSAGES } from '../data/kinnaMessages';
import { useSound } from '../hooks/useKinna';
import { FiRefreshCw, FiArrowRight, FiMessageSquare } from 'react-icons/fi';

interface KinnaNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KinnaNotificationModal({ isOpen, onClose }: KinnaNotificationModalProps) {
  const { playNotification, playClick } = useSound();

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    Math.floor(Math.random() * KINNA_NOTIFICATION_MESSAGES.length)
  );

  // Play notification sound when popup opens
  useEffect(() => {
    if (isOpen) {
      playNotification();
    }
  }, [isOpen, playNotification]);

  // Handle ESC key press to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Get Another Random Message without immediate duplicate
  const handleNextMessage = () => {
    playClick();
    if (KINNA_NOTIFICATION_MESSAGES.length <= 1) return;

    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * KINNA_NOTIFICATION_MESSAGES.length);
    }
    setCurrentIndex(nextIndex);
  };

  const handleContinue = () => {
    playClick();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={handleContinue}
        className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden pb-[env(safe-area-inset-bottom)]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-[95vw] max-w-md max-h-[90vh] sm:max-h-[85vh] rounded-3xl border-2 border-yellow-500/50 p-4 sm:p-6 bg-black/95 shadow-[0_0_50px_rgba(255,215,0,0.25)] relative overflow-hidden flex flex-col my-auto"
        >
          {/* Header (Fixed flex-shrink-0) */}
          <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-yellow-500/20 mb-3 sm:mb-4 flex-shrink-0">
            {/* Kinna Circular Avatar (Responsive Sizes: Mobile w-10, Tablet w-12, Desktop w-14) */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_12px_#FFD700] bg-black">
                <img
                  src="/partner_devil_boy_kinna.jpg"
                  alt="Kinna Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Indicator Badge */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400 border-2 border-black animate-pulse shadow-[0_0_8px_#00ff41]" />
            </div>

            {/* User Info & Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg sm:text-xl text-yellow-400 tracking-wide flex items-center gap-1.5 truncate">
                  <span>KINNA</span>
                  <span className="text-[9px] sm:text-[10px] font-mono-custom bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 sm:px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                    DEVIL BOY 😈
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-1.5 font-mono-custom text-[11px] sm:text-xs text-yellow-500/60 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span>Online • Just Now</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content / Message Box (flex-1 min-h-0 overflow-y-auto) */}
          <div className="flex-1 min-h-0 overflow-y-auto mb-3 sm:mb-5 pr-1 custom-scrollbar">
            <div className="font-mono-custom text-[10px] text-yellow-500/50 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <FiMessageSquare className="w-3 h-3 text-yellow-400" />
              <span>INCOMING TRANSMISSION</span>
            </div>

            <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 min-h-[75px] sm:min-h-[90px] flex items-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="font-sans font-semibold text-sm sm:text-base md:text-lg text-yellow-100/95 leading-relaxed break-words w-full"
                >
                  "{KINNA_NOTIFICATION_MESSAGES[currentIndex]}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons (Fixed flex-shrink-0 at bottom, always visible) */}
          <div className="flex-shrink-0 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleNextMessage}
                className="py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20 font-mono-custom text-xs font-bold tracking-wider inline-flex items-center justify-center gap-2 transition-all group"
              >
                <FiRefreshCw className="w-3.5 h-3.5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
                <span>Another Message</span>
              </button>

              <button
                onClick={handleContinue}
                className="btn-gold py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl font-display font-black text-xs tracking-widest inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105 transition-all"
              >
                <span>Continue</span>
                <FiArrowRight className="w-3.5 h-3.5 text-black font-bold" />
              </button>
            </div>

            {/* Dismiss Hint */}
            <div className="text-center pt-0.5">
              <span className="font-mono-custom text-[10px] text-yellow-500/40">
                Press ESC or click outside to dismiss
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
