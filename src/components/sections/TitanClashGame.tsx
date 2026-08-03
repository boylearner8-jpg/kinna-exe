import { useState, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import { fetchTitanLeaderboard, saveTitanScore, clearTitanLeaderboard } from '../../lib/db';
import type { TitanScore } from '../../lib/db';
import {
  FiZap,
  FiRefreshCw,
  FiPlay,
  FiAward,
  FiUser,
  FiX,
  FiTrash2,
} from 'react-icons/fi';

interface Enemy {
  id: string;
  name: string;
  type: 'cartel' | 'boss' | 'drone' | 'papaya';
  hp: number;
  maxHp: number;
  image: string;
  border: string;
  points: number;
  x: number; // percentage
  y: number; // percentage
}

const ENEMY_TYPES = [
  {
    name: 'Papa Ayush Barrier',
    image: '/partner_papa_ayush.jpg',
    type: 'papaya' as const,
    baseHp: 80,
    points: 250,
    border: 'border-amber-400',
  },
  {
    name: 'Paper Cartel Boss',
    image: '/father_vs_son_titan.jpg',
    type: 'boss' as const,
    baseHp: 150,
    points: 500,
    border: 'border-red-500',
  },
  {
    name: 'Corrupt Paper Broker',
    image: '/kinna_trolling_newspaper.jpg',
    type: 'cartel' as const,
    baseHp: 40,
    points: 120,
    border: 'border-yellow-400',
  },
  {
    name: 'Dehati Ayush Obstacle',
    image: '/gallery_dehati_ayush.jpg',
    type: 'drone' as const,
    baseHp: 30,
    points: 80,
    border: 'border-green-400',
  },
  {
    name: 'Surrendered Cartel Agent',
    image: '/advocate_bo_surrender.jpg',
    type: 'drone' as const,
    baseHp: 25,
    points: 60,
    border: 'border-blue-400',
  },
];

export function TitanClashGame() {
  const { ref, visible } = useScrollReveal(0.1);
  const { playClick, playSuccess, playBoom, playNotification } = useSound();

  // Prevent double saving score flag
  const hasSavedScoreRef = useRef(false);

  // Player Name State
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('kinna_titan_player_name') || '';
    } catch {
      return '';
    }
  });

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('kinna_titan_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [combo, setCombo] = useState(1);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [titanEnergy, setTitanEnergy] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<TitanScore[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Load Leaderboard data
  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await fetchTitanLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleClearLeaderboard = async () => {
    const pass = prompt('Enter Admin Password to clear Leaderboard:');
    if (pass === 'minaramchutiya') {
      await clearTitanLeaderboard();
      setLeaderboard([]);
      alert('Leaderboard cleared successfully!');
    } else if (pass !== null) {
      alert('Incorrect Password!');
    }
  };

  // Special ability cooldowns
  const [shockwaveCooldown, setShockwaveCooldown] = useState(0);
  const [cavalryCooldown, setCavalryCooldown] = useState(0);
  const [titanRoarCooldown, setTitanRoarCooldown] = useState(0);

  // Click floating damage texts
  const [floatingTexts, setFloatingTexts] = useState<
    { id: string; text: string; x: number; y: number; color: string }[]
  >([]);

  // Start game
  const startGame = () => {
    playBoom();
    hasSavedScoreRef.current = false; // Reset double-save lock
    setIsPlaying(true);
    setScore(0);
    setCombo(1);
    setWave(1);
    setTitanEnergy(100);
    setGameOver(false);
    setVictory(false);
    setFloatingTexts([]);

    spawnWave(1);
  };

  // Spawn Enemies for a wave
  const spawnWave = (currentWave: number) => {
    const enemyCount = 3 + currentWave * 2;
    const newEnemies: Enemy[] = [];

    for (let i = 0; i < enemyCount; i++) {
      const template = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const hpMultiplier = 1 + (currentWave - 1) * 0.3;
      const finalHp = Math.round(template.baseHp * hpMultiplier);

      newEnemies.push({
        id: `enemy-${Date.now()}-${i}-${Math.random()}`,
        name: template.name,
        type: template.type,
        hp: finalHp,
        maxHp: finalHp,
        image: template.image,
        border: template.border,
        points: template.points * currentWave,
        x: 10 + Math.random() * 75,
        y: 15 + Math.random() * 60,
      });
    }

    setEnemies(newEnemies);
  };

  // Helper to handle wave completion
  const checkWaveCompletion = async (remaining: Enemy[], currentWave: number, currentScore: number) => {
    if (remaining.length === 0) {
      if (currentWave >= 5) {
        if (hasSavedScoreRef.current) return;
        hasSavedScoreRef.current = true; // Lock to prevent double saving!

        playSuccess();
        setVictory(true);
        setIsPlaying(false);

        const nameToSave = playerName.trim() || 'Kinna Operative';
        await saveTitanScore(nameToSave, currentScore, currentWave);
        loadLeaderboard();
      } else {
        playNotification();
        const nextWave = currentWave + 1;
        setWave(nextWave);
        setTimeout(() => spawnWave(nextWave), 600);
      }
    }
  };

  // Damage Enemy Handler
  const handleHitEnemy = (enemyId: string, e: ReactMouseEvent) => {
    if (!isPlaying || gameOver || victory) return;
    playClick();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const baseDamage = 25 * combo;

    // Spawn damage pop text
    const textId = `txt-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: textId,
        text: `💥 -${baseDamage}`,
        x: clickX,
        y: clickY,
        color: combo > 3 ? '#FFD700' : '#ff0040',
      },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== textId));
    }, 800);

    setEnemies((prevEnemies) => {
      const updated = prevEnemies
        .map((enemy) => {
          if (enemy.id === enemyId) {
            const newHp = enemy.hp - baseDamage;
            if (newHp <= 0) {
              // Enemy defeated!
              playSuccess();
              const earnedPoints = enemy.points * combo;
              setScore((s) => {
                const ns = s + earnedPoints;
                if (ns > highScore) {
                  setHighScore(ns);
                  try {
                    localStorage.setItem('kinna_titan_highscore', ns.toString());
                  } catch {}
                }
                return ns;
              });
              setCombo((c) => Math.min(c + 1, 10));
              setTitanEnergy((te) => Math.min(100, te + 5));
              return null;
            }
            return { ...enemy, hp: newHp };
          }
          return enemy;
        })
        .filter(Boolean) as Enemy[];

      checkWaveCompletion(updated, wave, score);
      return updated;
    });
  };

  // Ability 1: Megaphone Shockwave
  const useShockwave = () => {
    if (shockwaveCooldown > 0 || !isPlaying || enemies.length === 0) return;
    playBoom();
    setShockwaveCooldown(8);

    const timer = setInterval(() => {
      setShockwaveCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Deal 100 area damage to all enemies
    setEnemies((prev) => {
      const updated = prev
        .map((enemy) => {
          const newHp = enemy.hp - 100;
          if (newHp <= 0) {
            setScore((s) => s + enemy.points);
            return null;
          }
          return { ...enemy, hp: newHp };
        })
        .filter(Boolean) as Enemy[];

      checkWaveCompletion(updated, wave, score);
      return updated;
    });
  };

  // Ability 2: Horse Rally Cavalry Charge
  const useCavalryCharge = () => {
    if (cavalryCooldown > 0 || !isPlaying || enemies.length === 0) return;
    playBoom();
    setCavalryCooldown(12);

    const timer = setInterval(() => {
      setCavalryCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Massive strike: 250 damage to all
    setEnemies((prev) => {
      const updated = prev
        .map((enemy) => {
          const newHp = enemy.hp - 250;
          if (newHp <= 0) {
            setScore((s) => s + enemy.points * 2);
            return null;
          }
          return { ...enemy, hp: newHp };
        })
        .filter(Boolean) as Enemy[];

      checkWaveCompletion(updated, wave, score);
      return updated;
    });
  };

  // Ability 3: Titan Roar (Max Combo Mode)
  const useTitanRoar = () => {
    if (titanRoarCooldown > 0 || !isPlaying || enemies.length === 0) return;
    playSuccess();
    setCombo(10);
    setTitanRoarCooldown(15);

    const timer = setInterval(() => {
      setTitanRoarCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <section id="titan-clash" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Radial Gold Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiZap className="w-4 h-4 text-yellow-400" />
            ◆ 500FT TITAN ARCADE CLASH
          </span>
          <h2 className="section-title">Titan Clash</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.6)' }}>
            Kinna’s 500ft Colossal Titan vs Papa Ayush & Paper Leak Cartel Villains
          </p>
          <div className="section-divider" />
        </div>

        {/* Game Console Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl border-2 border-yellow-500/40 shadow-[0_0_50px_rgba(255,215,0,0.2)] bg-black/95 overflow-hidden"
        >
          {/* Arcade Header Bar */}
          <div className="p-4 border-b border-yellow-500/30 bg-yellow-500/10 flex items-center justify-between flex-wrap gap-3 font-mono-custom text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-yellow-400 uppercase tracking-widest">
                TITAN MODE: 500FT COLOSSAL ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-4 text-yellow-300 font-bold flex-wrap">
              <div>SCORE: <span className="text-yellow-400 font-display text-sm">{score}</span></div>
              <div>HIGH: <span className="text-amber-400 font-display text-sm">{highScore}</span></div>
              <div className="bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/40">
                WAVE {wave}/5
              </div>
              <button
                onClick={() => {
                  playClick();
                  loadLeaderboard();
                  setShowLeaderboard((prev) => !prev);
                }}
                className="px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 font-bold inline-flex items-center gap-1.5 transition-all active:scale-95"
              >
                <FiAward className="w-3.5 h-3.5 text-yellow-400" />
                <span>LEADERBOARD</span>
              </button>
            </div>
          </div>

          {/* Main Battle Arena Area */}
          <div className="relative h-[420px] sm:h-[480px] bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden select-none">
            {/* Background Titan Shadow Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="font-display text-[160px] font-black text-yellow-400 tracking-widest text-center select-none">
                TITAN
              </div>
            </div>

            {/* Leaderboard Modal Overlay */}
            {showLeaderboard && (
              <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3 mb-4">
                  <div className="flex items-center gap-2 font-display text-yellow-400 text-lg font-black tracking-wider">
                    <FiAward className="w-5 h-5 text-yellow-400" />
                    <span>OPERATIVE LEADERBOARD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearLeaderboard}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-mono-custom text-[11px] font-bold hover:bg-red-500/30 flex items-center gap-1"
                      title="Clear Leaderboard Records (Admin Password)"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span>CLEAR</span>
                    </button>
                    <button
                      onClick={() => setShowLeaderboard(false)}
                      className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingLeaderboard ? (
                  <div className="text-center py-10 font-mono-custom text-xs text-yellow-400/80 animate-pulse">
                    Loading operative records from database...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 font-mono-custom text-xs text-yellow-400/70 space-y-2">
                    <div className="text-2xl">🏆</div>
                    <div className="font-bold text-yellow-300">NO OPERATIVE RECORDS YET</div>
                    <div className="text-[11px] text-yellow-500/60 max-w-xs mx-auto">
                      Be the very first operative to transform & top the Titan Clash Leaderboard!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex-1">
                    {leaderboard.map((item, index) => {
                      const rank = index + 1;
                      const badge =
                        rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                      return (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 font-mono-custom text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 text-center font-bold text-sm text-yellow-400">{badge}</span>
                            <div>
                              <div className="font-bold text-yellow-300 text-sm">{item.player_name}</div>
                              <div className="text-[10px] text-yellow-400/60">Wave Reached: {item.wave_reached}/5</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display font-bold text-yellow-400 text-sm">{item.high_score || item.score}</div>
                            <div className="text-[9px] text-yellow-500/60 uppercase tracking-widest">PTS</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {isPlaying && !victory && !gameOver ? (
              <>
                {/* HUD Top Controls */}
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none font-mono-custom text-xs">
                  {/* Combo Counter */}
                  <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-yellow-500/40 text-yellow-300 font-bold flex items-center gap-1.5 shadow-lg">
                    <span>🔥 COMBO:</span>
                    <span className="text-yellow-400 font-display text-base">{combo}x</span>
                  </div>

                  {/* Titan Energy Bar */}
                  <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-yellow-500/40 text-yellow-300 font-bold flex items-center gap-2 shadow-lg w-48 sm:w-64">
                    <span>⚡ ENERGY:</span>
                    <div className="flex-1 h-3 bg-yellow-500/20 rounded-full overflow-hidden border border-yellow-500/30">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                        style={{ width: `${titanEnergy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Character Enemies */}
                {enemies.map((enemy) => {
                  const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
                  return (
                    <motion.div
                      key={enemy.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={(e) => handleHitEnemy(enemy.id, e)}
                      style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-crosshair group/target p-2 rounded-2xl bg-black/80 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-400 transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    >
                      {/* Character Photo Frame */}
                      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 ${enemy.border} shadow-lg mb-1 mx-auto bg-black`}>
                        <img
                          src={enemy.image}
                          alt={enemy.name}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="w-full h-full object-cover group-hover/target:scale-110 transition-transform duration-300 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </div>

                      {/* Enemy Name & HP Bar */}
                      <div className="w-24 text-center">
                        <div className="font-mono-custom text-[9px] text-yellow-300 truncate font-bold mb-0.5">
                          {enemy.name}
                        </div>
                        <div className="h-2 bg-red-950 rounded-full overflow-hidden border border-red-500/40">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Damage Popups */}
                <AnimatePresence>
                  {floatingTexts.map((txt) => (
                    <motion.div
                      key={txt.id}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -40, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      style={{ left: txt.x, top: txt.y, color: txt.color }}
                      className="absolute pointer-events-none font-display font-black text-lg z-30 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                    >
                      {txt.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            ) : victory ? (
              /* Victory Screen */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-black/95 backdrop-blur-md overflow-y-auto custom-scrollbar z-30">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-2.5 sm:space-y-4 max-w-sm sm:max-w-md my-auto"
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 sm:border-4 border-yellow-400 shadow-[0_0_25px_#FFD700] bg-black flex-shrink-0">
                    <img
                      src="/kinna_victory.jpg"
                      alt="Kinna Victory"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-3xl text-yellow-400 leading-tight">
                    PAPER LEAK CARTEL DESTROYED!
                  </h3>
                  <p className="font-mono-custom text-[11px] sm:text-xs text-yellow-100/90 leading-relaxed max-w-xs sm:max-w-md mx-auto">
                    Kinna’s 500ft Titan successfully defeated Papa Ayush & crushed all 5 waves of paper leak villains! 100% Student Justice delivered!
                  </p>

                  <div className="bg-yellow-500/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-yellow-500/30 font-mono-custom text-[11px] sm:text-xs text-yellow-300 space-y-0.5 sm:space-y-1">
                    <div>OPERATIVE: <span className="font-bold text-yellow-400">{playerName || 'Kinna Operative'}</span></div>
                    <div>FINAL SCORE: <span className="font-display text-sm sm:text-base text-yellow-400">{score}</span></div>
                    <div>HIGH SCORE: <span className="font-display text-sm sm:text-base text-amber-400">{highScore}</span></div>
                  </div>

                  <div className="pt-1 flex justify-center gap-2">
                    <button
                      onClick={startGame}
                      className="btn-gold px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-display font-bold text-xs inline-flex items-center gap-2 shadow-[0_0_25px_rgba(255,215,0,0.4)]"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>PLAY AGAIN</span>
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        setShowLeaderboard(true);
                      }}
                      className="px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-mono-custom font-bold text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 inline-flex items-center gap-2"
                    >
                      <FiAward className="w-4 h-4 text-yellow-400" />
                      <span>LEADERBOARD</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* Start Screen */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-black/95 backdrop-blur-md overflow-y-auto custom-scrollbar z-30">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-2.5 sm:space-y-4 max-w-sm sm:max-w-md my-auto"
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-2 sm:border-4 border-yellow-400 shadow-[0_0_25px_#FFD700] animate-pulse bg-black flex-shrink-0">
                    <img
                      src="/titan_start_pfp.jpg"
                      alt="Kinna Operative Specimen"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-yellow-400 leading-tight">
                    TITAN CLASH: CJP REVOLUTION
                  </h3>

                  {/* Operative Name Input */}
                  <div className="w-full max-w-xs mx-auto text-left mb-1">
                    <label className="block font-mono-custom text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <FiUser className="w-3 h-3 text-yellow-400" />
                      <span>YOUR OPERATIVE NAME:</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        try {
                          localStorage.setItem('kinna_titan_player_name', e.target.value);
                        } catch {}
                      }}
                      placeholder="Enter your name..."
                      maxLength={25}
                      className="w-full bg-black/90 border border-yellow-500/40 rounded-xl px-3 py-2 text-yellow-300 font-mono-custom text-xs outline-none focus:border-yellow-400 text-center"
                    />
                  </div>

                  <p className="font-mono-custom text-[11px] sm:text-xs text-yellow-100/80 leading-relaxed max-w-xs sm:max-w-md mx-auto">
                    Tap/click on Papa Ayush barriers, paper leak brokers, and corrupt examiners to crush them with Kinna’s 500ft Titan fists!
                  </p>

                  <div className="pt-1 flex justify-center gap-2">
                    <button
                      onClick={startGame}
                      className="btn-gold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-display font-black text-xs sm:text-sm tracking-widest inline-flex items-center gap-2 shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:scale-105 transition-all"
                    >
                      <FiPlay className="w-4 h-4 sm:w-5 sm:h-5 text-black font-bold" />
                      <span>TRANSFORM & PLAY</span>
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        setShowLeaderboard(true);
                      }}
                      className="px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-mono-custom font-bold text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 inline-flex items-center gap-2"
                    >
                      <FiAward className="w-4 h-4 text-yellow-400" />
                      <span>LEADERBOARD</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Arcade Bottom Special Ability Controls */}
          {isPlaying && !victory && !gameOver && (
            <div className="p-4 border-t border-yellow-500/30 bg-yellow-500/5 grid grid-cols-3 gap-3 font-mono-custom text-xs">
              <button
                onClick={useShockwave}
                disabled={shockwaveCooldown > 0 || enemies.length === 0}
                className="py-3 px-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 font-bold hover:bg-yellow-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
              >
                <span>📣 SHOCKWAVE (100 DMG)</span>
                {shockwaveCooldown > 0 && <span className="text-[10px] text-red-400">CD: {shockwaveCooldown}s</span>}
              </button>

              <button
                onClick={useCavalryCharge}
                disabled={cavalryCooldown > 0 || enemies.length === 0}
                className="py-3 px-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 font-bold hover:bg-yellow-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
              >
                <span>🏇 CAVALRY CHARGE (250 DMG)</span>
                {cavalryCooldown > 0 && <span className="text-[10px] text-red-400">CD: {cavalryCooldown}s</span>}
              </button>

              <button
                onClick={useTitanRoar}
                disabled={titanRoarCooldown > 0 || enemies.length === 0}
                className="py-3 px-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 font-bold hover:bg-yellow-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
              >
                <span>⚡ TITAN ROAR (10X COMBO)</span>
                {titanRoarCooldown > 0 && <span className="text-[10px] text-red-400">CD: {titanRoarCooldown}s</span>}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
