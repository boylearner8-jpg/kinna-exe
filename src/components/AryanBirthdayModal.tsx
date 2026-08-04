import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiX, FiHeart, FiCheckCircle, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import { insertGuestbookMessage, fetchGuestbookMessages, type GuestbookMessage } from '../lib/db';

interface AryanBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AryanBirthdayModal({ isOpen, onClose }: AryanBirthdayModalProps) {
  const [step, setStep] = useState<'info' | 'wish' | 'view_all'>('info');
  const [wishSent, setWishSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wishText, setWishText] = useState('');
  const [wishAuthor, setWishAuthor] = useState('');

  // Global Supabase wishes state
  const [allWishes, setAllWishes] = useState<GuestbookMessage[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FF0055', '#00E5FF', '#22C55E', '#A855F7'],
      });
    } catch {}
  };

  const loadGlobalWishes = async () => {
    setLoadingWishes(true);
    try {
      const messages = await fetchGuestbookMessages();
      // Filter for birthday wishes or show recent messages
      const bdayWishes = messages.filter(
        (m) =>
          m.message.includes('🎂') ||
          m.message.toLowerCase().includes('aryan') ||
          m.message.toLowerCase().includes('birthday')
      );
      setAllWishes(bdayWishes.length > 0 ? bdayWishes : messages);
    } catch (err) {
      console.error('Failed to load birthday wishes:', err);
    } finally {
      setLoadingWishes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadGlobalWishes();
    }
  }, [isOpen]);

  const handleContinueToWish = () => {
    triggerConfetti();
    setStep('wish');
  };

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim() || !wishAuthor.trim()) return;

    setSubmitting(true);
    triggerConfetti();

    const formattedMessage = wishText.trim();

    try {
      // Save globally to Supabase database!
      await insertGuestbookMessage({
        id: `bday-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: wishAuthor.trim(),
        message: formattedMessage,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      await loadGlobalWishes();
    } catch (err) {
      console.error('Failed to post birthday wish to Supabase:', err);
    } finally {
      setSubmitting(false);
      setWishSent(true);
      setTimeout(() => {
        setWishSent(false);
        setWishText('');
        setWishAuthor('');
        setStep('view_all'); // Automatically show all global wishes!
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            className="glass-card rounded-2xl max-w-md w-full p-3.5 sm:p-5 border-2 border-yellow-400 relative text-center shadow-[0_0_50px_rgba(255,215,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Top Bar: Tabs & Close Button Row */}
            <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
              <div className="flex items-center gap-1 bg-black/70 p-1 rounded-xl border border-yellow-500/30 flex-1 font-mono-custom text-[10px] sm:text-[11px]">
                <button
                  onClick={() => setStep('info')}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg font-bold transition-all truncate flex-1 ${
                    step === 'info'
                      ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]'
                      : 'text-amber-300/70 hover:text-yellow-300'
                  }`}
                >
                  🎉 EVENT
                </button>
                <button
                  onClick={() => setStep('wish')}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg font-bold transition-all truncate flex-1 ${
                    step === 'wish'
                      ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]'
                      : 'text-amber-300/70 hover:text-yellow-300'
                  }`}
                >
                  ✍️ WRITE WISH
                </button>
                <button
                  onClick={() => {
                    loadGlobalWishes();
                    setStep('view_all');
                  }}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg font-bold transition-all truncate flex-1 flex items-center justify-center gap-1 ${
                    step === 'view_all'
                      ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]'
                      : 'text-amber-300/70 hover:text-yellow-300'
                  }`}
                >
                  <FiMessageSquare className="w-3 h-3" /> ALL ({allWishes.length})
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all shrink-0"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-3 font-mono-custom custom-scrollbar">
              {/* SCREEN 1: BIRTHDAY ANNOUNCEMENT */}
              {step === 'info' && (
                <div className="space-y-3">
                  {/* Avatar with Crown — mt-6 ensures crown never clips on top */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative mt-5">
                    <img
                      src="/ghoda_cutout.png"
                      alt="Ghoda Aryan Birthday"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_15px_#FFD700]"
                    />
                    <span className="absolute -top-5 left-[42%] -translate-x-1/2 text-2xl sm:text-3xl animate-bounce">👑</span>
                  </div>

                  <div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-yellow-400 text-black font-display font-black text-[9px] sm:text-[10px] tracking-widest uppercase mb-1 animate-pulse">
                      🎉 TODAY&apos;S SPECIAL EVENT 🎉
                    </div>
                    <h3 className="font-display font-black text-lg sm:text-xl text-yellow-400 tracking-wider">
                      TODAY IS ARYAN&apos;S (GHODA) BIRTHDAY! 🎂
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-200/80 mt-0.5">
                      Wish a very Happy Birthday to the legendary Ghoda Horse Rider!
                    </p>
                  </div>

                  {/* Special Event Features List */}
                  <div className="bg-black/80 border border-yellow-500/30 rounded-xl p-2.5 sm:p-3 text-left text-[11px] sm:text-xs space-y-2 shadow-inner">
                    <div className="font-bold text-yellow-400 text-[10px] sm:text-[11px] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                      <FiGift className="w-3.5 h-3.5 text-yellow-400" />
                      <span>SPECIAL BIRTHDAY FEATURES ACTIVE TODAY:</span>
                    </div>

                    <div className="flex items-start gap-1.5 text-amber-200">
                      <span className="text-xs">🎂</span>
                      <div>
                        <strong className="text-yellow-300">Birthday Cake Powerups:</strong> Collect 🎂 cakes in Space Shooter for +1,000 pts, Quad Lasers &amp; Shield!
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-amber-200">
                      <span className="text-xs">⚡</span>
                      <div>
                        <strong className="text-yellow-300">Default Double Plasma Cannon:</strong> Start with 2x lasers immediately in Space Shooter!
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-amber-200">
                      <span className="text-xs">👑</span>
                      <div>
                        <strong className="text-yellow-300">Ghoda Birthday Boosts:</strong> Special crown badges &amp; boosted stats in games today!
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={handleContinueToWish}
                      className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-display font-black text-xs tracking-widest inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.5)] active:scale-95 transition-all"
                    >
                      <FiGift className="w-4 h-4 fill-black" />
                      <span>CONTINUE &amp; SEND BIRTHDAY WISH 🎂</span>
                    </button>

                    <button
                      onClick={() => {
                        loadGlobalWishes();
                        setStep('view_all');
                      }}
                      className="w-full py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 font-mono-custom text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <FiMessageSquare className="w-3.5 h-3.5 text-yellow-400" />
                      <span>SEE ALL GLOBAL BIRTHDAY WISHES ({allWishes.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 2: SEND BIRTHDAY WISH FORM */}
              {step === 'wish' && (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto relative mt-5">
                    <img
                      src="/ghoda_cutout.png"
                      alt="Ghoda Aryan"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_15px_#FFD700]"
                    />
                    <span className="absolute -top-4 left-[42%] -translate-x-1/2 text-2xl animate-bounce">👑</span>
                  </div>

                  <h3 className="font-display font-black text-lg text-yellow-400 tracking-wider">
                    SEND BIRTHDAY WISH TO ARYAN! 🎂
                  </h3>
                  <p className="text-[11px] text-amber-200/80">
                    Your wish will be posted globally to Supabase for everyone to see!
                  </p>

                  {wishSent ? (
                    <div className="py-6 font-mono-custom text-xs text-yellow-300 space-y-2 animate-pulse">
                      <FiCheckCircle className="w-8 h-8 mx-auto text-yellow-400" />
                      <div className="font-bold text-sm">BIRTHDAY WISH SENT TO SUPABASE! 🎉</div>
                      <div className="text-[10px] text-amber-400">Loading all global wishes now...</div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendWish} className="space-y-2.5 text-[11px] text-left">
                      <div>
                        <label className="block text-[9px] text-yellow-400 font-bold uppercase tracking-wider mb-0.5">
                          YOUR NAME:
                        </label>
                        <input
                          type="text"
                          value={wishAuthor}
                          onChange={(e) => setWishAuthor(e.target.value)}
                          placeholder="Enter your name..."
                          required
                          className="w-full bg-black/90 border border-yellow-500/40 rounded-xl px-3 py-2 text-yellow-300 font-mono-custom text-xs outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-yellow-400 font-bold uppercase tracking-wider mb-0.5">
                          YOUR BIRTHDAY MESSAGE FOR ARYAN:
                        </label>
                        <textarea
                          value={wishText}
                          onChange={(e) => setWishText(e.target.value)}
                          placeholder="Write a birthday wish for Ghoda Aryan..."
                          required
                          rows={2.5}
                          className="w-full bg-black/90 border border-yellow-500/40 rounded-xl px-3 py-2 text-yellow-300 font-mono-custom text-xs outline-none focus:border-yellow-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-display font-black text-xs tracking-widest inline-flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.5)] active:scale-95 transition-transform disabled:opacity-50 mt-1"
                      >
                        <FiHeart className="w-3.5 h-3.5 fill-black text-black" />
                        <span>{submitting ? 'SENDING TO SUPABASE...' : 'POST GLOBAL BIRTHDAY WISH 💖'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* SCREEN 3: VIEW ALL GLOBAL SUPABASE BIRTHDAY WISHES */}
              {step === 'view_all' && (
                <div className="space-y-2.5 text-left">
                  <div className="flex items-center justify-between border-b border-yellow-500/30 pb-1.5">
                    <div className="font-display font-black text-xs text-yellow-400 flex items-center gap-1.5">
                      <span>🎂 GLOBAL BIRTHDAY WISHES FOR ARYAN</span>
                    </div>
                    <button
                      onClick={loadGlobalWishes}
                      className="p-1 rounded-lg bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 text-[10px] flex items-center gap-1"
                    >
                      <FiRefreshCw className={`w-3 h-3 ${loadingWishes ? 'animate-spin' : ''}`} />
                      <span>REFRESH</span>
                    </button>
                  </div>

                  {loadingWishes ? (
                    <div className="py-10 text-center text-xs text-yellow-300/70 animate-pulse">
                      Loading global birthday wishes from Supabase...
                    </div>
                  ) : allWishes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-amber-200/70">
                      No birthday wishes posted yet! Be the first to send Aryan love!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {allWishes.map((w) => {
                        const cleanMsg = w.message.replace(/^🎂\s*\[BIRTHDAY WISH FOR ARYAN\]\s*/i, '').trim();
                        return (
                          <div
                            key={w.id}
                            className="bg-black/80 border border-yellow-500/30 rounded-xl p-2.5 text-[11px] shadow-md space-y-1"
                          >
                            <div className="flex justify-between items-center text-[10px] text-yellow-400">
                              <span className="font-bold flex items-center gap-1">
                                👑 {w.name}
                              </span>
                              <span className="text-amber-200/50 text-[9px]">{w.date} {w.time}</span>
                            </div>
                            <p className="text-amber-100/90 leading-relaxed font-sans text-xs">
                              {cleanMsg}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => setStep('wish')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-display font-black text-xs tracking-widest inline-flex items-center justify-center gap-2 mt-1 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                  >
                    <FiHeart className="w-3.5 h-3.5 fill-black" />
                    <span>WRITE A NEW BIRTHDAY WISH 🎂</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Floating Birthday Wish Button Component (Allows users to view/send wishes anytime!)
export function FloatingBirthdayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 z-40 px-3.5 py-2 rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-black font-mono-custom font-bold text-xs shadow-[0_0_20px_rgba(255,215,0,0.7)] border border-yellow-200 flex items-center gap-2 active:scale-95 transition-transform animate-bounce"
    >
      <span className="text-sm">👑🎂</span>
      <span className="hidden sm:inline font-display font-black tracking-wider">ARYAN&apos;S BIRTHDAY</span>
      <span className="sm:hidden font-display font-black">BIRTHDAY</span>
    </button>
  );
}
