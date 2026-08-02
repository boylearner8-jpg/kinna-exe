import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import {
  fetchGalleryMemories,
  insertGalleryMemory,
  deleteGalleryMemory,
} from '../../lib/db';
import {
  FiX,
  FiZoomIn,
  FiHeart,
  FiCamera,
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiLock,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

export interface GalleryMemory {
  id: string;
  image: string;
  memoryText: string;
  date?: string;
  tag?: string;
  isPublic?: boolean;
}

export const INITIAL_MEMORIES_LIST: GalleryMemory[] = [
  {
    id: 'mem-1',
    image: '/gallery_heart_hacker.jpg',
    memoryText: 'Heart Hacker Aryan holding the sacred heart model — a true symbol of squad brotherhood & unconditional support.',
    date: 'MEMORY #01',
    tag: 'BROTHERHOOD',
  },
  {
    id: 'mem-2',
    image: '/gallery_kinna_sprint.jpg',
    memoryText: 'Kinna sprinting with the megaphone through the streets of Delhi with riot police in full chase — pure fearless adrenaline!',
    date: 'MEMORY #02',
    tag: 'THE GREAT CHASE',
  },
  {
    id: 'mem-3',
    image: '/gallery_dehati_ayush.jpg',
    memoryText: 'Dehati Ayush with his towel at Jantar Mantar holding high the banner of truth & solidarity.',
    date: 'MEMORY #03',
    tag: 'FRONT LINES',
  },
  {
    id: 'mem-4',
    image: '/gallery_motu_madhur.jpg',
    memoryText: 'Motu Madhur wearing his Jack & Jones sweater, holding the CJP Bachao लोकतंत्र Bachao sign at the protest.',
    date: 'MEMORY #04',
    tag: 'REVOLUTION',
  },
  {
    id: 'mem-5',
    image: '/gallery_kinna_password.jpg',
    memoryText: 'Client says he forgot his password... Kinna holding up phone with family wallpaper for technical support!',
    date: 'MEMORY #05',
    tag: 'TECH SUPPORT MEME',
  },
  {
    id: 'mem-6',
    image: '/gallery_aryan_fauji.jpg',
    memoryText: 'Future K Fauji — Army Aryan in full camo helmet with his eternal dream!',
    date: 'MEMORY #06',
    tag: 'ARMY ARYAN',
  },
  {
    id: 'mem-7',
    image: '/gallery_cosmic_duo.jpg',
    memoryText: 'Kinna & Madhur harnessing cosmic lightning energy and galaxy powers across the universe!',
    date: 'MEMORY #07',
    tag: 'COSMIC DUO',
  },
  {
    id: 'mem-8',
    image: '/gallery_titan_battle.jpg',
    memoryText: 'The legendary Clash of Titans — Father Pradhan Ji vs Titan Kinna in a fight for legacy and truth!',
    date: 'MEMORY #08',
    tag: 'TITAN BATTLE',
  },
  {
    id: 'mem-9',
    image: '/gallery_newspaper_meme.jpg',
    memoryText: 'Front-page viral newspaper headline from Dainik Janvani: "इंटरनेट पर वायरल हुआ बंदर, लोग बोले - किन्ना?"',
    date: 'MEMORY #09',
    tag: 'VIRAL NEWSPAPER',
  },
  {
    id: 'mem-10',
    image: '/gallery_bo_highway_power.jpg',
    memoryText: 'Advocate Bo in his crown & royal cape flexing legal authority on Sector 009 highway while police bow down!',
    date: 'MEMORY #10',
    tag: 'ADVOCATE BO',
  },
  {
    id: 'mem-11',
    image: '/gallery_babasaheb_archive.jpg',
    memoryText: 'The 1947 archive of Dr. Babasaheb Ambedkar — the foundational inspiration behind Kinna\'s fight for equality & justice.',
    date: 'MEMORY #11',
    tag: 'HISTORIC ARCHIVE',
  },
  {
    id: 'mem-12',
    image: '/gallery_kinna_arrested.jpg',
    memoryText: 'Kinna raising the victory sign to news cameras while being arrested at Jantar Mantar — total unshakeable defiance!',
    date: 'MEMORY #12',
    tag: 'VICTORY SIGN',
  },
  {
    id: 'mem-13',
    image: '/gallery_pandit_bilal.jpg',
    memoryText: 'Pandit Bilal holding high his CJP banner at the rally with his signature smiling face!',
    date: 'MEMORY #13',
    tag: 'PANDIT BILAL',
  },
  {
    id: 'mem-14',
    image: '/gallery_aryan_child_rescue.jpg',
    memoryText: 'Army Officer Aryan in camo uniform safely hugging and protecting young children during the student rescue operation.',
    date: 'MEMORY #14',
    tag: 'HEROIC RESCUE',
  },
  {
    id: 'mem-15',
    image: '/gallery_kinna_titan_delhi.jpg',
    memoryText: 'Kinna transforming into a 500ft Colossal Titan over Delhi skyline during the ultimate awakening!',
    date: 'MEMORY #15',
    tag: 'TITAN AWAKENING',
  },
  {
    id: 'mem-16',
    image: '/gallery_father_and_son_frame.jpg',
    memoryText: 'Classic framed portrait of Pradhan Ji & Kinna — Father & Son memory before the truth was revealed.',
    date: 'MEMORY #16',
    tag: 'FAMILY PORTRAIT',
  },
  {
    id: 'mem-17',
    image: '/gallery_aryan_protest_sign.jpg',
    memoryText: 'Heart Hacker Aryan standing firm at the protest grounds holding high the "CJP Bachao लोकतंत्र Bachao" sign!',
    date: 'MEMORY #17',
    tag: 'PROTEST LEADER',
  },
  {
    id: 'mem-18',
    image: '/gallery_jansamvad_horse_news.jpg',
    memoryText: 'Front page newspaper report from Jansamvad: "CJP प्रदर्शन में मधुर अपने आर्यन घोड़े पर सवार, उठा न्याय की आवाज"!',
    date: 'MEMORY #18',
    tag: 'HORSE MARCH NEWS',
  },
];

const ADMIN_PASSWORD = 'minaramchutiya';
const STORAGE_KEY = 'kinna_gallery_memories_v2';

export function HallOfFame() {
  const { ref, visible } = useScrollReveal(0.1);
  const { playClick, playSuccess } = useSound();

  // Seeded from localStorage, then replaced by Supabase on mount
  const [memories, setMemories] = useState<GalleryMemory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* silent */ }
    return INITIAL_MEMORIES_LIST;
  });

  // dbLoading state unused (UI shows seed data while loading)

  const [selectedMemory, setSelectedMemory] = useState<GalleryMemory | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  // Add Public Memory Form Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryTag, setNewMemoryTag] = useState('PUBLIC MEMORY');
  const [newMemoryFile, setNewMemoryFile] = useState<File | null>(null);
  const [newMemoryPreview, setNewMemoryPreview] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Password Delete Modal state
  const [deletingItem, setDeletingItem] = useState<GalleryMemory | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      const remote = await fetchGalleryMemories();
      if (remote.length > 0) {
        // Merge remote with seed data (seeds are never in DB)
        const merged = [...INITIAL_MEMORIES_LIST, ...remote];
        setMemories(merged);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      }
      // db load complete
    }
    loadFromSupabase();
  }, []);

  // Keep localStorage in sync as cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (e) { /* silent */ }
  }, [memories]);

  const displayedMemories = memories.slice(0, visibleCount);
  const hasMore = visibleCount < memories.length;

  const handleLoadMore = () => {
    playClick();
    setVisibleCount((prev) => Math.min(prev + 4, memories.length));
  };

  // Image Upload Handler — stores File for Supabase, preview as objectURL
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMemoryFile(file);
      const previewUrl = URL.createObjectURL(file);
      setNewMemoryPreview(previewUrl);
    }
  };

  // Submit Public Memory — upload to Supabase Storage
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryFile || !newMemoryText.trim()) return;

    setUploadProgress(true);

    const memoryId = `custom-mem-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const draft: GalleryMemory = {
      id: memoryId,
      image: newMemoryPreview ?? '',
      memoryText: newMemoryText.trim(),
      date: dateStr,
      tag: newMemoryTag.toUpperCase() || 'PUBLIC MEMORY',
      isPublic: true,
    };

    const saved = await insertGalleryMemory(draft, newMemoryFile);
    setUploadProgress(false);

    const finalEntry: GalleryMemory = saved ?? { ...draft };

    playSuccess();
    setMemories((prev) => [finalEntry, ...prev]);
    setAddSuccess(true);

    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
      setNewMemoryFile(null);
      setNewMemoryPreview(null);
      setNewMemoryText('');
    }, 1500);
  };

  // Trigger Delete Password Prompt
  const handlePromptDelete = (e: React.MouseEvent, item: GalleryMemory) => {
    e.stopPropagation();
    playClick();
    setDeletingItem(item);
    setInputPassword('');
    setPasswordError(false);
    setDeleteSuccess(false);
  };

  // Verify Admin Password and Delete
  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      playSuccess();
      setPasswordError(false);
      setDeleteSuccess(true);
      const id = deletingItem?.id;
      if (id) {
        deleteGalleryMemory(id).catch((err) =>
          console.error('Supabase delete failed:', err)
        );
      }
      setTimeout(() => {
        setMemories((prev) => prev.filter((m) => m.id !== id));
        if (selectedMemory?.id === id) setSelectedMemory(null);
        setDeletingItem(null);
        setDeleteSuccess(false);
      }, 1000);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <section id="hall-of-fame" className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,215,0,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiCamera className="w-4 h-4 text-yellow-500" />
            ◆ MEMORY ARCHIVE
          </span>
          <h2 className="section-title">Gallery</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Showing {displayedMemories.length} of {memories.length} memories in original aspect ratio
          </p>
          <div className="section-divider mb-6" />

          {/* Action Bar: Public Add Memory Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                playClick();
                setShowAddModal(true);
              }}
              className="btn-gold px-6 py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm tracking-widest inline-flex items-center gap-2.5 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-105 transition-all"
            >
              <FiPlus className="w-5 h-5 text-black font-bold" />
              <span>ADD YOUR MEMORY (PUBLIC)</span>
            </button>
          </div>
        </div>

        {/* Gallery Masonry Grid */}
        {displayedMemories.length > 0 ? (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-4 gap-6 space-y-6">
              {displayedMemories.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={visible ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ delay: (i % 4) * 0.1, duration: 0.5 }}
                  onClick={() => setSelectedMemory(item)}
                  className="break-inside-avoid glass-card-hover rounded-3xl p-4 cursor-pointer group relative overflow-hidden border border-yellow-500/20 shadow-xl"
                >
                  {/* Photo Frame preserving original ratio */}
                  <div className="relative w-full rounded-2xl overflow-hidden mb-3 bg-black">
                    <img
                      src={item.image}
                      alt={item.memoryText}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Zoom Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="p-3 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">
                        <FiZoomIn className="w-6 h-6" />
                      </div>
                    </div>



                    {item.tag && (
                      <div className="absolute top-3 right-3 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono-custom text-yellow-300">
                        {item.tag}
                      </div>
                    )}
                  </div>

                  {/* Memory Text */}
                  <div className="p-2">
                    <p className="font-sans text-sm text-yellow-100/90 font-medium leading-relaxed group-hover:text-yellow-300 transition-colors">
                      {item.memoryText}
                    </p>
                    {item.date && (
                      <div className="font-mono-custom text-[10px] text-yellow-500/50 mt-2 flex items-center gap-1">
                        <FiHeart className="w-3 h-3 text-red-400" />
                        <span>{item.date}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button after every 4 photos */}
            <div className="mt-12 text-center">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  className="btn-gold px-8 py-4 rounded-2xl font-display font-black text-sm tracking-widest inline-flex items-center gap-3 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-105 transition-all"
                >
                  <FiChevronDown className="w-5 h-5 animate-bounce" />
                  <span>LOAD MORE MEMORIES ({displayedMemories.length} / {memories.length})</span>
                </button>
              ) : (
                <div className="inline-block px-6 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono-custom text-xs">
                  ✨ ALL {memories.length} MEMORIES UNLOCKED
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto border-2 border-dashed border-yellow-500/30">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-4xl mb-4 animate-bounce">
              📸
            </div>
            <h3 className="font-display font-black text-2xl text-yellow-400 mb-2">
              NO MEMORIES YET
            </h3>
            <p className="font-mono-custom text-xs text-yellow-500/70 leading-relaxed mb-6">
              Be the first to add a memory to Kinna's public archive!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gold px-6 py-3 rounded-xl font-display font-bold text-xs"
            >
              ➕ ADD FIRST MEMORY
            </button>
          </div>
        )}

        {/* ═══ Public Add Memory Modal ═══ */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl glass-card rounded-3xl border-2 border-yellow-500/50 p-6 sm:p-8 bg-black/95 shadow-[0_0_50px_rgba(255,215,0,0.2)] my-auto"
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
                    <FiUploadCloud />
                  </div>
                  <h3 className="font-display font-black text-2xl text-yellow-400 mb-1">
                    ADD YOUR MEMORY
                  </h3>
                  <p className="font-mono-custom text-xs text-yellow-500/60">
                    Share your photo and story to be displayed publicly in Kinna's Gallery
                  </p>
                </div>

                {addSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <FiCheckCircle className="w-14 h-14 text-green-400 mx-auto animate-bounce" />
                    <div className="font-display font-bold text-xl text-green-400">
                      MEMORY ADDED SUCCESSFULLY!
                    </div>
                    <p className="font-mono-custom text-xs text-yellow-500/70">
                      Your photo is now live in the gallery.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddSubmit} className="space-y-4">
                    {/* Image File Selector */}
                    <div>
                      <label className="block font-mono-custom text-xs text-yellow-400 font-bold mb-2">
                        PHOTO ATTACHMENT
                      </label>
                      <div className="relative border-2 border-dashed border-yellow-500/30 hover:border-yellow-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-black/50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          required
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {newMemoryPreview ? (
                          <div className="relative max-h-48 rounded-xl overflow-hidden">
                            <img src={newMemoryPreview} alt="Preview" className="max-h-48 mx-auto object-contain rounded-xl" />
                            <span className="block font-mono-custom text-[10px] text-green-400 mt-2">✓ Photo Loaded</span>
                          </div>
                        ) : (
                          <div className="py-4 space-y-1">
                            <FiUploadCloud className="w-8 h-8 text-yellow-400/60 mx-auto" />
                            <span className="font-mono-custom text-xs text-yellow-300 block font-bold">
                              Click or Drag & Drop Photo Here
                            </span>
                            <span className="font-mono-custom text-[10px] text-yellow-500/50 block">
                              Supports JPG, PNG, WEBP in original ratio
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Memory Text */}
                    <div>
                      <label className="block font-mono-custom text-xs text-yellow-400 font-bold mb-2">
                        MEMORY STORY / TEXT
                      </label>
                      <textarea
                        rows={3}
                        value={newMemoryText}
                        onChange={(e) => setNewMemoryText(e.target.value)}
                        placeholder="Write your unforgettable story or memory with Kinna..."
                        required
                        className="w-full bg-black/60 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-100 font-sans outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>

                    {/* Memory Tag */}
                    <div>
                      <label className="block font-mono-custom text-xs text-yellow-400 font-bold mb-2">
                        CATEGORY / TAG
                      </label>
                      <input
                        type="text"
                        value={newMemoryTag}
                        onChange={(e) => setNewMemoryTag(e.target.value)}
                        placeholder="e.g. SQUAD MEMORY, FUNNY, PROTEST"
                        className="w-full bg-black/60 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-100 font-mono-custom outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!newMemoryPreview || !newMemoryText.trim() || uploadProgress}
                      className="w-full btn-gold py-3.5 rounded-xl font-display font-black text-sm tracking-widest disabled:opacity-50 transition-all"
                    >
                      {uploadProgress ? '⏳ UPLOADING...' : '🚀 PUBLISH TO GALLERY'}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ Password-Protected Delete Modal ═══ */}
        <AnimatePresence>
          {deletingItem && (
            <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md glass-card rounded-3xl border-2 border-red-500/60 p-6 sm:p-8 bg-black/95 shadow-[0_0_50px_rgba(255,0,64,0.3)]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setDeletingItem(null)}
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
                    Enter security password to permanently delete this photo from gallery
                  </p>
                </div>

                {deleteSuccess ? (
                  <div className="py-6 text-center space-y-2">
                    <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    <div className="font-display font-bold text-lg text-green-400">
                      PHOTO DELETED!
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
                        <div className="mt-2 text-red-500 font-mono-custom text-xs flex items-center justify-center gap-1.5 font-bold animate-shake">
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

        {/* Lightbox Modal for Original Ratio View */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
              className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card max-w-4xl w-full rounded-3xl p-6 md:p-8 relative border-2 border-yellow-500/50 shadow-2xl bg-black/95 my-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all z-10"
                >
                  <FiX className="w-5 h-5" />
                </button>

                {/* Original Aspect Ratio Image in Lightbox - Click again to close */}
                <div
                  onClick={() => setSelectedMemory(null)}
                  className="relative max-h-[70vh] w-full flex items-center justify-center rounded-2xl overflow-hidden border border-yellow-500/30 mb-6 bg-black cursor-pointer group"
                  title="Click again to close photo"
                >
                  <img
                    src={selectedMemory.image}
                    alt={selectedMemory.memoryText}
                    className="max-h-[70vh] w-auto max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono-custom text-yellow-400 border border-yellow-500/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Click photo to close ✕
                  </div>
                </div>

                {/* Lightbox Details */}
                <div className="text-center space-y-2 max-w-2xl mx-auto pb-2">
                  <p className="font-sans font-semibold text-lg text-yellow-300 leading-relaxed">
                    "{selectedMemory.memoryText}"
                  </p>
                  {selectedMemory.date && (
                    <div className="font-mono-custom text-xs text-yellow-500/60 flex items-center justify-center gap-1 pt-1">
                      <FiHeart className="w-3.5 h-3.5 text-red-500" />
                      <span>{selectedMemory.date}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Corner Delete Option (Password Protected) */}
                <div className="flex justify-end pt-4 border-t border-yellow-500/20">
                  <button
                    onClick={(e) => handlePromptDelete(e, selectedMemory)}
                    className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white font-mono-custom text-xs flex items-center gap-2 transition-all shadow-lg"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>DELETE PHOTO</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
