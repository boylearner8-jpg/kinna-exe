import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import {
  FiZap,
  FiPlay,
} from 'react-icons/fi';

interface SquadMember {
  id: string;
  name: string;
  role: string;
  image: string;
  icon: string;
  attackPower: number;
  specialMove: string;
}

const SQUAD_MEMBERS: SquadMember[] = [
  {
    id: 'advocate-bo',
    name: 'Advocate Bo',
    role: 'Supreme Legal Flexer',
    image: '/partner_advocate_bo.jpg',
    icon: '👑',
    attackPower: 98,
    specialMove: 'Crown Legal Authority Flex',
  },
  {
    id: 'motu-madhur',
    name: 'Motu Madhur',
    role: 'Horse Cavalry Leader',
    image: '/partner_motu_madhur.jpg',
    icon: '🏇',
    attackPower: 97,
    specialMove: 'Aryan Horse Highway Charge',
  },
  {
    id: 'pandit-bilal',
    name: 'Pandit Bilal',
    role: 'Sacred Rally Vanguard',
    image: '/partner_pandit_bilal.jpg',
    icon: '📜',
    attackPower: 95,
    specialMove: 'Sacred Banner of Truth',
  },
  {
    id: 'heart-hacker',
    name: 'Heart Hacker Aryan',
    role: 'Fauji Cyber Operative',
    image: '/partner_heart_hacker_aryan.jpg',
    icon: '💻',
    attackPower: 99,
    specialMove: 'Cartel Server Override',
  },
  {
    id: 'dehati-ayush',
    name: 'Dehati Ayush',
    role: 'Rural March Strategist',
    image: '/gallery_dehati_ayush.jpg',
    icon: '🌾',
    attackPower: 94,
    specialMove: 'Dehati Jan-Jagriti March',
  },
  {
    id: 'agent-maddi',
    name: 'Agent Maddi',
    role: 'Black Suit Covert Chief',
    image: '/partner_agent_maddi.jpg',
    icon: '🕶️',
    attackPower: 99,
    specialMove: 'Black Suit Infiltration Strike',
  },
];

interface Boss {
  id: string;
  name: string;
  hp: number;
  image: string;
  description: string;
}

const CARTEL_BOSSES: Boss[] = [
  {
    id: 'paper-cartel-boss',
    name: 'Paper Leak Cartel Boss',
    hp: 1000,
    image: '/father_vs_son_titan.jpg',
    description: 'Mastermind behind answer sheet leaks and corrupt exam centers.',
  },
  {
    id: 'papa-ayush-force',
    name: 'Papa Ayush Barrier',
    hp: 850,
    image: '/partner_papa_ayush.jpg',
    description: 'The unstoppable ancestral roadblock opposing Kinna’s movement.',
  },
  {
    id: 'corrupt-examiner',
    name: 'Corrupt Examiner Syndicate',
    hp: 750,
    image: '/kinna_trolling_newspaper.jpg',
    description: 'Fraudulent paper setters operating in secret exam rooms.',
  },
];

interface BattleLog {
  id: string;
  text: string;
  type: 'info' | 'attack' | 'combo' | 'boss' | 'victory';
}

