import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import {
  fetchGuestbookMessages,
  insertGuestbookMessage,
  deleteGuestbookMessage,
} from '../../lib/db';
import {
  FiMessageSquare,
  FiUser,
  FiSend,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiLock,
  FiX,
} from 'react-icons/fi';

export interface GuestbookMessage {
  id: string;
  name: string;
  message: string;
  date: string;
  time: string;
  created_at: string;
}

const INITIAL_MESSAGES: GuestbookMessage[] = [
  {
    id: 'msg-seed-1',
    name: 'Aryan',
    message: 'Bhai website mast hai 😂🔥 All the best for the student fight!',
    date: '01 August 2026',
    time: '08:47 PM',
    created_at: '2026-08-01T20:47:00.000Z',
  },
  {
    id: 'msg-seed-2',
    name: 'Motu Madhur',
    message: 'Kinna bhai, horse rally ready hai whenever you call! CJP Bachao लोकतंत्र Bachao!',
    date: '01 August 2026',
    time: '06:15 PM',
    created_at: '2026-08-01T18:15:00.000Z',
  },
  {
    id: 'msg-seed-3',
    name: 'Advocate Bo',
    message: 'Legal authority flexing on Sector 009 highway complete. Justice for all students!',
    date: '01 August 2026',
    time: '04:30 PM',
    created_at: '2026-08-01T16:30:00.000Z',
  },
];

const ADMIN_PASSWORD = 'minaramchutiya';
const STORAGE_KEY = 'kinna_guestbook_messages_v2';

