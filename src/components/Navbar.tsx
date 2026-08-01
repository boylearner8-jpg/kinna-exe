import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiVolume2, FiVolumeX, FiMenu, FiX } from 'react-icons/fi';

interface NavbarProps {
  muted: boolean;
  onToggleMute: () => void;
}

const NAV_ITEMS = [
  { label: 'JOURNEY', href: '#journey' },
  { label: 'CRIME PARTNER', href: '#crime-partner' },
  { label: 'GALLERY', href: '#hall-of-fame' },
  { label: 'KINNAPEDIA', href: '#kinnapedia' },
  { label: 'FATHERSAHAB', href: '#fathersahab' },
  { label: 'ADD MESSAGE', href: '#message' },
];

export function Navbar({ muted, onToggleMute }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-yellow-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-400 flex items-center justify-center font-display font-black text-yellow-400 group-hover:shadow-[0_0_15px_#FFD700] transition-all">
              K
            </div>
            <span className="font-display font-black text-lg text-yellow-400 tracking-wider">
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
              className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4 text-yellow-400" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pt-4 pb-2 border-t border-yellow-500/20 mt-3 font-mono-custom text-xs grid grid-cols-2 gap-2"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/20"
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
