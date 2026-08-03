import { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import { FiUsers, FiX, FiAlertTriangle, FiBookOpen, FiZap, FiChevronRight } from 'react-icons/fi';

export interface CrimePartnerItem {
  id: string;
  name: string;
  role: string;
  icon: string;
  image: string;
  perk: string;
  threatLevel: string;
  tagline: string;
  story: string;
  synergy: number;
  jointOperations: {
    code: string;
    name: string;
    description: string;
    status: string;
  }[];
}

export const CRIME_PARTNERS_LIST: CrimePartnerItem[] = [
  {
    id: 'devil-boy-kinna',
    name: 'Devil Boy Kinna',
    role: 'The Original Masked Rebel & Chaos Alter-Ego',
    icon: '😈💀',
    image: '/partner_devil_boy_kinna.jpg',
    perk: '+100% Golden Eye Glow & Fearless Defiance',
    threatLevel: 'MAXIMUM CHAOS 99%',
    tagline: 'Kinna’s original masked form that started the entire revolution.',
    story: `Devil Boy Kinna is the legendary alter-ego of Kinna! Wearing the iconic golden skull mask with glowing yellow eyes, Devil Boy Kinna emerged during the dark hours of procrastination and paper leak injustice. He is the ultimate symbol of rebellion who inspired the entire squad to stand up, march to Jantar Mantar, and challenge the authorities. Whenever trouble arises, Devil Boy Kinna activates his golden glow to lead the charge!`,
    synergy: 100,
    jointOperations: [
      {
        code: 'OP-SKULL-MASK',
        name: 'Operation Golden Mask',
        description: 'Equipped the golden skull mask to ignite the student revolution.',
        status: 'LEGENDARY',
      },
      {
        code: 'OP-PROTEST-RESOLVE',
        name: 'The Resolve to Protest',
        description: 'Sat in gear with golden eye glow online to lock in the decision to protest.',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'heart-hacker-aryan',
    name: 'Heart Hacker Aryan',
    role: 'Master Heart Stealer & Emotional Reinforcement',
    icon: '🫀',
    image: '/partner_heart_hacker_aryan.jpg',
    perk: '+100% Heart Stealing & Morale Boost',
    threatLevel: 'HEART STEALER EXTREME',
    tagline: 'Steals hearts by day, fights for student justice by night.',
    story: `Heart Hacker Aryan is Kinna's closest emotional pillar and heart-stealing brother! When Kinna faced the heartbreaking discovery about his father Pradhan Ji, Heart Hacker Aryan stepped in holding an actual heart model to remind Kinna that loyalty to truth and students comes above all. Aryan joined the CJP protest ground with unyielding morale, holding banners high and making sure no brother stands alone!`,
    synergy: 99,
    jointOperations: [
      {
        code: 'OP-HEART-HACK',
        name: 'Operation Heart Stealer',
        description: 'Hacked into squad morale, boosting friendship synergy to 100%.',
        status: 'SUCCESS',
      },
      {
        code: 'OP-CJP-STAND',
        name: 'CJP Bachao लोकतंत्र Bachao',
        description: 'Stood at the frontlines holding protest signs alongside Kinna.',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'advocate-bo',
    name: 'Advocate Bo',
    role: 'Supreme Legal Flexer & Crown Bearer',
    icon: '👑⚖️',
    image: '/partner_advocate_bo.jpg',
    perk: '+100% Regal Aura & Highway Legal Authority',
    threatLevel: 'LAW POWER LEVEL 9000+',
    tagline: 'Brings royal crown aura and supreme legal flexing to every march.',
    story: `Advocate Bo is the legal backbone of Kinna's squad! Famous for his royal crown, blue cape, and highway legal demonstrations, Advocate Bo showed police who holds the supreme law. When police tried to halt the CJP rally, Bo stepped forward with his sword and crown, flexing legal authority until the path was cleared. Though later captured in a hilarious police station surrender moment, Advocate Bo remains an unforgettable hero of the squad!`,
    synergy: 98,
    jointOperations: [
      {
        code: 'OP-HIGHWAY-FLEX',
        name: 'Sector 009 Legal Power',
        description: 'Flexed supreme legal authority on the highway in crown and royal cape.',
        status: 'LEGENDARY',
      },
      {
        code: 'OP-SURRENDER-TWIST',
        name: 'The Crowned Surrender',
        description: 'Kneeling in custody with folded hands while still wearing his royal crown.',
        status: 'BUSTED BUT ICONIC',
      },
    ],
  },
  {
    id: 'motu-madhur',
    name: 'Motu Madhur',
    role: 'Cavalry Leader & Horse Master',
    icon: '🏇📢',
    image: '/partner_motu_madhur.jpg',
    perk: '+100% Horse Riding & Rally Mobilization',
    threatLevel: 'HIGH MOUNTED FORCE',
    tagline: 'Rode his horse Aryan to frontlines of Jantar Mantar.',
    story: `Motu Madhur is the equestrian champion and frontline rally leader of Kinna's movement! Madhur made national headlines by riding his legendary horse 'Aryan' through Delhi traffic to demand education equality and protest paper leaks. Wearing his Jack & Jones sweater and holding high 'CJP Bachao लोकतंत्र Bachao' signs, Motu Madhur was the first spark that inspired Kinna to join the fight!`,
    synergy: 97,
    jointOperations: [
      {
        code: 'OP-HORSE-RALLY',
        name: 'Aryan Horse March',
        description: 'Rode horse Aryan to lead the paper leak protest at Jantar Mantar.',
        status: 'FRONT PAGE NEWS 📰',
      },
      {
        code: 'OP-TITAN-CHARGE',
        name: 'Sword Cavalry Charge',
        description: 'Charged on horseback with sword drawn during the father vs son titan clash.',
        status: 'EPIC CLIMAX',
      },
    ],
  },
  {
    id: 'pandit-bilal',
    name: 'Pandit Bilal',
    role: 'Sacred Sage & Protest Vanguard',
    icon: '📜✨',
    image: '/partner_pandit_bilal.jpg',
    perk: '+100% Wisdom & Peaceful Rally Resilience',
    threatLevel: 'WISDOM LEVEL 100',
    tagline: 'The smiling sage holding high the banner of truth.',
    story: `Pandit Bilal is the serene and joyful sage of Kinna's brotherhood! Known for his warm smile and peaceful determination, Pandit Bilal stood proudly at the protest grounds holding signs reading 'CJP - Reject CAA Boycott NRC' and 'CJP Stands with Jamia'. When energy ran low, Bilal's positive vibes and steady presence kept the entire squad motivated through every phase of the movement.`,
    synergy: 96,
    jointOperations: [
      {
        code: 'OP-PEACE-BANNER',
        name: 'CJP Unity March',
        description: 'Held high CJP banners with a smiling face in the middle of mass crowds.',
        status: 'SUCCESS',
      },
      {
        code: 'OP-SQUAD-SOLIDARITY',
        name: 'Brotherhood Support',
        description: 'Stood shoulder to shoulder with Kinna during the rally breakthrough.',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'army-aryan',
    name: 'Army Aryan',
    role: 'Chief Tactical Commander & Student Rescue Specialist',
    icon: '🪖',
    image: '/partner_army_aryan.jpg',
    perk: '+100% Tactical Defense & Student Safety',
    threatLevel: 'MAXIMUM SECURE',
    tagline: 'The fearless protector who stands by Kinna in every crisis.',
    story: `Army Aryan ('aryan chand.exe') is Kinna's most trusted tactical brother in arms. When the paper leak crisis broke out and Kinna faced extreme odds against corruption, Aryan donned his military camo uniform and stepped up without hesitation. Aryan stood shoulder-to-shoulder with Kinna during the CJP protests, rallied the squad, and personally ensured that all students and children were rescued and protected from harm. Whether it's high-stakes protests or midnight chai missions, Army Aryan always has Kinna's back!`,
    synergy: 100,
    jointOperations: [
      {
        code: 'OP-STUDENT-SHIELD',
        name: 'Operation Student Rescue',
        description: 'Deployed tactical defense unit to protect all kids and students during the paper leak protest.',
        status: 'SUCCESS',
      },
      {
        code: 'OP-BROTHERHOOD-SYNC',
        name: 'Frontline Alliance',
        description: 'Joined Kinna at Jantar Mantar holding high protest banners for student justice.',
        status: 'LEGENDARY',
      },
    ],
  },
  {
    id: 'ayush-daddy',
    name: 'Ayush Daddy',
    role: 'Supreme Cool Patriarch & Thug Life Commander',
    icon: '😎🕶️',
    image: '/partner_ayush_daddy.jpg',
    perk: '+100% Thug Life Glasses & Unshakable Swagger',
    threatLevel: 'MAX SWAGGER 100%',
    tagline: 'Wears pixel thug life glasses with ultimate cool demeanor.',
    story: `Ayush Daddy is the ultimate cool patriarch of Kinna's crime syndicate! Rocking pixel thug life glasses and flowing dark hair, Ayush Daddy brings unmatched swagger, authority, and chill vibes to every operation. Whenever Kinna needs high-level strategic flex or squad backup, Ayush Daddy steps in with zero stress and 100% cool energy to dominate the scene!`,
    synergy: 99,
    jointOperations: [
      {
        code: 'OP-THUG-FLEX',
        name: 'Thug Life Glasses Mode',
        description: 'Flexed pixel glasses during squad standoffs to demoralize opponents.',
        status: 'LEGENDARY',
      },
      {
        code: 'OP-DADDY-BACKUP',
        name: 'The Supreme Backup',
        description: 'Provided high-level tactical advice to Kinna during crisis hours.',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'blasting-madhur',
    name: 'Blasting Madhur',
    role: 'High-Energy Explosive Laugher & Hype Master',
    icon: '💥😄',
    image: '/partner_blasting_madhur.jpg',
    perk: '+100% Explosive Laughter & Mega Decibel Energy',
    threatLevel: 'BLASTING ENERGY 98%',
    tagline: 'Laughs so loud it blasts through every obstacle and squad meeting.',
    story: `Blasting Madhur is the explosive hype engine and loud laugher of Kinna's squad! Wearing glasses and a red scarf with an open-mouthed iconic laugh, Blasting Madhur turns any tense situation into a wild party. When paper leak cartels tried to intimidate the squad, Blasting Madhur unleashed his high-decibel blasting laugh, completely shattering enemy morale and keeping Kinna energized!`,
    synergy: 98,
    jointOperations: [
      {
        code: 'OP-BLAST-LAUGH',
        name: 'Decibel Blast Wave',
        description: 'Unleashed open-mouthed laughter to boost squad morale by 200%.',
        status: 'SUCCESS',
      },
      {
        code: 'OP-RED-SCARF',
        name: 'Red Scarf Vanguard',
        description: 'Marched with red scarf high on Delhi streets shouting student slogans.',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'agent-maddi',
    name: 'Agent Maddi',
    role: 'Chief Legal Intelligence & Shadow Operative',
    icon: '🕶️👔',
    image: '/partner_agent_maddi.jpg',
    perk: '+100% Black Suit Stealth & Courtroom Infiltration',
    threatLevel: 'CLASSIFIED INTEL 99%',
    tagline: 'Dressed in sharp black suit & aviator shades at the CJP protest.',
    story: `Agent Maddi is the elite shadow legal operative and secret intel chief of Kinna's crime syndicate! Standing stoic at the frontlines of the CJP protest in a sharp black suit, tie, and dark aviator sunglasses, Agent Maddi provides high-level legal tactical support while keeping undercover surveillance on corrupt paper leak officials. No opponent escapes Agent Maddi's silent, icy gaze!`,
    synergy: 99,
    jointOperations: [
      {
        code: 'OP-SHADOW-SUIT',
        name: 'Black Suit Infiltration',
        description: 'Infiltrated CJP protest grounds in sharp suit & aviators to gather cartel intel.',
        status: 'TOP SECRET',
      },
      {
        code: 'OP-INTEL-SHIELD',
        name: 'Legal Intelligence Defense',
        description: 'Protected squad members from illegal detentions using deep courtroom legal expertise.',
        status: 'ACTIVE',
      },
    ],
  },
];

// Endless Loop Array (3 copies of sequence)
const ENDLESS_PARTNERS_LIST = [
  ...CRIME_PARTNERS_LIST,
  ...CRIME_PARTNERS_LIST,
  ...CRIME_PARTNERS_LIST,
];

export function CrimePartner() {
  const { ref } = useScrollReveal(0.1);
  const { playClick, playSuccess, playNotification } = useSound();

  const [selectedPartner, setSelectedPartner] = useState<CrimePartnerItem | null>(null);
  const [synergyScore, setSynergyScore] = useState<number>(100);
  const [testingSynergy, setTestingSynergy] = useState(false);

  // Press-and-drag scrolling state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;

    // Handle seamless infinite loop scroll reset
    const maxScroll = scrollRef.current.scrollWidth / 3;
    if (scrollRef.current.scrollLeft >= maxScroll * 2) {
      scrollRef.current.scrollLeft -= maxScroll;
    } else if (scrollRef.current.scrollLeft <= 0) {
      scrollRef.current.scrollLeft += maxScroll;
    }
  };

  const handleOpenPartner = (partner: CrimePartnerItem) => {
    if (isDragging) return; // Don't trigger modal if user was dragging
    playNotification();
    setSelectedPartner(partner);
    setSynergyScore(partner.synergy);
  };

  const handleCloseModal = () => {
    playClick();
    setSelectedPartner(null);
  };

  const handleTestSynergy = () => {
    if (!selectedPartner) return;
    playClick();
    setTestingSynergy(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setSynergyScore(Math.floor(88 + Math.random() * 12));
      if (count > 15) {
        clearInterval(interval);
        setSynergyScore(selectedPartner.synergy);
        setTestingSynergy(false);
        playSuccess();
      }
    }, 60);
  };

  return (
    <section id="crime-partner" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 64, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiUsers className="w-4 h-4 text-red-500" />
            ◆ CLASSIFIED PARTNER ARCHIVE
          </span>
          <h2 className="section-title">Crime Partners</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Press & drag to scroll endlessly. Click any Crime Partner to reveal their story with Kinna.
          </p>
          <div className="section-divider" />
        </div>

        {/* Endless Track Container */}
        <div className="relative group">

          {/* Endless Scrollable Track without visible scrollbar */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex gap-6 overflow-x-auto pb-6 pt-4 px-2 select-none cursor-grab active:cursor-grabbing no-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {ENDLESS_PARTNERS_LIST.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                onClick={() => handleOpenPartner(partner)}
                className="flex-shrink-0 w-72 sm:w-80 cursor-pointer group/card"
              >
                <div className="glass-card rounded-3xl overflow-hidden border-2 border-red-500/40 group-hover/card:border-yellow-400 transition-all duration-300 shadow-[0_0_25px_rgba(255,0,64,0.15)] group-hover/card:shadow-[0_0_35px_rgba(255,215,0,0.3)] group-hover/card:-translate-y-2">
                  {/* Partner Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <img
                      src={partner.image}
                      alt={partner.name}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Badge Icon */}
                    <div className="absolute top-3 right-3 text-2xl bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg">
                      {partner.icon}
                    </div>

                    {/* Partner Details Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="font-mono-custom text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span>CLASSIFIED DOSSIER</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      </div>
                      <h3 className="font-display font-black text-2xl text-yellow-400 mb-1 drop-shadow-md">
                        {partner.name}
                      </h3>
                      <p className="font-mono-custom text-xs text-yellow-100/80 line-clamp-2 mb-3">
                        {partner.role}
                      </p>

                      {/* Click Action Teaser */}
                      <div className="w-full py-2 px-3 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono-custom text-xs font-bold flex items-center justify-between group-hover/card:bg-yellow-500 group-hover/card:text-black transition-all">
                        <span className="flex items-center gap-1.5">
                          <FiBookOpen className="w-3.5 h-3.5" />
                          <span>READ KINNA STORY</span>
                        </span>
                        <FiChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Dossier Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={handleCloseModal}
              style={{
                maxWidth: 'min(38rem, calc(100vw - 24px))',
                maxHeight: 'calc(100dvh - 24px)',
              }}
              className="relative w-full glass-card rounded-3xl border-2 border-yellow-500/50 p-4 sm:p-6 overflow-y-auto shadow-[0_0_50px_rgba(255,215,0,0.2)] bg-black/95 my-auto cursor-pointer"
            >
              {/* Close Button & Tap-to-close Hint */}
              <div className="flex items-center justify-between border-b border-yellow-500/20 pb-3 mb-4">
                <div className="font-mono-custom text-[10px] text-yellow-400/80 font-bold flex items-center gap-1 uppercase tracking-widest">
                  <span>TAP ANYWHERE TO CLOSE</span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Header */}
              <div className="flex flex-row items-center gap-4 pb-4 border-b border-yellow-500/20 mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-yellow-400 flex-shrink-0 shadow-[0_0_15px_#FFD700]">
                  <img
                    src={selectedPartner.image}
                    alt={selectedPartner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-lg sm:text-xl">{selectedPartner.icon}</span>
                    <span className="font-mono-custom text-[9px] text-red-400 font-bold tracking-widest uppercase truncate">
                      CLASSIFIED DOSSIER
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-yellow-400 leading-tight mb-1 truncate">
                    {selectedPartner.name}
                  </h3>
                  <p className="font-mono-custom text-[11px] text-yellow-200/80 line-clamp-1 mb-2">
                    {selectedPartner.role}
                  </p>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-mono-custom text-[9px] truncate">
                    ⚡ BUFF: {selectedPartner.perk}
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="space-y-4 text-left">
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-yellow-400 mb-1.5 flex items-center gap-2">
                    <FiBookOpen className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>STORY &amp; RELATIONSHIP WITH KINNA</span>
                  </h4>
                  <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-yellow-500/20 bg-black/60 font-sans text-xs sm:text-sm text-yellow-100/90 leading-relaxed">
                    {selectedPartner.story}
                  </div>
                </div>

                {/* Synergy Score Diagnostics */}
                <div className="glass-card p-3.5 rounded-xl border border-red-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 to-yellow-500 border border-yellow-400 flex flex-col items-center justify-center font-display font-black text-xs text-white shadow-[0_0_12px_#ff0040] flex-shrink-0">
                      {synergyScore}%
                    </div>
                    <div>
                      <div className="font-mono-custom text-[11px] text-yellow-400 font-bold">
                        CHAOS SYNERGY SCORE
                      </div>
                      <div className="font-mono-custom text-[9px] text-yellow-500/60">
                        Compatibility with Kinna
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={testingSynergy}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSynergy();
                    }}
                    className="btn-gold px-3 py-2 rounded-xl font-display text-[10px] tracking-widest flex items-center gap-1.5 flex-shrink-0"
                  >
                    <FiZap className={`w-3.5 h-3.5 ${testingSynergy ? 'animate-spin' : ''}`} />
                    <span>DIAGNOSTIC</span>
                  </button>
                </div>

                {/* Joint Operations */}
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-yellow-400 mb-2 flex items-center gap-2">
                    <FiAlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>RECORDED JOINT OPERATIONS</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPartner.jointOperations.map((op) => (
                      <div
                        key={op.code}
                        className="glass-card p-3 rounded-xl border border-yellow-500/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono-custom text-[9px] text-yellow-500/60">
                            {op.code}
                          </span>
                          <span className="font-mono-custom text-[8px] text-green-400 border border-green-500/40 px-1.5 py-0.5 rounded bg-green-500/10">
                            {op.status}
                          </span>
                        </div>
                        <div className="font-display font-bold text-xs text-yellow-300 mb-0.5">
                          {op.name}
                        </div>
                        <p className="text-[11px] text-yellow-100/70 leading-normal">
                          {op.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
