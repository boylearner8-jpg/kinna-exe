import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import { KINNA_JOURNEY } from '../../data/content';
import {
  FiCompass,
  FiMapPin,
  FiRadio,
  FiAlertTriangle,
  FiChevronRight,
  FiChevronLeft,
  FiClock,
} from 'react-icons/fi';

export function KinnaJourney() {
  const { ref } = useScrollReveal(0.1);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const { playClick, playNotification } = useSound();

  const hasChapters = KINNA_JOURNEY.length > 0;
  const activeChapter = hasChapters ? KINNA_JOURNEY[activeChapterIndex] : null;

  const handleSelectChapter = (index: number) => {
    playClick();
    playNotification();
    setActiveChapterIndex(index);
  };

  return (
    <section id="journey" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Radar & Glow Effects */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
        }}
      />
      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiCompass className="w-4 h-4 text-yellow-400 animate-spin-slow" />
            ◆ CLASSIFIED EXPEDITION LOG
          </span>
          <h2 className="section-title">Kinna's Journey</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            The epic trajectory of mankind's most relaxed operative
          </p>
          <div className="section-divider" />
        </div>

        {!hasChapters ? (
          /* Empty State Placeholder */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-10 md:p-16 border-2 border-yellow-500/30 text-center max-w-3xl mx-auto shadow-[0_0_50px_rgba(255,215,0,0.1)] relative overflow-hidden"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 border border-yellow-400/40 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(255,215,0,0.2)] animate-pulse">
              📡
            </div>

            <span className="badge font-mono-custom text-xs mb-3 inline-block">
              SYSTEM STATUS: STANDBY
            </span>

            <h3 className="font-display font-black text-2xl md:text-3xl text-yellow-400 mb-3">
              JOURNEY REPOSITORY CLEARED
            </h3>

            <p className="font-mono-custom text-xs md:text-sm text-yellow-100/80 max-w-xl mx-auto leading-relaxed mb-6">
              All previous journey data has been wiped. Awaiting step-by-step journey transmission from Command.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-yellow-500/30 text-yellow-400/80 font-mono-custom text-xs">
              <FiClock className="w-4 h-4 text-yellow-400 animate-spin" />
              <span>READY FOR CUSTOM STEP-BY-STEP INPUT...</span>
            </div>
          </motion.div>
        ) : (
          /* Active Journey View */
          <>
            {/* Map / Timeline Nodes Bar */}
            <div className="glass-card rounded-2xl p-4 md:p-6 mb-8 border border-yellow-500/30 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-between min-w-[700px] relative px-4 py-2">
                {/* Connecting Track */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-yellow-500/20 rounded-full" />
                <motion.div
                  className="absolute left-8 h-1 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full shadow-[0_0_10px_#FFD700]"
                  animate={{
                    width: `${(activeChapterIndex / (KINNA_JOURNEY.length - 1)) * 90}%`,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />

                {/* Chapter Nodes */}
                {KINNA_JOURNEY.map((chapter, i) => {
                  const isActive = i === activeChapterIndex;
                  const isPast = i < activeChapterIndex;

                  return (
                    <div key={chapter.chapter} className="relative z-10 flex flex-col items-center">
                      <button
                        onClick={() => handleSelectChapter(i)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-mono-custom text-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-yellow-400 text-black border-2 border-yellow-200 shadow-[0_0_25px_#FFD700] scale-125'
                            : isPast
                            ? 'bg-yellow-950 text-yellow-400 border border-yellow-500/50 hover:scale-110'
                            : 'bg-black text-yellow-500/40 border border-yellow-500/20 hover:border-yellow-500/50'
                        }`}
                      >
                        <span>{chapter.icon}</span>
                      </button>

                      <div className="mt-2 text-center">
                        <span
                          className={`font-mono-custom text-[10px] uppercase tracking-wider block ${
                            isActive ? 'text-yellow-400 font-bold' : 'text-yellow-500/40'
                          }`}
                        >
                          {chapter.chapter}
                        </span>
                        <span
                          className={`font-display text-xs truncate max-w-[90px] block ${
                            isActive ? 'text-yellow-300' : 'text-yellow-500/30'
                          }`}
                        >
                          {chapter.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Chapter Details Box */}
            <AnimatePresence mode="wait">
              {activeChapter && (
                <motion.div
                  key={activeChapter.chapter}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="glass-card rounded-3xl p-6 md:p-10 border-2 border-yellow-500/40 shadow-[0_0_40px_rgba(255,215,0,0.15)] relative overflow-hidden mb-12"
                  onTouchStart={(e) => { (e.currentTarget as any)._touchStartX = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    const startX = (e.currentTarget as any)._touchStartX ?? 0;
                    const diff = startX - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 50) {
                      if (diff > 0 && activeChapterIndex < KINNA_JOURNEY.length - 1) handleSelectChapter(activeChapterIndex + 1);
                      if (diff < 0 && activeChapterIndex > 0) handleSelectChapter(activeChapterIndex - 1);
                    }
                  }}
                >
                  {/* Left click zone → previous chapter */}
                  {activeChapterIndex > 0 && (
                    <div
                      onClick={() => handleSelectChapter(activeChapterIndex - 1)}
                      className="absolute left-0 top-0 bottom-0 w-[45%] z-10 cursor-w-resize"
                    />
                  )}
                  {/* Right click zone → next chapter */}
                  {activeChapterIndex < KINNA_JOURNEY.length - 1 && (
                    <div
                      onClick={() => handleSelectChapter(activeChapterIndex + 1)}
                      className="absolute right-0 top-0 bottom-0 w-[45%] z-10 cursor-e-resize"
                    />
                  )}

                  {/* Subtle left/right edge arrows (appear on hover) */}
                  {activeChapterIndex > 0 && (
                    <div
                      onClick={() => handleSelectChapter(activeChapterIndex - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-black/70 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.3)] hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all">
                        <FiChevronLeft className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  )}
                  {activeChapterIndex < KINNA_JOURNEY.length - 1 && (
                    <div
                      onClick={() => handleSelectChapter(activeChapterIndex + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-black/70 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.3)] hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all">
                        <FiChevronRight className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  )}
                  {/* Top Classified Status Line */}
                  <div className="flex items-center justify-between border-b border-yellow-500/20 pb-4 mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="badge flex items-center gap-1.5 text-xs">
                        <FiRadio className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                        {activeChapter.chapter}
                      </span>
                      <span className="badge-danger text-xs flex items-center gap-1">
                        <FiAlertTriangle className="w-3.5 h-3.5" />
                        DANGER: {activeChapter.danger}
                      </span>
                    </div>

                    <div className="font-mono-custom text-xs text-yellow-500/60 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-yellow-400" />
                      <span>COORDS: {activeChapter.coords}</span>
                      <span>|</span>
                      <span>DATE: {activeChapter.date}</span>
                    </div>
                  </div>

                  {/* Chapter Header & Main Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="text-center lg:border-r lg:border-yellow-500/20 lg:pr-8 space-y-4">
                      {activeChapter.image ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-400/80 shadow-[0_0_25px_rgba(255,215,0,0.3)] max-w-[200px] mx-auto group">
                          <img
                            src={activeChapter.image}
                            alt={activeChapter.title}
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 font-mono-custom text-[9px] text-yellow-300 py-1 uppercase tracking-widest text-center">
                            EXHIBIT ATTACHMENT
                          </div>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent border-2 border-yellow-400/50 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                            {activeChapter.icon}
                          </div>
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-mono-custom font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                            {activeChapter.status}
                          </div>
                        </div>
                      )}

                      <div className="glass-card p-3 rounded-xl border border-yellow-500/20">
                        <div className="font-mono-custom text-[11px] text-yellow-500/60 uppercase tracking-widest">
                          {activeChapter.stat.label}
                        </div>
                        <div className="font-display font-black text-2xl text-yellow-400 drop-shadow-[0_0_10px_#FFD700]">
                          {activeChapter.stat.value}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-5">
                      <div>
                        <h3 className="font-display font-black text-2xl md:text-3xl text-yellow-400 mb-2">
                          {activeChapter.title}
                        </h3>
                        <div className="font-mono-custom text-xs text-yellow-500/50 uppercase tracking-widest mb-3">
                          LOCATION: {activeChapter.location}
                        </div>
                        <p className="text-yellow-100/90 text-sm md:text-base leading-relaxed">
                          {activeChapter.description}
                        </p>

                        {/* Multi-Photo Squad Gallery Grid */}
                        {activeChapter.galleryImages && (
                          <div className="pt-2">
                            <div className="font-mono-custom text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <span>📸 BROTHERHOOD PROTEST EXHIBITS ({activeChapter.galleryImages.length} OPERATIVES)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                              {activeChapter.galleryImages.map((imgSrc, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-yellow-500/40 group bg-black shadow-lg"
                                >
                                  <img
                                    src={imgSrc}
                                    alt={`Operative ${imgIdx + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                  <div className="absolute bottom-1 left-1 right-1 font-mono-custom text-[8px] text-yellow-300 font-bold truncate text-center">
                                    {imgIdx === 0 ? 'DEHATI AYUSH' : imgIdx === 1 ? 'MOTU MADHUR' : imgIdx === 2 ? 'ADVOCATE BO' : imgIdx === 3 ? 'ARYAN' : 'PANDIT BILAL'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="terminal-window p-4 rounded-xl border border-yellow-500/30 bg-black/80 font-mono-custom text-xs">
                        <div className="flex items-center gap-2 text-yellow-500/60 mb-2 border-b border-yellow-500/20 pb-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span>CLASSIFIED_INTELLIGENCE_AUDIO_LOG.DAT</span>
                        </div>
                        <p className="text-yellow-400/90 leading-relaxed italic">
                          "{activeChapter.classifiedLog}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="flex items-center justify-between border-t border-yellow-500/20 pt-6 mt-8">
                    <button
                      disabled={activeChapterIndex === 0}
                      onClick={() => handleSelectChapter(activeChapterIndex - 1)}
                      className={`btn-gold px-5 py-2.5 rounded-xl font-display text-xs flex items-center gap-2 ${
                        activeChapterIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      <FiChevronLeft className="w-4 h-4" /> PREVIOUS CHAPTER
                    </button>

                    <div className="font-mono-custom text-xs text-yellow-500/50 hidden sm:block">
                      CHAPTER {activeChapterIndex + 1} OF {KINNA_JOURNEY.length}
                    </div>

                    <button
                      disabled={activeChapterIndex === KINNA_JOURNEY.length - 1}
                      onClick={() => handleSelectChapter(activeChapterIndex + 1)}
                      className={`btn-gold px-5 py-2.5 rounded-xl font-display text-xs flex items-center gap-2 ${
                        activeChapterIndex === KINNA_JOURNEY.length - 1 ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      NEXT CHAPTER <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
