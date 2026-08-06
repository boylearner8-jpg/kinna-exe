import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJourneyComments, insertJourneyComment, insertJourneyReply } from '../lib/db';
import type { JourneyComment, JourneyReply } from '../lib/db';
import { broadcastNewComment } from '../lib/realtime';
import { useSound } from '../hooks/useKinna';
import {
  FiMessageSquare,
  FiX,
  FiMessageCircle,
} from 'react-icons/fi';

const SAMPLE_COMMENTS: JourneyComment[] = [
  {
    id: 'sample-1',
    name: 'Aryan',
    comment: 'Bhai CJP paper leak fight mein 500ft Titan transformation legendary tha! 🔥🔥',
    date: '01 August 2026',
    time: '08:30 PM',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    replies: [
      {
        id: 'rep-1',
        comment_id: 'sample-1',
        name: 'Kinna',
        reply: 'Titan power is supreme bhai! 👑',
        date: '01 August 2026',
        time: '08:35 PM',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'sample-2',
    name: 'Motu Madhur',
    comment: 'Horse rally chapter was peak student revolution moment! Sector 009 highway full power 🏇📢',
    date: '02 August 2026',
    time: '04:15 PM',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Dehati Ayush',
    comment: 'Kinna bhai everywhere we go, police standard protocol starts sweating! 🫡',
    date: '03 August 2026',
    time: '09:10 AM',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

function formatInstagramTime(isoString?: string): string {
  if (!isoString) return '1m';
  const past = new Date(isoString).getTime();
  if (isNaN(past)) return '1m';
  const diffSec = Math.max(1, Math.floor((Date.now() - past) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 52) return `${diffWeeks}w`;
  return `${Math.floor(diffWeeks / 52)}y`;
}

export function FloatingCommentsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<JourneyComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('kinna_user_global_name') || '';
    } catch {
      return '';
    }
  });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Reply state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const { playClick, playSuccess } = useSound();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch comments on mount and when modal opens
  const loadComments = async () => {
    try {
      const data = await fetchJourneyComments();
      if (data && data.length > 0) {
        setComments(data);
      } else {
        setComments(SAMPLE_COMMENTS);
      }
    } catch (e) {
      setComments(SAMPLE_COMMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleOpen = () => {
    playClick();
    loadComments();
    try {
      const globalName = localStorage.getItem('kinna_user_global_name') || '';
      if (globalName) {
        setName(globalName);
      }
    } catch {}
    setIsOpen(true);
  };

  const handleClose = () => {
    playClick();
    setIsOpen(false);
    setReplyingCommentId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim() || 'Operative';
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    playClick();
    setIsSubmitting(true);

    try {
      localStorage.setItem('kinna_user_global_name', trimmedName);
    } catch {}

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
      replies: [],
    };

    try {
      await insertJourneyComment(newComment);
    } catch (err) {
      console.error('Failed to save comment:', err);
    }

    broadcastNewComment(trimmedName);
    playSuccess();

    setComments((prev) => [newComment, ...prev]);
    setIsSubmitting(false);
    setCommentText('');

    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 100);
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: string, authorName: string) => {
    e.preventDefault();
    const trimmedName = name.trim() || 'Operative';
    const trimmedReply = replyText.trim();
    if (!trimmedReply) return;

    playClick();
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

    try {
      await insertJourneyReply(newReply);
    } catch (err) {
      console.error('Failed to save reply:', err);
    }

    broadcastNewComment(trimmedName, `replied to ${authorName}: "${trimmedReply}"`);
    playSuccess();

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
    setReplyText('');
    setReplyingCommentId(null);
  };

  return (
    <>
      {/* Floating Left Corner Quick Icon Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button
          onClick={handleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative group flex items-center gap-2 px-4 py-3 rounded-full bg-black/90 border border-yellow-500/50 text-yellow-400 font-mono-custom text-xs shadow-[0_0_25px_rgba(255,215,0,0.35)] backdrop-blur-md hover:border-yellow-400 hover:shadow-[0_0_35px_rgba(255,215,0,0.6)] transition-all cursor-pointer"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>

          <FiMessageSquare className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />

          <span className="font-display font-bold tracking-wider text-yellow-300">
            COMMENTS
          </span>

          {/* Comment Count Badge */}
          <span className="ml-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-[10px] font-black text-yellow-400">
            {comments.length}
          </span>
        </motion.button>
      </div>

      {/* Modern Instagram-Style Cyberpunk Comments Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
            {/* Backdrop click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-md bg-black/95 border border-yellow-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.25)] flex flex-col h-[80vh] max-h-[680px] z-10"
            >
              {/* Modal Top Bar */}
              <div className="p-3.5 sm:p-4 bg-black/90 border-b border-yellow-500/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                    <FiMessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-yellow-400 tracking-wider">
                      COMMENTS ({comments.length})
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all active:scale-90"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Instagram-Style Vertical Comments Feed */}
              <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar" ref={scrollRef}>
                {loading ? (
                  <div className="text-center py-10 font-mono-custom text-xs text-yellow-500/50">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10 font-mono-custom text-xs text-yellow-500/50">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((com) => {
                    return (
                      <motion.div
                        key={com.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 group"
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-display font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(255,215,0,0.15)]">
                          {(com.name || 'A').charAt(0).toUpperCase()}
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                          {/* Header + Text */}
                          <div className="leading-snug">
                            <span className="font-display font-bold text-xs text-yellow-400 mr-2">
                              {com.name}
                            </span>
                            <span className="font-mono-custom text-[10px] text-yellow-500/50 mr-2">
                              {formatInstagramTime(com.created_at)}
                            </span>
                            <p className="font-sans text-xs text-yellow-100/90 whitespace-pre-wrap mt-0.5 leading-relaxed">
                              {com.comment}
                            </p>
                          </div>

                          {/* Action Row */}
                          <div className="flex items-center gap-4 text-[10px] font-mono-custom text-yellow-500/60 mt-1">
                            {/* Reply Action */}
                            <button
                              onClick={() => {
                                playClick();
                                setReplyingCommentId(replyingCommentId === com.id ? null : com.id);
                              }}
                              className="font-bold text-yellow-500/70 hover:text-yellow-400 cursor-pointer transition-colors"
                            >
                              Reply
                            </button>
                          </div>

                          {/* Compact Inline Reply Input */}
                          <AnimatePresence>
                            {replyingCommentId === com.id && (
                              <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={(e) => handleReplySubmit(e, com.id, com.name)}
                                className="mt-2.5 flex items-center gap-2"
                              >
                                <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold text-[9px] flex items-center justify-center shrink-0 border border-yellow-500/40">
                                  {(name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to ${com.name}...`}
                                  maxLength={180}
                                  autoFocus
                                  className="flex-1 text-xs bg-black/80 border border-yellow-500/30 rounded-full px-3 py-1 text-yellow-200 outline-none focus:border-yellow-400 font-sans"
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingReply || !replyText.trim()}
                                  className="text-yellow-400 hover:text-yellow-300 font-display font-black text-[11px] uppercase tracking-wider px-2 disabled:opacity-30 cursor-pointer"
                                >
                                  Post
                                </button>
                              </motion.form>
                            )}
                          </AnimatePresence>

                          {/* Indented Instagram-style Replies List */}
                          {com.replies && com.replies.length > 0 && (
                            <div className="pl-4 space-y-2.5 mt-2 border-l border-yellow-500/20">
                              {com.replies.map((rep) => {
                                return (
                                  <div key={rep.id} className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-display font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {(rep.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="leading-snug">
                                        <span className="font-display font-bold text-xs text-amber-300 mr-1.5">
                                          {rep.name}
                                        </span>
                                        <span className="font-mono-custom text-[9px] text-yellow-500/50">
                                          {formatInstagramTime(rep.created_at)}
                                        </span>
                                        <p className="font-sans text-xs text-yellow-100/90 whitespace-pre-wrap mt-0.5 leading-relaxed">
                                          {rep.reply}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Minimal Instagram-Style Bottom Composer Bar */}
              <form onSubmit={handleSubmit} className="p-3 bg-black border-t border-yellow-500/25 flex items-center gap-2 shrink-0">
                {/* User Avatar */}
                <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-display font-black text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,215,0,0.15)]">
                  {(name || 'A').charAt(0).toUpperCase()}
                </div>

                {/* Handle Input */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name..."
                  maxLength={25}
                  className="w-20 sm:w-24 bg-black/90 border border-yellow-500/30 rounded-full px-2.5 py-1.5 text-yellow-300 font-mono-custom text-[11px] text-center outline-none focus:border-yellow-400 shrink-0"
                />

                {/* Main Comment Single-Line Input */}
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={300}
                  className="flex-1 bg-black/90 border border-yellow-500/30 rounded-full px-3.5 py-1.5 text-yellow-100 font-sans text-xs outline-none focus:border-yellow-400 placeholder-yellow-500/40"
                />

                {/* Post Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="text-yellow-400 hover:text-yellow-300 font-display font-black text-xs tracking-wider px-2 py-1 uppercase disabled:opacity-30 cursor-pointer shrink-0 transition-opacity"
                >
                  Post
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
