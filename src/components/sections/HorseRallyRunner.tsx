import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import {
  fetchHorseRunnerLeaderboard,
  saveHorseRunnerScore,
  clearHorseRunnerLeaderboard,
} from '../../lib/db';
import type { HorseRunnerScore } from '../../lib/db';
import {
  FiPlay,
  FiRefreshCw,
  FiTrendingUp,
  FiUserCheck,
  FiCheck,
  FiAward,
  FiUser,
  FiX,
  FiTrash2,
} from 'react-icons/fi';

// Unified World Dimensions
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 300;
const GROUND_Y = 40; // Ground offset from bottom in world pixels

// Player Bounding Box (World Units - Square so all aspect ratios fit consistently)
const PLAYER_X = 80; // Player X position in world units
const PLAYER_SIZE = 110; // Square bounding box (width = height) for consistent sizing
const PLAYER_WIDTH = PLAYER_SIZE;
const PLAYER_HEIGHT = PLAYER_SIZE;

export interface PlayableCharacter {
  id: string;
  name: string;
  title: string;
  image: string;
  scale?: number; // Optional extra visual scale (1.0 = default)
}

export const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    id: 'motu-aryan',
    name: 'Motu Madhur & Aryan',
    title: 'Highway Horse Rider',
    image: '/motu_aryan_cutout.png',
    scale: 1.0,
  },
  {
    id: 'pandit-bilal',
    name: 'Pandit Bilal',
    title: 'Supreme Operative',
    image: '/pandit_bilal_cutout.png',
    scale: 1.0,
  },
  {
    id: 'devil-kinna',
    name: 'Devil Kinna',
    title: 'Demonic Specimen',
    image: '/devil_kinna_cutout.png',
    scale: 1.05,
  },
  {
    id: 'ghoda-aryan',
    name: 'Ghoda (Aryan)',
    title: 'Legendary Horse',
    image: '/ghoda_cutout.png',
    scale: 1.0,
  },
  {
    id: 'mota-madhur',
    name: 'Mota Madhur',
    title: 'Pout Master',
    image: '/mota_madhur_cutout.png',
    scale: 1.0,
  },
  {
    id: 'gola',
    name: 'Gola',
    title: 'Smiling Operative',
    image: '/gola_cutout.png',
    scale: 1.0,
  },
  {
    id: 'egg',
    name: 'Egg',
    title: 'Egghead Specimen',
    image: '/egg_cutout.png',
    scale: 0.9,
  },
  {
    id: 'advocate-bo',
    name: 'Advocate Bo',
    title: 'Legal Mastermind',
    image: '/advocate_bo_cutout.png',
    scale: 1.0,
  },
];

interface Obstacle {
  id: string;
  x: number; // World X position (800 -> 0)
  width: number; // World width
  height: number; // World height
  icon: string;
}