export function LeaveMessage() {
  const { ref } = useScrollReveal(0.1);
  const { playClick, playSuccess, playNotification } = useSound();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Seeded from localStorage; replaced by Supabase on mount
  const [messages, setMessages] = useState<GuestbookMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* silent */ }
    return INITIAL_MESSAGES;
  });

  // dbLoading state unused (UI shows seed data while loading)

  // Modal State for Add Message
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Password Delete Modal state
  const [deletingMessage, setDeletingMessage] = useState<GuestbookMessage | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      const remote = await fetchGuestbookMessages();
      if (remote.length > 0) {
        const merged = [...remote, ...INITIAL_MESSAGES.filter(
          (seed) => !remote.find((r) => r.id === seed.id)
        )];
        setMessages(merged);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      }
      // db load complete
    }
    loadFromSupabase();
  }, []);

  // Keep localStorage in sync as local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) { /* silent */ }
  }, [messages]);

  // Form validation & submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    playClick();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedMessage = messageText.trim();

    if (!trimmedName) {
      setValidationError('Please enter your name.');
      return;
    }

    if (!trimmedMessage) {
      setValidationError('Please write a message.');
      return;
    }

    if (trimmedMessage.length > 300) {
      setValidationError('Message cannot exceed 300 characters.');
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

    const newMessage: GuestbookMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: trimmedName,
      message: trimmedMessage,
      date: formattedDate,
      time: formattedTime,
      created_at: now.toISOString(),
    };

    // Save to Supabase (optimistic UI update)
    insertGuestbookMessage(newMessage).catch((err) =>
      console.error('Supabase insert failed:', err)
    );

    playSuccess();
    setMessages((prev) => [newMessage, ...prev]);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setName('');
    setMessageText('');

    setTimeout(() => {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }, 100);

    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAddModal(false);
    }, 1500);
  };

  // Trigger Delete Password Prompt
  const handlePromptDelete = (msg: GuestbookMessage) => {
    playNotification();
    setDeletingMessage(msg);
    setInputPassword('');
    setPasswordError(false);
    setDeleteSuccess(false);
  };

  // Confirm Delete with Password
  const handleConfirmDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      playSuccess();
      setPasswordError(false);
      setDeleteSuccess(true);
      const id = deletingMessage?.id;
      if (id) {
        deleteGuestbookMessage(id).catch((err) =>
          console.error('Supabase delete failed:', err)
        );
      }
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setDeletingMessage(null);
        setDeleteSuccess(false);
      }, 1000);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <section id="message" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.12) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header text-center mb-8">
          <span className="section-label flex items-center justify-center gap-2">
            <FiMessageSquare className="w-4 h-4 text-yellow-400" />
            ◆ PUBLIC GUESTBOOK TRANSMISSION
          </span>
          <h2 className="section-title">Add Message</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Leave a message for Kinna in the official public archives
          </p>
          <div className="section-divider mb-6" />

          {/* Action Bar: Add Message Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                playClick();
                setShowAddModal(true);
              }}
              className="btn-gold px-8 py-4 rounded-2xl font-display font-black text-sm tracking-widest inline-flex items-center gap-3 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-105 transition-all"
            >
              <FiPlus className="w-5 h-5 text-black font-bold" />
              <span>ADD MESSAGE</span>
            </button>
          </div>
        </div>

        {/* ═══ Scrollable Messages Window Terminal ═══ */}
        <div className="glass-card rounded-3xl border-2 border-yellow-500/30 shadow-[0_0_40px_rgba(255,215,0,0.15)] bg-black/90 overflow-hidden">
          {/* Terminal Header */}
          <div className="p-4 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="font-mono-custom text-xs font-bold text-yellow-400 tracking-wider ml-2">
                MESSAGES ARCHIVE TERMINAL
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-sm text-yellow-400">
                Messages ({messages.length})
              </span>
              <span className="font-mono-custom text-[10px] text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded">
                LIVE 🟢
              </span>
            </div>
          </div>

          {/* Scrollable Window Container */}
          <div
            ref={scrollContainerRef}
            className="p-6 max-h-[540px] overflow-y-auto space-y-4 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 215, 0, 0.3) transparent',
            }}
          >
            {messages.length > 0 ? (
              <AnimatePresence>
                {messages.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card-hover rounded-2xl p-5 border border-yellow-500/20 bg-black/80 shadow-[0_0_15px_rgba(255,215,0,0.05)] hover:shadow-[0_0_25px_rgba(255,215,0,0.2)] hover:border-yellow-400 transition-all duration-300 group relative"
                  >
                    {/* Top Row: Name & Timestamps & Delete */}
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-yellow-400 font-display font-black text-sm group-hover:scale-110 transition-transform">
                          👤
                        </div>
                        <div className="font-display font-bold text-base text-yellow-400 group-hover:text-yellow-300 transition-colors">
                          {item.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Timestamps */}
                        <div className="flex items-center gap-2 font-mono-custom text-xs text-yellow-500/70">
                          <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                            <FiCalendar className="w-3 h-3 text-yellow-400" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                            <FiClock className="w-3 h-3 text-yellow-400" />
                            <span>{item.time}</span>
                          </div>
                        </div>

                        {/* Delete Button (Password Protected) */}
                        <button
                          onClick={() => handlePromptDelete(item)}
                          title="Delete message (Requires Password)"
                          className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message Text */}
                    <div className="pl-10">
                      <p className="font-sans text-sm sm:text-base text-yellow-100/90 leading-relaxed font-normal whitespace-pre-wrap">
                        💬 "{item.message}"
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              /* Empty State */
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-3xl mb-4 animate-bounce">
                  💬
                </div>
                <h4 className="font-display font-bold text-xl text-yellow-400 mb-2">
                  No messages yet.
                </h4>
                <p className="font-mono-custom text-xs text-yellow-500/70 mb-4">
                  Be the first to leave a message for Kinna.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-gold px-6 py-2.5 rounded-xl font-display font-bold text-xs"
                >
                  ➕ ADD MESSAGE NOW
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Add Message Writing Modal ═══ */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl glass-card rounded-3xl border-2 border-yellow-500/50 p-6 sm:p-8 bg-black/95 shadow-[0_0_50px_rgba(255,215,0,0.25)] my-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors z-20"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-3 text-2xl">
                    <FiMessageSquare />
                  </div>
                  <h3 className="font-display font-black text-2xl text-yellow-400 mb-1">
                    ADD MESSAGE
                  </h3>
                  <p className="font-mono-custom text-xs text-yellow-500/60">
                    Write a classified transmission to be displayed in the public guestbook
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <FiCheckCircle className="w-14 h-14 text-green-400 mx-auto animate-bounce" />
                    <div className="font-display font-bold text-xl text-green-400">
                      MESSAGE SUBMITTED!
                    </div>
                    <p className="font-mono-custom text-xs text-yellow-500/70">
                      Your message is now live in the scrollable terminal.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Validation Error Banner */}
                    {validationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 flex items-center gap-2 font-mono-custom text-xs"
                      >
                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{validationError}</span>
                      </motion.div>
                    )}

                    {/* Name Input */}
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
                        className="w-full bg-black/70 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-100 placeholder-yellow-500/30 outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(255,215,0,0.25)] transition-all font-sans"
                      />
                    </div>

                    {/* Message Input with Character Counter */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-mono-custom text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FiMessageSquare className="w-3.5 h-3.5" />
                          MESSAGE <span className="text-red-500">*</span>
                        </label>
                        <span
                          className={`font-mono-custom text-[11px] ${
                            messageText.length >= 300 ? 'text-red-400 font-bold' : 'text-yellow-500/60'
                          }`}
                        >
                          ({messageText.length}/300)
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={messageText}
                        maxLength={300}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Write a message for Kinna..."
                        required
                        className="w-full bg-black/70 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-100 placeholder-yellow-500/30 outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(255,215,0,0.25)] transition-all font-sans leading-relaxed resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-gold py-4 rounded-2xl font-display font-black text-sm tracking-widest inline-flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-[1.01] transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="w-5 h-5 animate-spin text-black" />
                          <span>SUBMITTING...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4 text-black" />
                          <span>SUBMIT MESSAGE</span>
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
          {deletingMessage && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md glass-card rounded-3xl border-2 border-red-500/60 p-6 sm:p-8 bg-black/95 shadow-[0_0_50px_rgba(255,0,64,0.3)]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setDeletingMessage(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-3 text-2xl shadow-[0_0_15px_rgba(255,0,64,0.4)]">
                    <FiLock />
                  </div>
                  <h3 className="font-display font-black text-xl text-red-400 mb-1">
                    ADMIN PASSWORD REQUIRED
                  </h3>
                  <p className="font-mono-custom text-xs text-yellow-500/60">
                    Enter security password to permanently delete this message
                  </p>
                </div>

                {deleteSuccess ? (
                  <div className="py-6 text-center space-y-2">
                    <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    <div className="font-display font-bold text-lg text-green-400">
                      MESSAGE DELETED!
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
                      className="w-full py-3.5 rounded-xl bg-red-600 border border-red-400 text-white font-display font-black text-xs tracking-widest hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(255,0,64,0.4)]"
                    >
                      🗑️ CONFIRM DELETE
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
