import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import { FiBookOpen, FiShield, FiAlertTriangle, FiUserCheck, FiUsers, FiAward } from 'react-icons/fi';

const WIKI_TABLE = [
  { label: 'Full Name', value: 'Kinna (Alter-Ego: Devil Boy Kinna 😈💀)' },
  { label: 'Species', value: 'Homo Somnolentus Colossus (500ft Titan subclass)' },
  { label: 'Occupation', value: 'Chief Procrastinator & Student Revolution Commander' },
  { label: 'Lineage', value: 'Father: Pradhan Ji (Defeated Leak Mastermind) | Grandfather: Papa Ayush' },
  { label: 'Grandfather Status', value: '🚫 BLOCKED BY KINNA (Kinna fears Papa Ayush\'s intimidating aura!)' },
  { label: 'Crime Squad', value: 'Army Aryan 🪖, Heart Hacker Aryan 🫀, Advocate Bo 👑⚖️, Motu Madhur 🏇, Pandit Bilal 📜✨' },
  { label: 'Ultimate Form', value: '500ft Colossal Titan (Activated via Jantar Mantar Megaphone & Golden Mask)' },
  { label: 'Greatest Defeat', value: 'Exposed CJP Paper Leak Cartel & Defeated Father Pradhan Ji in Titan Battle' },
  { label: 'Heroic Rescue', value: 'Partnered with Officer Army Aryan to rescue & protect all kids and students' },
  { label: 'Current Era', value: 'Meme & Trolling Era (Viral Dainik Janvani "Kinna?" Monkey Meme)' },
  { label: 'Weaknesses', value: 'Papa Ayush, Morning Alarms, Procrastination Temptations' },
  { label: 'Favorite Weapon', value: 'Megaphone of Justice, Golden Skull Mask, 500ft Titan Stomp' },
  { label: 'Natural Habitat', value: 'Jantar Mantar Protest Grounds, Bed with WiFi, Delhi Titan Skyline' },
  { label: 'Case Status', value: '🟢 VICTORY ACHIEVED — 100% Justice for Students & Children!' },
];

const LORE_TABS = [
  {
    id: 'overview',
    label: '📋 Overview',
    content: `Kinna is a legendary figure who evolved from an ordinary student procrastinator into a 500ft Colossal Titan. When the CJP paper leak scandal threatened students nationwide, Kinna donned his golden skull mask, rallied the Crime Partner squad at Jantar Mantar, and challenged the corrupt cartel led by his own father, Pradhan Ji.`,
  },
  {
    id: 'titan-form',
    label: '⚡ Final Form & Titan Clash',
    content: `During Chapter XIII of the CJP Movement, Kinna achieved his final form: a 500-foot tall Colossal Titan towering over Delhi. In an epic showdown against Pradhan Ji Titan, Kinna used his unshakeable student resolve to crush the paper leak cartel, deliver 100% justice, and secure victory for all students!`,
  },
  {
    id: 'papa-ayush',
    label: '👴 The Papa Ayush Fear',
    content: `Despite battling 500ft Titans and facing police chases, there is ONE figure Kinna fears above all: his grandfather, Papa Ayush! When Papa Ayush opposed Kinna during the CJP protest, intense arguments broke out, prompting Kinna to execute Operation Total Block. Papa Ayush remains officially BLOCKED across all Kinna's contacts!`,
  },
  {
    id: 'trolling-era',
    label: '🐒 The Trolling & Meme Era',
    content: `Following the CJP victory, Kinna entered the eternal Trolling Era. Featured on the front page of Dainik Janvani ("इंटरनेट पर वायरल हुआ अजीब-गरीब बंदर, लोग बोले - किन्ना?"), Kinna's squad continues to troll him daily while honoring his legendary sacrifice for education justice.`,
  },
];