export function HorseRallyRunner() {
  const { ref, visible } = useScrollReveal(0.1);
  const { playClick, playBoom } = useSound();

  // Character Selection State
  const [selectedCharId, setSelectedCharId] = useState<string>(() => {
    try {
      return localStorage.getItem('kinna_runner_selected_char') || 'motu-aryan';
    } catch {
      return 'motu-aryan';
    }
  });

  const activeCharacter =
    PLAYABLE_CHARACTERS.find((c) => c.id === selectedCharId) || PLAYABLE_CHARACTERS[0];

  // Prevent double saving score flag
  const hasSavedScoreRef = useRef(false);

  // Player Name State
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('kinna_runner_player_name') || '';
    } catch {
      return '';
    }
  });

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('kinna_dino_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<HorseRunnerScore[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Load Leaderboard data
  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await fetchHorseRunnerLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load runner leaderboard:', err);
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
      await clearHorseRunnerLeaderboard();
      setLeaderboard([]);
      alert('Leaderboard cleared successfully!');
    } else if (pass !== null) {
      alert('Incorrect Password!');
    }
  };

  // Smooth Render States & Direct GPU Refs
  const [renderObstacles, setRenderObstacles] = useState<Obstacle[]>([]);
  const playerElRef = useRef<HTMLDivElement>(null);

  // Engine Refs (runs inside 60FPS requestAnimationFrame)
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const scoreRef = useRef(0);
  const lastRenderedScoreRef = useRef(-1);
  const speedRef = useRef(5.0); // Smooth base speed
  const playerYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const jumpVelocityRef = useRef(0);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const startTimeRef = useRef(0);

  // Jump Action (Dino Jump)
  const handleJump = () => {
    if (gameOver || !isPlaying) return;
    if (!isJumpingRef.current && playerYRef.current <= 0) {
      playClick();
      isJumpingRef.current = true;
      jumpVelocityRef.current = 11.5; // Smooth responsive jump
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isPlaying && !gameOver) {
          startGame();
        } else {
          handleJump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Start Game Reset
  const startGame = () => {
    playClick();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);

    scoreRef.current = 0;
    lastRenderedScoreRef.current = 0;
    speedRef.current = 5.0;
    playerYRef.current = 0;
    isJumpingRef.current = false;
    jumpVelocityRef.current = 0;
    obstaclesRef.current = [];
    setRenderObstacles([]);

    if (playerElRef.current) {
      playerElRef.current.style.bottom = `${(GROUND_Y / WORLD_HEIGHT) * 100}%`;
    }

    const now = performance.now();
    lastTimeRef.current = now;
    lastSpawnTimeRef.current = now;
    startTimeRef.current = now;
  };

  // Main 60FPS GPU Game Engine Loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const gameLoop = (time: number) => {
      lastTimeRef.current = time;

      // 1. Player Jump & Gravity Physics (Direct GPU DOM update for 60FPS mobile smoothness)
      if (isJumpingRef.current || playerYRef.current > 0) {
        playerYRef.current += jumpVelocityRef.current;
        jumpVelocityRef.current -= 0.44; // Crisp responsive gravity pull

        if (playerYRef.current <= 0) {
          playerYRef.current = 0;
          jumpVelocityRef.current = 0;
          isJumpingRef.current = false;
        }

        if (playerElRef.current) {
          playerElRef.current.style.bottom = `${((GROUND_Y + playerYRef.current) / WORLD_HEIGHT) * 100}%`;
        }
      }

      // 2. Continuous Speed & Distance Scaling (Base 5.0 -> Max 3x = 15.0 reached over 3 minutes / 180s)
      const elapsedSeconds = Math.max(0, (time - startTimeRef.current) / 1000);
      const progressRatio = Math.min(1.0, elapsedSeconds / 180); // 0.0 at start -> 1.0 at 3 min
      const BASE_SPEED = 5.0;
      const MAX_SPEED = 15.0; // 3x base speed
      const currentSpeed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * progressRatio;
      speedRef.current = currentSpeed;

      const speedMultiplier = currentSpeed / BASE_SPEED;
      scoreRef.current += 0.28 * speedMultiplier;
      const currentScore = Math.floor(scoreRef.current);

      // Throttled score update to eliminate React re-render lag on mobile
      if (currentScore !== lastRenderedScoreRef.current) {
        lastRenderedScoreRef.current = currentScore;
        setScore(currentScore);

        if (currentScore > highScore) {
          setHighScore(currentScore);
          try {
            localStorage.setItem('kinna_dino_highscore', currentScore.toString());
          } catch {}
        }
      }

      // 3. Move & Filter Obstacles in Unified World Units
      let hasCollision = false;

      obstaclesRef.current = obstaclesRef.current
        .map((obs) => {
          const nextX = obs.x - currentSpeed;

          // Unified Bounding Box Intersection Check
          const obsLeft = nextX;
          const obsRight = nextX + obs.width;
          const obsTop = obs.height;
          const playerBottom = playerYRef.current;

          const overlapX = PLAYER_X < obsRight && PLAYER_X + PLAYER_WIDTH > obsLeft;
          const overlapY = playerBottom < obsTop - 14; // Grace margin

          if (overlapX && overlapY) {
            hasCollision = true;
          }

          return { ...obs, x: nextX };
        })
        .filter((obs) => obs.x + obs.width > 0);

      // Handle Collision / Game Over
      if (hasCollision) {
        playBoom();
        setGameOver(true);
        setIsPlaying(false);

        const currentFinalScore = Math.floor(scoreRef.current);
        if (!hasSavedScoreRef.current) {
          hasSavedScoreRef.current = true;
          const nameToSave = playerName.trim() || 'Kinna Runner';
          saveHorseRunnerScore(nameToSave, currentFinalScore, activeCharacter.name).then(() => {
            loadLeaderboard();
          });
        }
        return;
      }

      // 4. Obstacle Spawner (Strict 380px Minimum Distance Gap for Mobile Comfort)
      const timeSinceSpawn = time - lastSpawnTimeRef.current;
      const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
      const distFromLast = lastObs ? (WORLD_WIDTH - lastObs.x) : 999;
      const dynamicGap = Math.max(1000, 1800 / (speedMultiplier ** 0.5));

      // Guarantees at least 380 world-units (almost half the screen) between consecutive obstacles!
      if (distFromLast >= 380 && timeSinceSpawn > dynamicGap + Math.random() * (500 / speedMultiplier)) {
        lastSpawnTimeRef.current = time;

        const types = [
          { icon: '🚧', width: 38, height: 44 },
          { icon: '🛑', width: 32, height: 38 },
          { icon: '🧱', width: 40, height: 42 },
          { icon: '📦', width: 34, height: 36 },
        ];
        const chosen = types[Math.floor(Math.random() * types.length)];

        obstaclesRef.current.push({
          id: `obs-${Date.now()}-${Math.random()}`,
          x: WORLD_WIDTH,
          width: chosen.width,
          height: chosen.height,
          icon: chosen.icon,
        });
      }

      // Sync obstacle render positions
      setRenderObstacles([...obstaclesRef.current]);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, gameOver, highScore]);

  // Format Dino 5-digit Score
  const formatDinoScore = (num: number) => num.toString().padStart(5, '0');

  return (
    <section id="horse-runner" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 165, 0, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-amber-400" />
            ◆ ENDLESS HORSE RUNNER
          </span>
          <h2 className="section-title">Horse Runner</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.6)' }}>
            Choose your custom character & jump over obstacles! Tap screen or press Spacebar to jump.
          </p>
          <div className="section-divider" />
        </div>

        {/* Dino Game Frame Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(255,165,0,0.2)] bg-black/95 overflow-hidden relative"
        >
          {/* Dino Arcade Header Ticker */}
          <div className="px-3 sm:px-4 py-2.5 border-b border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-2 font-mono-custom text-xs">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] sm:text-xs truncate">
                <span className="hidden sm:inline">CHARACTER: </span>{activeCharacter.name}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-amber-300 font-bold shrink-0">
              {/* Score Ticker Display (HI 01200  00450) */}
              <div className="font-mono-custom text-xs sm:text-sm font-bold text-amber-300 tracking-wider whitespace-nowrap tabular-nums">
                <span className="text-amber-500/80 mr-1.5 sm:mr-3 text-[10px] sm:text-xs">
                  HI {formatDinoScore(highScore)}
                </span>
                <span className="text-yellow-400 font-display">
                  {formatDinoScore(score)}
                </span>
              </div>

              <button
                onClick={() => {
                  playClick();
                  loadLeaderboard();
                  setShowLeaderboard((prev) => !prev);
                }}
                className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold inline-flex items-center gap-1 transition-all active:scale-95 text-[10px]"
              >
                <FiAward className="w-3.5 h-3.5 text-amber-400" />
                <span>LEADERBOARD</span>
              </button>
            </div>
          </div>

          {/* Main Interactive Canvas Area (Synchronized World Coordinates) */}
          <div
            onClick={handleJump}
            onTouchStart={(e) => {
              e.preventDefault();
              handleJump();
            }}
            className={`relative w-full bg-black/90 overflow-hidden select-none border-b border-amber-500/20 touch-none transition-all duration-300 ${
              isPlaying ? 'h-[280px] sm:h-[340px] cursor-pointer' : 'min-h-[460px] sm:min-h-[500px]'
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Selected Character Sprite (Direct GPU Ref for 60FPS Mobile Smoothness) */}
            <div
              ref={playerElRef}
              style={{
                left: `${(PLAYER_X / WORLD_WIDTH) * 100}%`,
                bottom: `${(GROUND_Y / WORLD_HEIGHT) * 100}%`,
                width: `${(PLAYER_WIDTH / WORLD_WIDTH) * 100}%`,
                height: `${(PLAYER_HEIGHT / WORLD_HEIGHT) * 100}%`,
              }}
              className="absolute z-20 pointer-events-none drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] flex items-end justify-center"
            >
              <img
                src={activeCharacter.image}
                alt={activeCharacter.name}
                className="w-full h-full object-contain object-bottom"
                style={{
                  objectPosition: 'bottom center',
                  transform: `scale(${activeCharacter.scale ?? 1.0})`,
                  transformOrigin: 'bottom center',
                }}
              />
            </div>

            {/* Highway Ground Line (Synchronized % World Position) */}
            <div
              style={{ bottom: `${(GROUND_Y / WORLD_HEIGHT) * 100}%` }}
              className="absolute inset-x-0 h-0.5 bg-amber-500/40 shadow-[0_0_10px_#FFA500]"
            />

            {/* Dynamic Obstacles (Synchronized % World Position) */}
            {renderObstacles.map((obs) => (
              <div
                key={obs.id}
                style={{
                  left: `${(obs.x / WORLD_WIDTH) * 100}%`,
                  bottom: `${(GROUND_Y / WORLD_HEIGHT) * 100}%`,
                  width: `${(obs.width / WORLD_WIDTH) * 100}%`,
                  height: `${(obs.height / WORLD_HEIGHT) * 100}%`,
                }}
                className="absolute z-10 flex items-center justify-center font-display text-3xl sm:text-4xl drop-shadow-[0_0_8px_rgba(255,165,0,0.4)] pointer-events-none"
              >
                {obs.icon}
              </div>
            ))}

            {/* Leaderboard Modal Overlay */}
            {showLeaderboard && (
              <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md p-3 sm:p-5 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5 mb-3">
                  <div className="flex items-center gap-2 font-display text-amber-400 text-sm sm:text-base font-black tracking-wider">
                    <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span>RUNNER LEADERBOARD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearLeaderboard}
                      className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-mono-custom text-[10px] font-bold hover:bg-red-500/30 flex items-center gap-1"
                      title="Clear Leaderboard Records (Admin Password)"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>CLEAR</span>
                    </button>
                    <button
                      onClick={() => setShowLeaderboard(false)}
                      className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingLeaderboard ? (
                  <div className="text-center py-8 font-mono-custom text-xs text-amber-400/80 animate-pulse">
                    Loading runner records from database...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-10 font-mono-custom text-xs text-amber-400/70 space-y-2">
                    <div className="text-2xl">🏇</div>
                    <div className="font-bold text-amber-300">NO RUNNER RECORDS YET</div>
                    <div className="text-[11px] text-amber-500/60 max-w-xs mx-auto">
                      Be the very first runner to set a high score on the global leaderboard!
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
                          className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 font-mono-custom text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 text-center font-bold text-xs sm:text-sm text-yellow-400">{badge}</span>
                            <div>
                              <div className="font-bold text-amber-200 text-xs">{item.player_name}</div>
                              <div className="text-[9px] text-amber-400/60">{item.character_name || 'Horse Rider'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display font-bold text-yellow-400 text-xs sm:text-sm">{item.high_score || item.score}</div>
                            <div className="text-[8px] text-amber-500/60 uppercase tracking-widest">PTS</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Game Over Screen Overlay with Responsive Character Selector */}
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md z-30 p-3 sm:p-4 text-center overflow-hidden">

                {/* Center Content: Avatar + GAME OVER + Big Score Box + Action Buttons */}
                <div className="flex flex-col items-center justify-center my-auto w-full max-w-sm sm:max-w-md">
                  {/* Selected Character Cutout — Big & Direct (No Circular Frame) */}
                  <div className="w-28 h-28 sm:w-40 sm:h-40 mb-2 flex items-center justify-center relative shrink-0">
                    <img
                      src={activeCharacter.image}
                      alt={activeCharacter.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,0,64,0.7)]"
                    />
                  </div>

                  {/* GAME OVER Title */}
                  <div className="font-display font-black text-red-500 tracking-wider text-xl sm:text-2xl mb-1">
                    G A M E &nbsp; O V E R
                  </div>

                  {/* Big Prominent Score Box */}
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 mb-2 sm:mb-3 font-mono-custom shadow-[0_0_20px_rgba(255,165,0,0.15)] flex items-center justify-around text-center">
                    <div>
                      <div className="text-[9px] sm:text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                        FINAL SCORE
                      </div>
                      <div className="font-display font-black text-xl sm:text-3xl text-yellow-400">
                        {formatDinoScore(score)}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-amber-500/30" />
                    <div>
                      <div className="text-[9px] sm:text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                        HIGH SCORE
                      </div>
                      <div className="font-display font-bold text-lg sm:text-2xl text-amber-300">
                        {formatDinoScore(highScore)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-center w-full">
                    <button
                      onClick={startGame}
                      onTouchStart={(e) => { e.preventDefault(); startGame(); }}
                      className="btn-gold px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,165,0,0.4)] active:scale-95 transition-transform flex-1"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>RESTART GAME</span>
                    </button>

                    <button
                      onClick={() => {
                        playClick();
                        loadLeaderboard();
                        setShowLeaderboard(true);
                      }}
                      className="px-4 py-2.5 sm:py-3 rounded-2xl font-mono-custom font-bold text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <FiAward className="w-4 h-4 text-amber-400" />
                      <span>LEADERBOARD</span>
                    </button>
                  </div>
                </div>

                {/* Bottom: Switch Character carousel */}
                <div className="w-full flex-shrink-0 border-t border-amber-500/20"
                  style={{ paddingTop: 'clamp(4px, 1vw, 8px)' }}>

                  {/* Section label */}
                  <div className="font-mono-custom uppercase text-amber-400/80 font-bold flex items-center justify-center gap-1 mb-1.5"
                    style={{ fontSize: 'clamp(8px, 1.8vw, 10px)' }}>
                    <FiUserCheck style={{ width: '10px', height: '10px' }} className="text-yellow-400 flex-shrink-0" />
                    <span>SWITCH CHARACTER &amp; RESTART:</span>
                  </div>

                  {/* Scrollable card row */}
                  <div
                    className="w-full overflow-x-auto"
                    style={{
                      paddingBottom: 'clamp(4px, 1vw, 8px)',
                      paddingLeft: 'clamp(4px, 1vw, 8px)',
                      paddingRight: 'clamp(4px, 1vw, 8px)',
                      /* hide scrollbar visually but keep scrollable */
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    <div
                      className="flex items-stretch"
                      style={{
                        gap: 'clamp(6px, 1.5vw, 12px)',
                        scrollSnapType: 'x mandatory',
                        width: 'max-content',
                        margin: '0 auto',
                      }}
                    >
                      {PLAYABLE_CHARACTERS.map((char) => {
                        const isSelected = char.id === selectedCharId;
                        return (
                          <button
                            key={char.id}
                            onClick={() => {
                              playClick();
                              setSelectedCharId(char.id);
                              try { localStorage.setItem('kinna_runner_selected_char', char.id); } catch {}
                            }}
                            style={{
                              scrollSnapAlign: 'start',
                              width: 'clamp(72px, 14vw, 110px)',
                              minHeight: '44px',
                              padding: 'clamp(4px, 1vw, 8px)',
                              flexShrink: 0,
                            }}
                            className={[
                              'relative rounded-xl border transition-all duration-150 flex flex-col items-center justify-start text-center',
                              'active:scale-95',
                              isSelected
                                ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_14px_rgba(255,215,0,0.45)]'
                                : 'bg-black/70 border-amber-500/20 hover:border-amber-500/40 opacity-70 hover:opacity-100',
                            ].join(' ')}
                          >
                            {/* Selected badge — inset so it never overflows */}
                            {isSelected && (
                              <span className="absolute top-1 right-1 bg-amber-400 text-black rounded-full flex items-center justify-center z-10"
                                style={{ width: 'clamp(12px, 2.5vw, 16px)', height: 'clamp(12px, 2.5vw, 16px)' }}>
                                <FiCheck style={{ width: '65%', height: '65%', strokeWidth: 3 }} />
                              </span>
                            )}

                            {/* Avatar — square, never cropped */}
                            <div
                              className="flex items-center justify-center overflow-hidden flex-shrink-0"
                              style={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                maxWidth: 'clamp(48px, 10vw, 80px)',
                                margin: '0 auto clamp(3px, 0.8vw, 6px)',
                              }}
                            >
                              <img
                                src={char.image}
                                alt={char.name}
                                className="w-full h-full"
                                style={{ objectFit: 'contain', display: 'block' }}
                              />
                            </div>

                            {/* Name — wraps to 2 lines, never overflows */}
                            <div
                              className="font-mono-custom font-bold text-amber-200 w-full leading-tight"
                              style={{
                                fontSize: 'clamp(7px, 1.6vw, 9px)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                              }}
                            >
                              {char.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Initial Start Screen Overlay with Direct Scrollable Character Menu */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md z-30 p-3 sm:p-4 text-center overflow-hidden">
                {/* Header & Character Preview */}
                <div className="flex flex-col items-center my-auto">
                  {/* Selected Character Cutout — Big & Direct (No Circular Frame) */}
                  <div className="w-28 h-28 sm:w-40 sm:h-40 mb-2 flex items-center justify-center relative shrink-0">
                    <img
                      src={activeCharacter.image}
                      alt={activeCharacter.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]"
                    />
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-amber-400 mb-0.5 tracking-wider">
                    HORSE RUNNER
                  </h3>

                  {/* Operative Name Input */}
                  <div className="w-full max-w-xs mx-auto text-left mb-1.5">
                    <label className="block font-mono-custom text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                      <FiUser className="w-3 h-3 text-yellow-400" />
                      <span>YOUR RUNNER NAME:</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        try {
                          localStorage.setItem('kinna_runner_player_name', e.target.value);
                        } catch {}
                      }}
                      placeholder="Enter your name..."
                      maxLength={25}
                      className="w-full bg-black/90 border border-amber-500/40 rounded-xl px-3 py-1.5 text-yellow-300 font-mono-custom text-xs outline-none focus:border-amber-400 text-center"
                    />
                  </div>

                  <p className="font-mono-custom text-[11px] text-yellow-100/80 mb-2">
                    ACTIVE: <span className="font-bold text-amber-300">{activeCharacter.name}</span>
                  </p>

                  <div className="flex gap-2 justify-center mb-1">
                    <button
                      onClick={startGame}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        startGame();
                      }}
                      className="btn-gold px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-display font-black text-xs sm:text-sm tracking-widest inline-flex items-center gap-2 shadow-[0_0_30px_rgba(255,165,0,0.5)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <FiPlay className="w-4 h-4 text-black font-bold" />
                      <span>START GAME</span>
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        loadLeaderboard();
                        setShowLeaderboard(true);
                      }}
                      className="px-4 py-2.5 sm:py-3 rounded-2xl font-mono-custom font-bold text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 inline-flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <FiAward className="w-4 h-4 text-amber-400" />
                      <span>LEADERBOARD</span>
                    </button>
                  </div>
                </div>

                {/* Direct Horizontal Scrollable Character Menu — Responsive */}
                <div className="w-full flex-shrink-0 border-t border-amber-500/20"
                  style={{ paddingTop: 'clamp(4px, 1vw, 8px)' }}>

                  <div className="font-mono-custom uppercase text-amber-400/80 font-bold flex items-center justify-center gap-1 mb-1.5"
                    style={{ fontSize: 'clamp(8px, 1.8vw, 10px)' }}>
                    <FiUserCheck style={{ width: '10px', height: '10px' }} className="text-yellow-400 flex-shrink-0" />
                    <span>CHOOSE PLAYABLE CHARACTER:</span>
                  </div>

                  {/* Scrollable row — hides scrollbar, scroll-snap enabled */}
                  <div
                    className="w-full overflow-x-auto"
                    style={{
                      paddingBottom: 'clamp(4px, 1vw, 8px)',
                      paddingLeft: 'clamp(4px, 1vw, 8px)',
                      paddingRight: 'clamp(4px, 1vw, 8px)',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    <div
                      className="flex items-stretch"
                      style={{
                        gap: 'clamp(6px, 1.5vw, 12px)',
                        scrollSnapType: 'x mandatory',
                        width: 'max-content',
                        margin: '0 auto',
                      }}
                    >
                      {PLAYABLE_CHARACTERS.map((char) => {
                        const isSelected = char.id === selectedCharId;
                        return (
                          <button
                            key={char.id}
                            onClick={() => {
                              playClick();
                              setSelectedCharId(char.id);
                              try { localStorage.setItem('kinna_runner_selected_char', char.id); } catch {}
                            }}
                            style={{
                              scrollSnapAlign: 'start',
                              width: 'clamp(72px, 14vw, 110px)',
                              minHeight: '44px',
                              padding: 'clamp(4px, 1vw, 8px)',
                              flexShrink: 0,
                            }}
                            className={[
                              'relative rounded-xl border transition-all duration-150 flex flex-col items-center justify-start text-center',
                              'active:scale-95',
                              isSelected
                                ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_14px_rgba(255,215,0,0.45)]'
                                : 'bg-black/70 border-amber-500/20 hover:border-amber-500/40 opacity-70 hover:opacity-100',
                            ].join(' ')}
                          >
                            {/* Selected badge — inset, never overflows */}
                            {isSelected && (
                              <span className="absolute top-1 right-1 bg-amber-400 text-black rounded-full flex items-center justify-center z-10"
                                style={{ width: 'clamp(12px, 2.5vw, 16px)', height: 'clamp(12px, 2.5vw, 16px)' }}>
                                <FiCheck style={{ width: '65%', height: '65%', strokeWidth: 3 }} />
                              </span>
                            )}

                            {/* Avatar — square, never cropped */}
                            <div
                              className="flex items-center justify-center overflow-hidden flex-shrink-0"
                              style={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                maxWidth: 'clamp(48px, 10vw, 80px)',
                                margin: '0 auto clamp(3px, 0.8vw, 6px)',
                              }}
                            >
                              <img
                                src={char.image}
                                alt={char.name}
                                className="w-full h-full"
                                style={{ objectFit: 'contain', display: 'block' }}
                              />
                            </div>

                            {/* Name — 2-line wrap, never overflows */}
                            <div
                              className="font-mono-custom font-bold text-amber-200 w-full leading-tight"
                              style={{
                                fontSize: 'clamp(7px, 1.6vw, 9px)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                              }}
                            >
                              {char.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Bottom Tap Controls */}
          <div className="p-4 bg-amber-500/5 flex justify-center">
            <button
              onClick={handleJump}
              onTouchStart={(e) => {
                e.preventDefault();
                handleJump();
              }}
              disabled={!isPlaying || gameOver}
              className="w-full max-w-sm py-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-display font-bold text-xs tracking-widest hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none touch-none"
              style={{ touchAction: 'none' }}
            >
              🚀 TAP SCREEN / SPACEBAR TO JUMP
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