export function SquadSynergySimulator() {
  const { ref, visible } = useScrollReveal(0.1);
  const { playClick, playSuccess, playBoom } = useSound();

  const [partner1, setPartner1] = useState<SquadMember>(SQUAD_MEMBERS[0]);
  const [partner2, setPartner2] = useState<SquadMember>(SQUAD_MEMBERS[1]);
  const [selectedBoss, setSelectedBoss] = useState<Boss>(CARTEL_BOSSES[0]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [squadHp, setSquadHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Combined synergy rating
  const combinedSynergy = partner1.attackPower + partner2.attackPower;

  // Start Battle Simulation
  const startSimulation = () => {
    if (partner1.id === partner2.id) return;
    playBoom();
    setIsSimulating(true);
    setSquadHp(100);
    setBossHp(100);
    setBattleLogs([
      {
        id: `log-0`,
        text: `⚔️ SIMULATION INITIATED: [${partner1.name}] + [${partner2.name}] vs [${selectedBoss.name}]`,
        type: 'info',
      },
      {
        id: `log-1`,
        text: `⚡ SYNERGY POWER LEVEL: ${combinedSynergy}% OVERPOWERED!`,
        type: 'combo',
      },
    ]);

    let currentBossHp = 100;
    let currentSquadHp = 100;
    let step = 0;

    const interval = setInterval(() => {
      step++;

      if (step === 1) {
        // Partner 1 Attack
        playClick();
        const dmg = Math.floor(20 + Math.random() * 15);
        currentBossHp = Math.max(0, currentBossHp - dmg);
        setBossHp(currentBossHp);
        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-step-${step}`,
            text: `${partner1.icon} ${partner1.name} executes [${partner1.specialMove}]! Dealt -${dmg}% HP to ${selectedBoss.name}!`,
            type: 'attack',
          },
        ]);
      } else if (step === 2) {
        // Boss Counter-Attack
        playBoom();
        const dmg = Math.floor(10 + Math.random() * 12);
        currentSquadHp = Math.max(0, currentSquadHp - dmg);
        setSquadHp(currentSquadHp);
        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-step-${step}`,
            text: `👺 ${selectedBoss.name} retaliates with Corrupt Paper Blast! Squad takes -${dmg}% damage!`,
            type: 'boss',
          },
        ]);
      } else if (step === 3) {
        // Partner 2 Attack
        playClick();
        const dmg = Math.floor(25 + Math.random() * 15);
        currentBossHp = Math.max(0, currentBossHp - dmg);
        setBossHp(currentBossHp);
        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-step-${step}`,
            text: `${partner2.icon} ${partner2.name} strikes with [${partner2.specialMove}]! Dealt -${dmg}% HP!`,
            type: 'attack',
          },
        ]);
      } else if (step === 4) {
        // ULTIMATE DUAL COMBO STRIKE!
        playSuccess();
        const comboDmg = currentBossHp; // Defeat boss!
        currentBossHp = 0;
        setBossHp(0);
        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-step-${step}`,
            text: `👑🔥 ULTIMATE JOINT COMBO: [${partner1.name} X ${partner2.name}] UNLEASH SUPREME CJP STRIKE! Dealt -${comboDmg}% CRITICAL DAMAGE!`,
            type: 'combo',
          },
        ]);
      } else if (step === 5) {
        // VICTORY!
        clearInterval(interval);
        playSuccess();
        setIsSimulating(false);

        const ranks = ['S-RANK LEGENDARY', 'OVERPOWERED SSS', 'UNSTOPPABLE DUAL FORCE'];
        const finalRank = ranks[Math.floor(Math.random() * ranks.length)];

        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-final`,
            text: `🏆 BATTLE DEBRIEFING: VICTORY ACHIEVED! ${selectedBoss.name} NEUTRALIZED! BATTLE RATING: [${finalRank}]`,
            type: 'victory',
          },
        ]);
      }
    }, 1200);
  };

  return (
    <section id="synergy-simulator" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 64, 0.2) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiZap className="w-4 h-4 text-red-500" />
            ◆ TACTICAL SYNERGY BATTLE SIMULATOR
          </span>
          <h2 className="section-title">Squad Battle</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.6)' }}>
            Pair 2 squad operatives & simulate tactical combo battles against paper cartel bosses
          </p>
          <div className="section-divider" />
        </div>

        {/* Main Console Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-red-500/30 shadow-[0_0_50px_rgba(255,0,64,0.15)] bg-black/90"
        >
          {/* Operatives Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
            {/* Operative 1 Selector */}
            <div className="glass-card p-4 rounded-2xl border border-yellow-500/30 text-center">
              <div className="font-mono-custom text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-2">
                OPERATIVE 01
              </div>
              <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-yellow-400 mb-3 shadow-md bg-black">
                <img
                  src={partner1.image}
                  alt={partner1.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <select
                value={partner1.id}
                onChange={(e) => {
                  playClick();
                  const found = SQUAD_MEMBERS.find((m) => m.id === e.target.value);
                  if (found) setPartner1(found);
                }}
                className="w-full bg-black/80 border border-yellow-500/40 text-yellow-300 font-mono-custom text-xs p-2.5 rounded-xl outline-none"
              >
                {SQUAD_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === partner2.id}>
                    {m.icon} {m.name}
                  </option>
                ))}
              </select>
              <div className="font-mono-custom text-[10px] text-yellow-100/60 mt-2 truncate">
                {partner1.role}
              </div>
            </div>

            {/* VS & Synergy Rating Badge */}
            <div className="text-center space-y-3">
              <div className="font-display font-black text-3xl text-red-500 drop-shadow-[0_0_15px_#ff0040]">
                VS
              </div>

              <div className="bg-yellow-500/10 p-3 rounded-2xl border border-yellow-500/30 font-mono-custom text-xs">
                <div className="text-yellow-400/80 text-[10px] uppercase tracking-widest font-bold">
                  DUAL SYNERGY RATING
                </div>
                <div className="font-display font-black text-2xl text-yellow-400 mt-1">
                  {combinedSynergy}%
                </div>
              </div>

              {/* Boss Selector Dropdown */}
              <div className="pt-1">
                <div className="font-mono-custom text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">
                  TARGET CARTEL BOSS
                </div>
                <select
                  value={selectedBoss.id}
                  onChange={(e) => {
                    playClick();
                    const found = CARTEL_BOSSES.find((b) => b.id === e.target.value);
                    if (found) setSelectedBoss(found);
                  }}
                  className="w-full bg-black/80 border border-red-500/40 text-red-400 font-mono-custom text-xs p-2 rounded-xl outline-none"
                >
                  {CARTEL_BOSSES.map((b) => (
                    <option key={b.id} value={b.id}>
                      👺 {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Operative 2 Selector */}
            <div className="glass-card p-4 rounded-2xl border border-yellow-500/30 text-center">
              <div className="font-mono-custom text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-2">
                OPERATIVE 02
              </div>
              <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-yellow-400 mb-3 shadow-md bg-black">
                <img
                  src={partner2.image}
                  alt={partner2.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <select
                value={partner2.id}
                onChange={(e) => {
                  playClick();
                  const found = SQUAD_MEMBERS.find((m) => m.id === e.target.value);
                  if (found) setPartner2(found);
                }}
                className="w-full bg-black/80 border border-yellow-500/40 text-yellow-300 font-mono-custom text-xs p-2.5 rounded-xl outline-none"
              >
                {SQUAD_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.id === partner1.id}>
                    {m.icon} {m.name}
                  </option>
                ))}
              </select>
              <div className="font-mono-custom text-[10px] text-yellow-100/60 mt-2 truncate">
                {partner2.role}
              </div>
            </div>
          </div>

          {/* Action Launch Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={startSimulation}
              disabled={isSimulating || partner1.id === partner2.id}
              className="btn-gold px-8 py-4 rounded-2xl font-display font-black text-xs sm:text-sm tracking-widest inline-flex items-center gap-2.5 shadow-[0_0_35px_rgba(255,0,64,0.3)] hover:scale-105 transition-all disabled:opacity-50"
            >
              <FiPlay className="w-5 h-5 text-black font-bold" />
              <span>LAUNCH SYNERGY BATTLE</span>
            </button>
          </div>

          {/* Battle Progress HP Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 font-mono-custom text-xs">
            {/* Squad HP */}
            <div className="bg-black/60 p-3 rounded-xl border border-yellow-500/30">
              <div className="flex justify-between items-center mb-1 text-yellow-300 font-bold">
                <span>🛡️ SQUAD DUO HEALTH</span>
                <span>{squadHp}%</span>
              </div>
              <div className="h-2.5 bg-yellow-950 rounded-full overflow-hidden border border-yellow-500/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                  style={{ width: `${squadHp}%` }}
                />
              </div>
            </div>

            {/* Boss HP */}
            <div className="bg-black/60 p-3 rounded-xl border border-red-500/30">
              <div className="flex justify-between items-center mb-1 text-red-400 font-bold">
                <span>👺 {selectedBoss.name}</span>
                <span>{bossHp}%</span>
              </div>
              <div className="h-2.5 bg-red-950 rounded-full overflow-hidden border border-red-500/30">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Live Tactical Battle Stream Terminal */}
          <div className="terminal-window border border-red-500/30 bg-black/90">
            <div className="terminal-header bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between font-mono-custom text-xs text-red-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>COMBAT LOG CONSOLE STREAM</span>
              </div>
              <div>CLASSIFIED INTEL</div>
            </div>

            <div
              ref={logContainerRef}
              className="p-4 h-52 overflow-y-auto space-y-2 font-mono-custom text-xs custom-scrollbar"
            >
              {battleLogs.length === 0 ? (
                <div className="text-yellow-500/40 italic text-center pt-16">
                  Select 2 operatives above and press &quot;LAUNCH SYNERGY BATTLE&quot; to begin combat simulation.
                </div>
              ) : (
                battleLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg border ${
                      log.type === 'combo'
                        ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 font-bold'
                        : log.type === 'attack'
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : log.type === 'boss'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : log.type === 'victory'
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 font-display font-black text-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {log.text}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