export function Kinnapedia() {
  const { ref, visible } = useScrollReveal(0.1);
  const { playClick } = useSound();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section id="kinnapedia" className="relative py-24 px-4 overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,215,0,0.03) 0%, transparent 60%)' }}
      />

      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiBookOpen className="w-4 h-4 text-yellow-400" />
            ◆ OFFICIAL KINNA ENCYCLOPEDIA
          </span>
          <h2 className="section-title">Kinnapedia</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            The definitive classified archives & comprehensive lore of Subject Kinna
          </p>
          <div className="section-divider mt-4" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-3xl overflow-hidden border-2 border-yellow-500/30 shadow-[0_0_40px_rgba(255,215,0,0.15)] bg-black/90"
        >
          {/* Wiki Banner Header */}
          <div
            className="p-6 md:p-8 border-b"
            style={{ borderColor: 'rgba(255,215,0,0.15)', background: 'rgba(255,215,0,0.04)' }}
          >
            <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
              <div className="flex-shrink-0">
                <div
                  className="w-36 h-48 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.3)] relative"
                >
                  <img
                    src="/kinna.jpg"
                    alt="Kinna"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-center font-mono-custom text-[10px] text-yellow-400 border border-yellow-500/30">
                    SUBJECT: KINNA
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-custom text-xs text-yellow-400/80 font-bold uppercase tracking-widest">
                    KINNAPEDIA ARCHIVE #001
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                <h3 className="font-display font-black text-4xl text-yellow-400 mb-2">
                  Kinna
                </h3>

                <p className="font-mono-custom text-xs text-yellow-500/60 mb-3 tracking-widest">
                  Homo Somnolentus Colossus — The Masked Rebel & 500ft Colossal Titan
                </p>

                <div className="italic text-sm text-yellow-100/90 leading-relaxed glass-card p-4 rounded-xl border border-yellow-500/20 mb-4 bg-black/50">
                  "From procrastination hero to 500ft Colossal Titan, Kinna led the student revolution against paper leaks, defeated Pradhan Ji, and delivered 100% justice — while remaining terrified of Papa Ayush!"
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-mono-custom text-xs flex items-center gap-1">
                    <FiShield className="w-3.5 h-3.5" /> Human / Titan Hybrid
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-mono-custom text-xs flex items-center gap-1">
                    <FiAlertTriangle className="w-3.5 h-3.5" /> Threat Level: 99%
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 font-mono-custom text-xs flex items-center gap-1">
                    <FiUserCheck className="w-3.5 h-3.5" /> 100% Justice Delivered
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 font-mono-custom text-xs flex items-center gap-1">
                    <FiUsers className="w-3.5 h-3.5" /> 7 Crime Partners
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Lore Tabs */}
          <div className="px-6 pt-6 border-b border-yellow-500/15">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {LORE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`px-4 py-2 rounded-xl font-mono-custom text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-black shadow-[0_0_15px_#FFD700]'
                      : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 border-b border-yellow-500/15 bg-black/40">
            <AnimatePresence mode="wait">
              {LORE_TABS.map(
                (tab) =>
                  tab.id === activeTab && (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="font-sans text-sm text-yellow-100/90 leading-relaxed"
                    >
                      {tab.content}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>

          {/* Detailed Encyclopedia Table */}
          <div className="p-6 md:p-8">
            <h4 className="font-display font-bold text-lg text-yellow-400 mb-4 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-yellow-400" />
              CLASSIFIED DATA PARAMETERS
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {WIKI_TABLE.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={visible ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono-custom text-xs font-bold text-yellow-400/90 w-44 sm:w-56 align-top">
                        {row.label}
                      </td>
                      <td className="py-3 text-sm text-yellow-100/85 font-sans leading-relaxed">
                        {row.value}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Categories Footer */}
            <div className="mt-8 pt-4 border-t border-yellow-500/20 font-mono-custom text-[11px] text-yellow-500/50 leading-relaxed">
              CATEGORIES: Colossal Titans | Student Revolutionaries | Paper Leak Defeaters | Jantar Mantar Veterans | Papa Ayush Blockers | Procrastination Masters | Dainik Janvani Memes
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
