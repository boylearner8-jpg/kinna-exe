import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import {
  fetchJourneyComments,
  insertJourneyComment,
  deleteJourneyComment,
  insertJourneyReply,
  deleteJourneyReply,
  migrateLocalStorageToSupabase,
} from '../../lib/db';
import type { JourneyReply } from '../../lib/db';
import { broadcastNewComment } from '../../lib/realtime';
import { KINNA_JOURNEY } from '../../data/content';
import {
  FiCompass,
  FiMapPin,
  FiRadio,
  FiAlertTriangle,
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiMessageCircle,
  FiUser,
  FiSend,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiX,
  FiPlus,
  FiLoader,
} from 'react-icons/fi';

export interface JourneyComment {
  id: string;
  name: string;
  comment: string;
  date: string;
  time: string;
  created_at: string;
  replies?: JourneyReply[];
}

const INITIAL_JOURNEY_COMMENTS: JourneyComment[] = [
  {
    id: 'jcom-1',
    name: 'Aryan',
    comment: 'Bhai CJP paper leak fight mein 500ft Titan transformation legendary tha! 🔥🔥',
    date: '01 August 2026',
    time: '09:15 PM',
    created_at: '2026-08-01T21:15:00.000Z',
  },
  {
    id: 'jcom-2',
    name: 'Motu Madhur',
    comment: 'Horse rally chapter was peak student revolution moment! Sector 009 highway full power 🏇📢',
    date: '01 August 2026',
    time: '07:40 PM',
    created_at: '2026-08-01T19:40:00.000Z',
  },
];

const ADMIN_PASSWORD = 'minaramchutiya';
const STORAGE_KEY = 'kinna_journey_comments_v1';
function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'just now';
  const now = Date.now();
  const past = new Date(isoString).getTime();
  if (isNaN(past)) return 'just now';

  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  return `${Math.floor(diffMonths / 12)}y ago`;
}

