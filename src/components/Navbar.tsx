import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiVolume2, FiVolumeX, FiMenu, FiX } from 'react-icons/fi';

interface NavbarProps {
  muted: boolean;
  onToggleMute: () => void;
  onSecretTrigger: () => void;
}

const NAV_ITEMS = [
  { label: 'HORSE RUNNER', href: '#horse-runner' },
  { label: 'JOURNEY', href: '#journey' },
  { label: 'TITAN CLASH', href: '#titan-clash' },
  { label: 'CRIME PARTNER', href: '#crime-partner' },
  { label: 'GALLERY', href: '#hall-of-fame' },
  { label: 'FATHERSAHAB', href: '#fathersahab' },
  { label: 'STATS', href: '#stats' },
  { label: 'KINNAPEDIA', href: '#kinnapedia' },
];

export function Navbar({ muted, onToggleMute, onSecretTrigger }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [logoGlow, setLogoGlow] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;
    setLogoGlow(true);
    setTimeout(() => setLogoGlow(false), 300);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      onSecretTrigger();
    } else {
      // Reset count after 2.5 seconds of inactivity
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2500);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-yellow-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo — 5-click secret trigger */}
          <a href="#home" className="flex items-center gap-2 group" onClick={handleLogoClick}>
            <div
              className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-400 flex items-center justify-center font-display font-black text-yellow-400 transition-all"
              style={{ boxShadow: logoGlow ? '0 0 20px #FFD700' : undefined }}
            >
              K
            </div>
            <span
              className="font-display font-black text-lg text-yellow-400 tracking-wider transition-all"
              style={{ textShadow: logoGlow ? '0 0 15px #FFD700' : undefined }}
            >
              KINNA.EXE
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 font-mono-custom text-xs">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-yellow-500/70 hover:text-yellow-400 hover:shadow-[0_0_10px_#FFD700] transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Mute button */}
            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 active:scale-95 transition-all flex items-center justify-center"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? <FiVolumeX className="w-5 h-5 text-yellow-500/60" /> : <FiVolume2 className="w-5 h-5 text-yellow-400" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center active:scale-95 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pt-4 pb-3 border-t border-yellow-500/20 mt-3 font-mono-custom text-xs grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-bold hover:bg-yellow-500/20 active:bg-yellow-500/30 text-center truncate flex items-center justify-center min-h-[44px]"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </header>
    </>
  );
}
