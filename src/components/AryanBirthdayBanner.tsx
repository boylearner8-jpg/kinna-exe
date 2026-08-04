import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiX, FiHeart } from 'react-icons/fi';
import confetti from 'canvas-confetti';

// Helper to check if today is Aryan's Birthday (August 5th)
export function isTodayAryanBirthday(): boolean {
  const now = new Date();
  // Month is 0-indexed (7 = August), Date is 5
  return now.getMonth() === 7 && now.getDate() === 5;
}

export function AryanBirthdayBanner() {
  const [showModal, setShowModal] = useState(false);
  const [wishSent, setWishSent] = useState(false);
  const [wishText, setWishText] = useState('');
  const [wishAuthor, setWishAuthor] = useState('');

  // Trigger confetti burst on load for Aryan's Birthday
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.15 },
        colors: ['#FFD700', '#FF0055', '#00E5FF', '#A855F7'],
      });
    } catch {}
  }, []);

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

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;

    triggerConfetti();
    setWishSent(true);
    setTimeout(() => {
      setShowModal(false);
      setWishSent(false);
      setWishText('');
    }, 2500);
  };

  return (
    <>
      {/* Top Special Birthday Banner */}
      <div className="relative z-50 bg-gradient-to-r from-amber-600/90 via-yellow-500/90 to-amber-600/90 border-b-2 border-yellow-300 text-black py-2.5 px-4 font-mono-custom shadow-[0_0_30px_rgba(255,215,0,0.6)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            {/* Ghoda Aryan Avatar with Golden Crown */}
            <div className="relative w-10 h-10 shrink-0">
              <img
                src="/ghoda_cutout.png"
                alt="Ghoda Aryan Birthday"
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_#fff]"
              />
              <span className="absolute -top-2 -right-1 text-base animate-bounce">👑</span>
            </div>

            <div>
              <div className="font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 text-black">
                <span>🎂 TODAY IS ARYAN&apos;S (GHODA) BIRTHDAY! 🎉</span>
                <span className="px-2 py-0.5 rounded-full bg-black text-yellow-300 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                  SPECIAL EVENT
                </span>
              </div>
              <p className="text-[11px] font-bold text-black/80">
                Happy Birthday to the legendary Ghoda Horse Rider! Celebrate today!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerConfetti();
                setShowModal(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black font-display font-black text-xs tracking-wider inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
            >
              <FiGift className="w-4 h-4 text-yellow-400" />
              <span>SEND WISH 🎂</span>
            </button>
          </div>
        </div>
      </div>

      {/* Birthday Wish Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card rounded-2xl max-w-md w-full p-6 border-2 border-yellow-400 relative text-center shadow-[0_0_50px_rgba(255,215,0,0.5)]"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              >
                <FiX className="w-4 h-4" />
              </button>

              <div className="w-24 h-24 mx-auto mb-2 relative">
                <img
                  src="/ghoda_cutout.png"
                  alt="Ghoda Aryan"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_20px_#FFD700]"
                />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>
              </div>

              <h3 className="font-display font-black text-xl text-yellow-400 mb-1 tracking-wider">
                HAPPY BIRTHDAY ARYAN! 🎂
              </h3>
              <p className="font-mono-custom text-xs text-amber-200/80 mb-4">
                Leave your special birthday message for Ghoda Aryan!
              </p>

              {wishSent ? (
                <div className="py-6 font-mono-custom text-sm text-yellow-300 space-y-2 animate-pulse">
                  <div className="text-3xl">🎉 🎂 👑</div>
                  <div className="font-bold text-base">BIRTHDAY WISH SENT TO ARYAN!</div>
                  <div className="text-xs text-amber-400">Thanks for celebrating Ghoda&apos;s special day!</div>
                </div>
              ) : (
                <form onSubmit={handleSendWish} className="space-y-3 font-mono-custom text-xs">
                  <input
                    type="text"
                    value={wishAuthor}
                    onChange={(e) => setWishAuthor(e.target.value)}
                    placeholder="Your Name..."
                    required
                    className="w-full bg-black/90 border border-yellow-500/40 rounded-xl px-3 py-2 text-yellow-300 font-mono-custom text-xs outline-none focus:border-yellow-400"
                  />
                  <textarea
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Write a birthday wish for Aryan (Ghoda)..."
                    required
                    rows={3}
                    className="w-full bg-black/90 border border-yellow-500/40 rounded-xl px-3 py-2 text-yellow-300 font-mono-custom text-xs outline-none focus:border-yellow-400"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-display font-black text-xs tracking-widest inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.5)] active:scale-95 transition-transform"
                  >
                    <FiHeart className="w-4 h-4 fill-black text-black" />
                    <span>SEND BIRTHDAY LOVE 💖</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
