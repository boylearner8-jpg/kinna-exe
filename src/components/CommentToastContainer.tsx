import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToCommentToasts } from '../lib/realtime';
import type { ToastNotification } from '../lib/realtime';
import { fetchJourneyComments } from '../lib/db';
import { useSound } from '../hooks/useKinna';
import { FiMessageSquare, FiX, FiRadio } from 'react-icons/fi';

const SAMPLE_COMMENTS = [
  { name: 'Aryan', comment: 'Bhai CJP paper leak fight mein 500ft Titan transformation legendary tha! 🔥🔥' },
  { name: 'Motu Madhur', comment: 'Horse rally chapter was peak student revolution moment! Sector 009 highway full power 🏇📢' },
  { name: 'Dehati Ayush', comment: 'Kinna bhai everywhere we go, police standard protocol starts sweating! 🫡' },
  { name: 'Advocate Bo', comment: 'Legal authority flexing on Sector 009 highway complete. Justice for all students!' },
  { name: 'Pandit Bilal', comment: 'CJP Bachao लोकतंत्र Bachao rally was super hit!' },
  { name: 'Maddi', comment: 'Tactical stealth operative standing by for next deployment 🎯' },
  { name: 'Ayush Daddy', comment: 'Sector 009 command center fully operational. Respect!' },
];

interface CommentToastContainerProps {
  isLoaded?: boolean;
}

export function CommentToastContainer({ isLoaded = true }: CommentToastContainerProps) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const { playNotification } = useSound();
  const commentsPoolRef = useRef(SAMPLE_COMMENTS);

  // Load actual comments from DB into pool
  useEffect(() => {
    async function initPool() {
      try {
        const dbComments = await fetchJourneyComments();
        if (dbComments && dbComments.length > 0) {
          const formatted = dbComments.map((c) => ({ name: c.name, comment: c.comment }));
          commentsPoolRef.current = [...formatted, ...SAMPLE_COMMENTS];
        }
      } catch (e) {
        /* fallback to sample comments */
      }
    }
    initPool();
  }, []);

  // Listen for realtime live comments
  useEffect(() => {
    const unsubscribe = subscribeToCommentToasts((toast) => {
      try {
        playNotification();
      } catch (e) {
        /* silent */
      }

      setToasts((prev) => [toast, ...prev].slice(0, 3));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    });

    return () => unsubscribe();
  }, [playNotification]);

  // Show random comment toast max 2 times after intro finishes
  useEffect(() => {
    if (!isLoaded) return;

    const triggerRandomToast = () => {
      const pool = commentsPoolRef.current;
      if (pool.length === 0) return;

      const randomItem = pool[Math.floor(Math.random() * pool.length)];

      const newToast: ToastNotification = {
        id: `random-toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: randomItem.name,
        message: `${randomItem.name} left a comment`,
        commentSnippet: randomItem.comment,
        timestamp: Date.now(),
      };

      try {
        playNotification();
      } catch (e) {
        /* silent */
      }

      setToasts((prev) => [newToast, ...prev].slice(0, 3));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5500);
    };

    // 1st Toast: 2 seconds after intro finishes
    const timer1 = setTimeout(() => {
      triggerRandomToast();
    }, 2000);

    // 2nd Toast (Final): 10 seconds after intro finishes
    const timer2 = setTimeout(() => {
      triggerRandomToast();
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoaded, playNotification]);

  const removeToast = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToastClick = () => {
    const commentsEl = document.getElementById('journey-comments');
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const journeyEl = document.getElementById('journey');
      if (journeyEl) {
        journeyEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={handleToastClick}
            className="pointer-events-auto relative rounded-2xl p-4 overflow-hidden cursor-pointer group hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(255,215,0,0.35)] transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,15,0.96) 0%, rgba(5,5,5,0.98) 100%)',
              border: '1.5px solid rgba(255,215,0,0.4)',
              boxShadow: '0 0 30px rgba(255,215,0,0.25), inset 0 1px 0 rgba(255,215,0,0.2)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Top Header Badge */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span className="font-mono-custom text-[10px] font-bold text-yellow-400 tracking-widest uppercase flex items-center gap-1">
                  <FiRadio className="w-3 h-3 text-yellow-400 animate-pulse" />
                  JOURNEY OPINION
                </span>
              </div>

              <button
                onClick={(e) => removeToast(toast.id, e)}
                className="text-yellow-500/50 hover:text-yellow-400 transition-colors p-1"
                title="Dismiss"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toast Content */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.2)] mt-0.5 group-hover:scale-105 transition-transform">
                <FiMessageSquare className="w-4 h-4 text-yellow-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="font-display font-black text-xs text-yellow-300 tracking-wide truncate">
                    <span className="text-yellow-400">{toast.name}</span>
                  </div>
                  <span className="font-mono-custom text-[9px] text-yellow-500/50">CLICK TO VIEW</span>
                </div>

                {toast.commentSnippet ? (
                  <p className="font-mono-custom text-xs text-yellow-100/90 leading-snug line-clamp-2 italic">
                    "{toast.commentSnippet}"
                  </p>
                ) : (
                  <div className="font-mono-custom text-xs text-yellow-100/90 font-medium">
                    just left a comment on Kinna's Journey! 💬
                  </div>
                )}
              </div>
            </div>

            {/* Animated Progress Bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5.5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-400"
              style={{ boxShadow: '0 0 10px #FFD700' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