export function KinnaJourney() {
  const { ref } = useScrollReveal(0.1);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const { playClick, playSuccess, playNotification } = useSound();
  const scrollCommentsRef = useRef<HTMLDivElement>(null);

  const hasChapters = KINNA_JOURNEY.length > 0;
  const activeChapter = hasChapters ? KINNA_JOURNEY[activeChapterIndex] : null;

  // Comments state — seeded from localStorage, then replaced by Supabase
  const [comments, setComments] = useState<JourneyComment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* silent */ }
    return INITIAL_JOURNEY_COMMENTS;
  });

  // dbLoading state unused (UI shows seed data while loading)

  // Modal State for Add Comment
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

  // Comment Form States
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete Modal States
  const [deletingComment, setDeletingComment] = useState<JourneyComment | null>(null);
  const [deletingReply, setDeletingReply] = useState<JourneyReply | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Inline Reply Form States
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyValidationError, setReplyValidationError] = useState<string | null>(null);

  // Toggle exact timestamp display for comments/replies
  const [expandedTimeId, setExpandedTimeId] = useState<string | null>(null);

  // Load from Supabase on mount + run one-time migration
  useEffect(() => {
    async function loadFromSupabase() {
      await migrateLocalStorageToSupabase();
      const remote = await fetchJourneyComments();
      if (remote.length > 0) {
        const merged = [...remote, ...INITIAL_JOURNEY_COMMENTS.filter(
          (seed) => !remote.find((r) => r.id === seed.id)
        )];
        setComments(merged);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      }
      // db load complete
    }
    loadFromSupabase();
  }, []);

  // Keep localStorage in sync as local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (e) { /* silent */ }
  }, [comments]);

  const handleSelectChapter = (index: number) => {
    playClick();
    playNotification();
    setActiveChapterIndex(index);
  };

  // Submit Journey Comment
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    playClick();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedComment = commentText.trim();

    if (!trimmedName) {
      setValidationError('Please enter your name.');
      return;
    }

    if (!trimmedComment) {
      setValidationError('Please write your opinion.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newComment: JourneyComment = {
      id: `jcom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmedName,
      comment: trimmedComment,
      date: formattedDate,
      time: formattedTime,
      created_at: now.toISOString(),
    };

    // Save to Supabase (optimistic UI update regardless)
    insertJourneyComment(newComment).catch((err) =>
      console.error('Supabase insert failed:', err)
    );

    // Broadcast realtime toast notification to all active visitors
    broadcastNewComment(trimmedName);

    playSuccess();
    setComments((prev) => [newComment, ...prev]);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setName('');
    setCommentText('');

    setTimeout(() => {
      if (scrollCommentsRef.current) scrollCommentsRef.current.scrollTop = 0;
    }, 100);

    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAddCommentModal(false);
    }, 1500);
  };

  // Delete Comment Trigger
  const handlePromptDelete = (com: JourneyComment) => {
    playNotification();
    setDeletingComment(com);
    setInputPassword('');
    setPasswordError(false);
    setDeleteSuccess(false);
  };

  // Confirm Password Delete
  const handleConfirmDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      playSuccess();
      setPasswordError(false);
      setDeleteSuccess(true);
      const id = deletingComment?.id;
      if (id) {
        deleteJourneyComment(id).catch((err) =>
          console.error('Supabase delete failed:', err)
        );
      }
      setTimeout(() => {
        setComments((prev) => prev.filter((c) => c.id !== id));
        setDeletingComment(null);
        setDeleteSuccess(false);
      }, 1000);
    } else {
      setPasswordError(true);
    }
  };

  // Submit Inline Reply
  const handleReplySubmit = async (e: FormEvent, commentId: string, parentAuthorName: string) => {
    e.preventDefault();
    playClick();
    setReplyValidationError(null);

    const trimmedName = replyName.trim();
    const trimmedReply = replyText.trim();

    if (!trimmedName) {
      setReplyValidationError('Please enter your name.');
      return;
    }

    if (!trimmedReply) {
      setReplyValidationError('Please write a reply.');
      return;
    }

    setIsSubmittingReply(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newReply: JourneyReply = {
      id: `jrep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      comment_id: commentId,
      name: trimmedName,
      reply: trimmedReply,
      date: formattedDate,
      time: formattedTime,
      created_at: now.toISOString(),
    };

    // Save reply to Supabase
    insertJourneyReply(newReply).catch((err) =>
      console.error('Supabase reply insert failed:', err)
    );

    // Broadcast toast alert
    broadcastNewComment(trimmedName, `replied to ${parentAuthorName}: "${trimmedReply}"`);

    playSuccess();

    // Optimistically update local comments state with new reply
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setIsSubmittingReply(false);
    setReplyName('');
    setReplyText('');
    setReplyingToCommentId(null);
  };

  // Trigger Delete Reply Prompt
  const handlePromptDeleteReply = (rep: JourneyReply) => {
    playNotification();
    setDeletingReply(rep);
    setInputPassword('');
    setPasswordError(false);
    setDeleteSuccess(false);
  };

  // Confirm Delete Reply Password
  const handleConfirmDeleteReply = async (e: FormEvent) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      playSuccess();
      setPasswordError(false);
      setDeleteSuccess(true);
      const id = deletingReply?.id;
      if (id) {
        deleteJourneyReply(id).catch((err) =>
          console.error('Supabase reply delete failed:', err)
        );
      }
      setTimeout(() => {
        setComments((prev) =>
          prev.map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r.id !== id),
          }))
        );
        setDeletingReply(null);
        setDeleteSuccess(false);
      }, 1000);
    } else {
      setPasswordError(true);
    }
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* 💬 JOURNEY OPINIONS & COMMENTS TERMINAL WINDOW */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div id="journey-comments" className="glass-card rounded-3xl border-2 border-yellow-500/30 bg-black/90 shadow-[0_0_30px_rgba(255,215,0,0.12)] overflow-hidden">
          {/* Header Bar with ADD YOUR COMMENT Button */}
          <div className="p-5 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <FiMessageCircle className="w-5 h-5 text-yellow-400" />
              <h3 className="font-display font-black text-xl text-yellow-400 tracking-wide">
                JOURNEY OPINIONS ({comments.length})
              </h3>
            </div>

            {/* ➕ ADD YOUR COMMENT BUTTON */}
            <button
              onClick={() => {
                playClick();
                setShowAddCommentModal(true);
              }}
              className="btn-gold px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:scale-105 transition-all"
            >
              <FiPlus className="w-4 h-4 text-black font-bold" />
              <span>ADD YOUR COMMENT</span>
            </button>
          </div>

          {/* Scrollable Comments Container */}
          <div
            ref={scrollCommentsRef}
            className="p-6 max-h-[480px] overflow-y-auto space-y-4 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 215, 0, 0.3) transparent',
            }}
          >
            {comments.length > 0 ? (
              <AnimatePresence>
                {comments.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card-hover rounded-2xl p-4 sm:p-5 border border-yellow-500/20 bg-black/80 shadow-[0_0_15px_rgba(255,215,0,0.05)] hover:border-yellow-400 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-xs text-yellow-400 font-bold flex-shrink-0">
                          👤
                        </div>
                        <span className="font-display font-bold text-sm text-yellow-400">
                          {c.name}
                        </span>

                        {/* Compact relative time next to user name (Clickable for exact Date & Time) */}
                        <button
                          onClick={() => setExpandedTimeId(expandedTimeId === c.id ? null : c.id)}
                          className="font-mono-custom text-xs text-yellow-500/60 hover:text-yellow-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Click to view exact date and time"
                        >
                          <span className="text-yellow-500/30">•</span>
                          <span>{formatTimeAgo(c.created_at)}</span>
                          {expandedTimeId === c.id && (
                            <span className="text-[10px] text-yellow-400 font-mono-custom font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30 ml-1">
                              ({c.date} at {c.time})
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Delete Comment Button */}
                      <button
                        onClick={() => handlePromptDelete(c)}
                        title="Delete opinion (Requires Password)"
                        className="w-6 h-6 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Comment Body Text */}
                    <p className="font-sans text-xs sm:text-sm text-yellow-100/90 leading-relaxed pl-9 whitespace-pre-wrap mb-3">
                      {c.comment}
                    </p>

                    {/* ─── REPLY SECTION DIRECTLY UNDER COMMENT BODY ─── */}
                    <div className="pl-9 mb-2">
                      <button
                        onClick={() => {
                          playClick();
                          setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id);
                          setReplyValidationError(null);
                        }}
                        className={`px-3 py-1 rounded-lg border text-xs font-mono-custom inline-flex items-center gap-1.5 transition-all ${
                          replyingToCommentId === c.id
                            ? 'bg-yellow-500 text-black border-yellow-400 font-bold shadow-[0_0_10px_#FFD700]'
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                        }`}
                      >
                        <FiMessageCircle className="w-3.5 h-3.5" />
                        <span>Reply {c.replies && c.replies.length > 0 ? `(${c.replies.length})` : ''}</span>
                      </button>
                    </div>

                    {/* ─── INLINE REPLY FORM ─── */}
                    <AnimatePresence>
                      {replyingToCommentId === c.id && (
                        <motion.form
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          onSubmit={(e) => handleReplySubmit(e, c.id, c.name)}
                          className="ml-4 sm:ml-9 p-4 rounded-xl border border-yellow-500/30 bg-black/90 space-y-3 relative mb-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono-custom text-[11px] text-yellow-400 font-bold tracking-wider uppercase flex items-center gap-1">
                              <span>↩ Replying to</span>
                              <span className="text-yellow-300 font-bold">{c.name}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setReplyingToCommentId(null)}
                              className="text-yellow-500/50 hover:text-yellow-400 text-xs"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>

                          {replyValidationError && (
                            <div className="flex items-center gap-1.5 text-red-400 font-mono-custom text-xs">
                              <FiAlertCircle className="w-3.5 h-3.5" />
                              <span>{replyValidationError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <input
                                type="text"
                                value={replyName}
                                onChange={(e) => setReplyName(e.target.value)}
                                placeholder="Your Name *"
                                className="w-full bg-black/60 border border-yellow-500/30 rounded-lg p-2.5 text-xs text-yellow-100 font-mono-custom outline-none focus:border-yellow-400"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Write your reply to ${c.name}... *`}
                                className="w-full bg-black/60 border border-yellow-500/30 rounded-lg p-2.5 text-xs text-yellow-100 font-sans outline-none focus:border-yellow-400"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingToCommentId(null)}
                              className="px-3 py-1.5 rounded-lg border border-yellow-500/20 text-yellow-500/60 font-mono-custom text-xs hover:text-yellow-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingReply}
                              className="btn-gold px-4 py-1.5 rounded-lg font-display font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] disabled:opacity-50"
                            >
                              {isSubmittingReply ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiSend className="w-3.5 h-3.5" />
                              )}
                              <span>POST REPLY</span>
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* ─── NESTED REPLIES LIST UNDER COMMENT ─── */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-3 ml-4 sm:ml-9 space-y-2 border-l-2 border-yellow-500/20 pl-3">
                        {c.replies.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-xl p-3 border border-yellow-500/15 bg-yellow-500/5 hover:border-yellow-500/30 transition-all group/rep"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-yellow-400">↳</span>
                                <span className="font-display font-bold text-xs text-yellow-300">
                                  {r.name}
                                </span>
                                {/* Compact relative timestamp for reply */}
                                <button
                                  onClick={() => setExpandedTimeId(expandedTimeId === r.id ? null : r.id)}
                                  className="font-mono-custom text-[11px] text-yellow-500/60 hover:text-yellow-300 cursor-pointer"
                                  title="Click to view exact date and time"
                                >
                                  • {formatTimeAgo(r.created_at)}
                                  {expandedTimeId === r.id && (
                                    <span className="text-[10px] text-yellow-400 font-mono-custom font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/30 ml-1">
                                      ({r.date} at {r.time})
                                    </span>
                                  )}
                                </button>
                              </div>

                              <button
                                onClick={() => handlePromptDeleteReply(r)}
                                title="Delete reply"
                                className="opacity-60 group-hover/rep:opacity-100 text-red-400 hover:text-red-300 p-0.5"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="font-sans text-xs text-yellow-100/80 pl-4 leading-relaxed">
                              {r.reply}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-12 text-center font-mono-custom text-xs text-yellow-500/50">
                No opinions posted yet. Click <strong>ADD YOUR COMMENT</strong> to be the first!
              </div>
            )}
          </div>
        </div>

        {/* ═══ Add Journey Comment Modal ═══ */}
        <AnimatePresence>
          {showAddCommentModal && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg glass-card rounded-3xl border-2 border-yellow-500/50 p-6 sm:p-8 bg-black/95 shadow-[0_0_50px_rgba(255,215,0,0.25)] my-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowAddCommentModal(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-3 text-2xl">
                    <FiMessageCircle />
                  </div>
                  <h3 className="font-display font-black text-2xl text-yellow-400 mb-1">
                    ADD YOUR COMMENT
                  </h3>
                  <p className="font-mono-custom text-xs text-yellow-500/60">
                    Share your thoughts & opinions on Kinna's legendary journey
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <FiCheckCircle className="w-14 h-14 text-green-400 mx-auto animate-bounce" />
                    <div className="font-display font-bold text-xl text-green-400">
                      OPINION POSTED!
                    </div>
                    <p className="font-mono-custom text-xs text-yellow-500/70">
                      Your comment is now live in the scrollable journey archives.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    {validationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 font-mono-custom text-xs flex items-center gap-2"
                      >
                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{validationError}</span>
                      </motion.div>
                    )}

                    <div>
                      <label className="block font-mono-custom text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5" />
                        NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Enter your name..."
                        required
                        className="w-full bg-black/70 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-100 placeholder-yellow-500/30 outline-none focus:border-yellow-400 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-custom text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiMessageCircle className="w-3.5 h-3.5" />
                        YOUR COMMENT / OPINION <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={commentText}
                        onChange={(e) => {
                          setCommentText(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Write your thoughts on Kinna's journey..."
                        required
                        className="w-full bg-black/70 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-100 placeholder-yellow-500/30 outline-none focus:border-yellow-400 transition-all font-sans leading-relaxed resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-gold py-4 rounded-2xl font-display font-black text-sm tracking-widest inline-flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-[1.01] transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="w-5 h-5 animate-spin text-black" />
                          <span>POSTING...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4 text-black" />
                          <span>SUBMIT COMMENT</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ Password-Protected Delete Modal ═══ */}
        <AnimatePresence>
          {deletingComment && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md glass-card rounded-3xl border-2 border-red-500/60 p-6 bg-black/95 shadow-[0_0_50px_rgba(255,0,64,0.3)]"
              >
                <button
                  onClick={() => setDeletingComment(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-3 text-xl shadow-[0_0_15px_rgba(255,0,64,0.4)]">
                    <FiLock />
                  </div>
                  <h3 className="font-display font-black text-lg text-red-400 mb-1">
                    ADMIN PASSWORD REQUIRED
                  </h3>
                  <p className="font-mono-custom text-xs text-yellow-500/60">
                    Enter security password to delete this journey opinion
                  </p>
                </div>

                {deleteSuccess ? (
                  <div className="py-4 text-center space-y-2">
                    <FiCheckCircle className="w-10 h-10 text-green-400 mx-auto" />
                    <div className="font-display font-bold text-base text-green-400">
                      OPINION DELETED!
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmDelete} className="space-y-4">
                    <div>
                      <label className="block font-mono-custom text-xs text-red-400 font-bold mb-2">
                        ENTER PASSWORD
                      </label>
                      <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => {
                          setInputPassword(e.target.value);
                          setPasswordError(false);
                        }}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-black/80 border-2 border-red-500/40 rounded-xl p-3 text-center text-base text-yellow-300 font-mono-custom outline-none focus:border-red-400 tracking-widest"
                      />
                      {passwordError && (
                        <div className="mt-2 text-red-500 font-mono-custom text-xs flex items-center justify-center gap-1.5 font-bold">
                          <FiAlertCircle className="w-4 h-4" />
                          <span>INVALID PASSWORD! ACCESS DENIED.</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-red-600 border border-red-400 text-white font-display font-black text-xs tracking-widest hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(255,0,64,0.4)]"
                    >
                      🗑️ CONFIRM DELETE
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ Password-Protected Delete Reply Modal ═══ */}
        <AnimatePresence>
          {deletingReply && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md glass-card rounded-3xl border-2 border-red-500/60 p-6 bg-black/95 shadow-[0_0_50px_rgba(255,0,64,0.3)]"
              >
                <button
                  onClick={() => setDeletingReply(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-3 text-xl shadow-[0_0_15px_rgba(255,0,64,0.4)]">
                    <FiLock />
                  </div>
                  <h3 className="font-display font-black text-lg text-red-400 mb-1">
                    ADMIN PASSWORD REQUIRED
                  </h3>
                  <p className="font-mono-custom text-xs text-yellow-500/60">
                    Enter security password to delete this reply by {deletingReply.name}
                  </p>
                </div>

                {deleteSuccess ? (
                  <div className="py-4 text-center space-y-2">
                    <FiCheckCircle className="w-10 h-10 text-green-400 mx-auto" />
                    <div className="font-display font-bold text-base text-green-400">
                      REPLY DELETED!
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmDeleteReply} className="space-y-4">
                    <div>
                      <label className="block font-mono-custom text-xs text-red-400 font-bold mb-2">
                        ENTER PASSWORD
                      </label>
                      <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => {
                          setInputPassword(e.target.value);
                          setPasswordError(false);
                        }}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-black/80 border-2 border-red-500/40 rounded-xl p-3 text-center text-base text-yellow-300 font-mono-custom outline-none focus:border-red-400 tracking-widest"
                      />
                      {passwordError && (
                        <div className="mt-2 text-red-500 font-mono-custom text-xs flex items-center justify-center gap-1.5 font-bold">
                          <FiAlertCircle className="w-4 h-4" />
                          <span>INVALID PASSWORD! ACCESS DENIED.</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-red-600 border border-red-400 text-white font-display font-black text-xs tracking-widest hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(255,0,64,0.4)]"
                    >
                      🗑️ CONFIRM DELETE REPLY
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
