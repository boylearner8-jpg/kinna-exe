import { useState, useEffect, useRef } from 'react';
import { useScrollReveal, useSound } from '../../hooks/useKinna';
import {
  PLAYABLE_CHARACTERS,
  type PlayableCharacter,
} from './HorseRallyRunner';
import {
  fetchSpaceShooterLeaderboard,
  saveSpaceShooterScore,
  clearSpaceShooterLeaderboard,
  type SpaceShooterScore,
} from '../../lib/db';
import {
  pauseGlobalBackgroundMusic,
  resumeGlobalBackgroundMusic,
} from '../../hooks/useBackgroundMusic';
import {
  FiPlay,
  FiRefreshCw,
  FiAward,
  FiX,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiZap,
} from 'react-icons/fi';

// Engine Canvas Dimensions
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 900;

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isTriple?: boolean;
}

interface Enemy {
  id: string;
  charId: string;
  charName: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  points: number;
  isBoss?: boolean;
  isMainBoss?: boolean;
  lastLaserShot?: number;
  laserPattern?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'triple' | 'quad' | 'bomb' | 'heal' | 'slow' | 'multi';
  icon: string;
  vy: number;
}

export function SpaceShooterGame() {
  const { ref } = useScrollReveal(0.1);
  const { playClick, playBoom } = useSound();

  // Character selection
  const [selectedCharId, setSelectedCharId] = useState<string>(() => {
    try {
      return localStorage.getItem('kinna_space_selected_char') || 'motu-aryan';
    } catch {
      return 'motu-aryan';
    }
  });

  const activeCharacter: PlayableCharacter =
    PLAYABLE_CHARACTERS.find((c) => c.id === selectedCharId) || PLAYABLE_CHARACTERS[0];

  // Character cycling helpers for arrow buttons
  const handleCharPrev = () => {
    const idx = PLAYABLE_CHARACTERS.findIndex((c) => c.id === selectedCharId);
    const prev = (idx - 1 + PLAYABLE_CHARACTERS.length) % PLAYABLE_CHARACTERS.length;
    const newId = PLAYABLE_CHARACTERS[prev].id;
    setSelectedCharId(newId);
    try {
      localStorage.setItem('kinna_space_selected_char', newId);
    } catch {}
    playClick();
  };

  const handleCharNext = () => {
    const idx = PLAYABLE_CHARACTERS.findIndex((c) => c.id === selectedCharId);
    const next = (idx + 1) % PLAYABLE_CHARACTERS.length;
    const newId = PLAYABLE_CHARACTERS[next].id;
    setSelectedCharId(newId);
    try {
      localStorage.setItem('kinna_space_selected_char', newId);
    } catch {}
    playClick();
  };

  // Player Name State — ALWAYS pre-filled with global user name by default
  const getGlobalSpaceName = () => {
    try {
      return localStorage.getItem('kinna_user_global_name') || localStorage.getItem('kinna_space_player_name') || '';
    } catch {
      return '';
    }
  };

  const [playerName, setPlayerName] = useState(getGlobalSpaceName);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sync with global user name on mount
  useEffect(() => {
    const saved = getGlobalSpaceName();
    if (saved) setPlayerName(saved);
  }, []);

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('kinna_space_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [wave, setWave] = useState(1);
  const [playerHp, setPlayerHp] = useState(100);
  const [hasShield, setHasShield] = useState(false);
  const [tripleShotTimer, setTripleShotTimer] = useState(0);
  const [quadShotTimer, setQuadShotTimer] = useState(0);
  const [slowMotionTimer, setSlowMotionTimer] = useState(0);
  const [scoreMultiplierTimer, setScoreMultiplierTimer] = useState(0);
  const [bossWarningText, setBossWarningText] = useState<string | null>(null);
  const [activeMainBoss, setActiveMainBoss] = useState<{ charName: string; hp: number; maxHp: number } | null>(null);

  // Leaderboard modal
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<SpaceShooterScore[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Pre-load all character images for smooth 60FPS canvas rendering
  const charImageMapRef = useRef<Record<string, HTMLImageElement>>({});
  const charImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    PLAYABLE_CHARACTERS.forEach((char) => {
      const img = new Image();
      img.src = char.image;
      charImageMapRef.current[char.id] = img;
    });
  }, []);

  useEffect(() => {
    charImageRef.current = charImageMapRef.current[activeCharacter.id] || null;
  }, [activeCharacter.id]);



  // Direct GPU refs — zero React state during 60FPS loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;

  const playerPosRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 70 });
  const playerTargetPosRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 70 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);

  const scoreRef = useRef(0);
  const waveRef = useRef(1);
  const playerHpRef = useRef(100);
  const hasShieldRef = useRef(false);
  const tripleShotTimerRef = useRef(0);
  const quadShotTimerRef = useRef(0);
  const slowMotionTimerRef = useRef(0);
  const scoreMultiplierTimerRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const lastBossTimeRef = useRef(0);
  const lastBossDeathTimeRef = useRef(0);

  const selectedCharIdRef = useRef(selectedCharId);
  selectedCharIdRef.current = selectedCharId;

  const animFrameRef = useRef<number | null>(null);
  const lastShotTimeRef = useRef(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Shuffle-Bag Boss Selection State
  const bossBagRef = useRef<PlayableCharacter[]>([]);
  const lastBossCharIdRef = useRef<string | null>(null);

  // ═══ Space Shooter Custom Music Track (Pauses main website audio while playing!) ═══
  const spaceAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      // 1. Pause main website background music
      pauseGlobalBackgroundMusic();

      // 2. Play Space Shooter custom audio track (/space_rock.mp3)
      if (!spaceAudioRef.current) {
        const audio = new Audio('/space_rock.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        audio.addEventListener('error', () => {
          if (audio.src.endsWith('space_rock.mp3')) {
            audio.src = '/kinna.mp3';
            audio.load();
            audio.play().catch(() => {});
          }
        });
        spaceAudioRef.current = audio;
      }

      spaceAudioRef.current.currentTime = 0;
      spaceAudioRef.current.play().catch(() => {});
    } else {
      // Stop Space Shooter custom audio track
      if (spaceAudioRef.current) {
        spaceAudioRef.current.pause();
      }
      // Resume main website background music
      resumeGlobalBackgroundMusic();
    }

    return () => {
      if (spaceAudioRef.current) {
        spaceAudioRef.current.pause();
      }
      resumeGlobalBackgroundMusic();
    };
  }, [isPlaying, gameOver]);

  // Initialize starfield
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
      });
    }
    starsRef.current = stars;
  }, []);

  // Fetch Leaderboard
  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const list = await fetchSpaceShooterLeaderboard();
    setLeaderboard(list);
    setLoadingLeaderboard(false);
  };

  const handleClearLeaderboard = async () => {
    const pass = prompt('Enter Developer Password to clear Space Leaderboard:');
    if (pass === 'minaramchutiya') {
      await clearSpaceShooterLeaderboard();
      setLeaderboard([]);
      alert('Space Shooter Leaderboard cleared!');
    } else if (pass !== null) {
      alert('Incorrect password!');
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      keysPressedRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch / Pointer Movement Listener for instant smooth mobile control
  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPlayingRef.current || gameOverRef.current) return;
      const rect = container.getBoundingClientRect();
      const scaleX = WORLD_WIDTH / rect.width;
      const scaleY = WORLD_HEIGHT / rect.height;

      const touchX = (e.clientX - rect.left) * scaleX;
      const touchY = (e.clientY - rect.top) * scaleY;

      playerTargetPosRef.current.x = Math.max(40, Math.min(WORLD_WIDTH - 40, touchX));
      playerTargetPosRef.current.y = Math.max(50, Math.min(WORLD_HEIGHT - 55, touchY));
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerMove);
    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerMove);
    };
  }, []);

  // Helper to trigger laser shot (Default: Double Laser Cannon!)
  const shootLaser = () => {
    const now = Date.now();
    if (now - lastShotTimeRef.current < 120) return; // Fast fire rate!
    lastShotTimeRef.current = now;

    playClick();
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y - 55;

    if (quadShotTimerRef.current > 0) {
      // Quad Overdrive Laser (4 Spread Plasma Beams)
      bulletsRef.current.push(
        { x: px - 26, y: py + 8, vx: -4.5, vy: -15, radius: 5, color: '#bf00ff' },
        { x: px - 10, y: py, vx: -1.2, vy: -16, radius: 5, color: '#00ffff' },
        { x: px + 10, y: py, vx: 1.2, vy: -16, radius: 5, color: '#00ffff' },
        { x: px + 26, y: py + 8, vx: 4.5, vy: -15, radius: 5, color: '#bf00ff' }
      );
    } else if (tripleShotTimerRef.current > 0) {
      // Triple Laser Cannon
      bulletsRef.current.push(
        { x: px, y: py - 5, vx: 0, vy: -15, radius: 4.5, color: '#00ffff', isTriple: true },
        { x: px - 18, y: py + 5, vx: -3.2, vy: -14, radius: 4.5, color: '#00ffff', isTriple: true },
        { x: px + 18, y: py + 5, vx: 3.2, vy: -14, radius: 4.5, color: '#00ffff', isTriple: true }
      );
    } else {
      // Default Initial Double Plasma Cannon!
      bulletsRef.current.push(
        { x: px - 14, y: py, vx: -0.5, vy: -15, radius: 4.5, color: '#ffea00' },
        { x: px + 14, y: py, vx: 0.5, vy: -15, radius: 4.5, color: '#ffea00' }
      );
    }
  };

  // Helper to select next boss using a Shuffle-Bag System (No back-to-back repeats, full cycle coverage)
  const getNextBossChar = (): PlayableCharacter => {
    const pool = PLAYABLE_CHARACTERS.filter((c) => c.id !== selectedCharIdRef.current);
    if (pool.length === 0) return PLAYABLE_CHARACTERS[0];

    // If current shuffle bag is empty, fill and reshuffle with Fisher-Yates algorithm
    if (bossBagRef.current.length === 0) {
      const newBag = [...pool];
      for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
      }
      // Ensure the first boss in the new cycle is NOT identical to the last boss of the previous cycle!
      if (newBag.length > 1 && newBag[0].id === lastBossCharIdRef.current) {
        const swapIndex = Math.floor(Math.random() * (newBag.length - 1)) + 1;
        [newBag[0], newBag[swapIndex]] = [newBag[swapIndex], newBag[0]];
      }
      bossBagRef.current = newBag;
    }

    const chosenBoss = bossBagRef.current.shift()!;
    lastBossCharIdRef.current = chosenBoss.id;
    return chosenBoss;
  };

  // Helper to spawn a Main Giant Boss (Shuffle-bag selection, 10x Sub-Boss HP, 20s Spawner, Immune to Bomb!)
  const spawnBossEnemy = () => {
    const w = waveRef.current;
    const now = Date.now();
    lastBossTimeRef.current = now;
    lastBossDeathTimeRef.current = now;

    // Shuffle-bag random selection ensuring no back-to-back repeats and full cycle variety
    const bossChar = getNextBossChar();

    const subBossHp = 15 + w * 6;
    const mainBossHp = subBossHp * 10; // 10x Sub-Boss HP!

    enemiesRef.current.push({
      id: `boss-${Date.now()}-${Math.random()}`,
      charId: bossChar.id,
      charName: bossChar.name,
      x: WORLD_WIDTH / 2,
      y: -120,
      vx: (Math.random() - 0.5) * 2.5,
      vy: 0.7,
      radius: 110, // 1.7x Giant Boss cutout face!
      hp: mainBossHp,
      maxHp: mainBossHp,
      color: '#ff0055',
      points: 2500,
      isBoss: true,
      isMainBoss: true,
    });

    setBossWarningText(`${bossChar.name.toUpperCase()} BOSS COMING!`);
    setTimeout(() => setBossWarningText(null), 3500);
  };

  // Enemy Spawner helper based on wave (1.7x Sizes + Frequent Sub-Bosses!)
  const spawnEnemyBatch = (overrideCount?: number) => {
    const w = waveRef.current;
    const count = overrideCount ?? (2 + Math.floor(w * 0.8));
    const colors = ['#ff0055', '#ff9900', '#ffea00', '#a855f7', '#00e5ff'];

    // Filter out player's currently chosen character so you never fight yourself!
    const availableEnemyChars = PLAYABLE_CHARACTERS.filter((c) => c.id !== selectedCharIdRef.current);
    const pool = availableEnemyChars.length > 0 ? availableEnemyChars : PLAYABLE_CHARACTERS;

    // Spawn Sub-Boss on normal batch spawns (disabled during boss fight minion spawns)
    const hasSubBoss = !overrideCount && (Math.random() < 0.4 || count >= 4);

    for (let i = 0; i < count; i++) {
      const char = pool[Math.floor(Math.random() * pool.length)];
      const isSubBoss = hasSubBoss && i === 0;

      enemiesRef.current.push({
        id: `e-${Date.now()}-${Math.random()}`,
        charId: char.id,
        charName: char.name,
        x: Math.random() * (WORLD_WIDTH - 160) + 80,
        y: -Math.random() * 250 - 60,
        vx: (Math.random() - 0.5) * (1.5 + w * 0.2),
        vy: Math.random() * (1.5 + w * 0.3) + 1.2,
        radius: isSubBoss ? 65 : Math.round((Math.random() * 10 + 26) * 1.7), // 1.7x Larger Enemy Size!
        hp: isSubBoss ? 15 + w * 6 : 1 + Math.floor(w / 3),
        maxHp: isSubBoss ? 15 + w * 6 : 1 + Math.floor(w / 3),
        color: isSubBoss ? '#ff9900' : colors[Math.floor(Math.random() * colors.length)],
        points: isSubBoss ? 300 : 50,
        isBoss: isSubBoss,
      });
    }
  };

  // Particle explosion helper
  const createExplosion = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
      });
    }
  };

  // Start Game
  const startGame = () => {
    if (!playerName.trim()) {
      setNameError('⚠️ PLEASE ENTER PILOT NAME TO START!');
      return;
    }
    setNameError(null);
    try {
      localStorage.setItem('kinna_space_player_name', playerName.trim());
    } catch {}

    setScore(0);
    scoreRef.current = 0;
    setWave(1);
    waveRef.current = 1;
    setPlayerHp(100);
    playerHpRef.current = 100;
    setHasShield(false);
    hasShieldRef.current = false;
    setTripleShotTimer(0);
    tripleShotTimerRef.current = 0;
    setQuadShotTimer(0);
    quadShotTimerRef.current = 0;
    setSlowMotionTimer(0);
    slowMotionTimerRef.current = 0;
    setScoreMultiplierTimer(0);
    scoreMultiplierTimerRef.current = 0;

    gameStartTimeRef.current = Date.now();
    lastBossTimeRef.current = Date.now();
    lastBossDeathTimeRef.current = Date.now();
    bossBagRef.current = [];
    lastBossCharIdRef.current = null;

    playerPosRef.current = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 80 };
    playerTargetPosRef.current = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 80 };

    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];

    spawnEnemyBatch();

    setGameOver(false);
    setIsPlaying(true);
    setGameOver(false);
    setIsPlaying(true);
    playClick();
  };

  // End Game
  const endGame = () => {
    playBoom();
    setGameOver(true);
    setIsPlaying(false);

    const finalScore = scoreRef.current;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('kinna_space_highscore', finalScore.toString());
      } catch {}
    }

    saveSpaceShooterScore(playerName, finalScore, waveRef.current, activeCharacter.name);
  };

  // MAIN 60 FPS ENGINE LOOP
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let spawnTimer = 0;

    const gameLoop = () => {
      if (!isPlayingRef.current || gameOverRef.current) return;

      // 1. CLEAR & DRAW PARALLAX STARFIELD
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach((star) => {
        star.y += star.speed;
        if (star.y > WORLD_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * WORLD_WIDTH;
        }
        ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 2. PLAYER INPUT VIA KEYBOARD (WASD / ARROW KEYS + SPACEBAR)
      const keys = keysPressedRef.current;
      const speed = 7;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) playerTargetPosRef.current.x -= speed;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) playerTargetPosRef.current.x += speed;
      if (keys['ArrowUp'] || keys['w'] || keys['W']) playerTargetPosRef.current.y -= speed;
      if (keys['ArrowDown'] || keys['s'] || keys['S']) playerTargetPosRef.current.y += speed;
      if (keys[' '] || keys['Spacebar']) shootLaser();

      // AUTO-FIRE FOR MOBILE TOUCH
      shootLaser();

      // Smooth lerp to target position
      playerPosRef.current.x += (playerTargetPosRef.current.x - playerPosRef.current.x) * 0.25;
      playerPosRef.current.y += (playerTargetPosRef.current.y - playerPosRef.current.y) * 0.25;

      // Clamp player inside screen
      playerPosRef.current.x = Math.max(40, Math.min(WORLD_WIDTH - 40, playerPosRef.current.x));
      playerPosRef.current.y = Math.max(50, Math.min(WORLD_HEIGHT - 55, playerPosRef.current.y));

      const px = playerPosRef.current.x;
      const py = playerPosRef.current.y;

      // 3. DRAW PLAYER SPACESHIP & CHARACTER CUTOUT (BIGGER PLAYER SIZE)
      ctx.save();
      ctx.translate(px, py);

      // Thruster Flame Glow Effect
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 52, 16 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();

      // Shield Field if active
      if (hasShieldRef.current) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw character image cutout inside spaceship cockpit frame (Much Bigger Player Size: 125px!)
      if (charImageRef.current && charImageRef.current.complete) {
        const charScale = activeCharacter.scale ?? 1.0;
        const width = 125 * charScale;
        const height = 125 * charScale;
        ctx.drawImage(charImageRef.current, -width / 2, -height / 2, width, height);
      } else {
        ctx.font = '64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀', 0, 0);
      }
      ctx.restore();

      // 4. UPDATE & DRAW BULLETS
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.x += b.vx;
        b.y += b.vy;

        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        if (b.y < -10 || b.x < -10 || b.x > WORLD_WIDTH + 10) {
          bulletsRef.current.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      // 4b. UPDATE & RENDER ENEMY / BOSS EYE LASERS
      for (let i = enemyBulletsRef.current.length - 1; i >= 0; i--) {
        const eb = enemyBulletsRef.current[i];
        const speedMult = slowMotionTimerRef.current > 0 ? 0.5 : 1.0;
        eb.x += eb.vx * speedMult;
        eb.y += eb.vy * speedMult;

        // Draw glowing red eye laser beam
        ctx.save();
        ctx.shadowColor = '#ff0040';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff0040';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner white laser core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Collision with player ship
        const hitDist = Math.hypot(px - eb.x, py - eb.y);
        if (hitDist < 45) {
          createExplosion(eb.x, eb.y, '#ff0040', 8);
          enemyBulletsRef.current.splice(i, 1);

          if (hasShieldRef.current) {
            hasShieldRef.current = false;
            setHasShield(false);
          } else {
            playerHpRef.current = Math.max(0, playerHpRef.current - 15);
            setPlayerHp(playerHpRef.current);
            if (playerHpRef.current <= 0) {
              endGame();
            }
          }
        } else if (eb.y > WORLD_HEIGHT + 30 || eb.x < -30 || eb.x > WORLD_WIDTH + 30) {
          enemyBulletsRef.current.splice(i, 1);
        }
      }

      // 5. UPDATE & DRAW POWERUPS
      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const p = powerUpsRef.current[i];
        p.y += p.vy;

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.icon, p.x, p.y);

        // Player pickup check
        const dist = Math.hypot(p.x - px, p.y - py);
        if (dist < 45) {
          playClick();
          if (p.type === 'shield') {
            hasShieldRef.current = true;
            setHasShield(true);
          } else if (p.type === 'triple') {
            tripleShotTimerRef.current = 400; // ~6.6 seconds
            setTripleShotTimer(400);
          } else if (p.type === 'quad') {
            quadShotTimerRef.current = 400; // ~6.6 seconds
            setQuadShotTimer(400);
          } else if (p.type === 'heal') {
            playerHpRef.current = Math.min(100, playerHpRef.current + 35);
            setPlayerHp(playerHpRef.current);
          } else if (p.type === 'slow') {
            slowMotionTimerRef.current = 360; // 6s slow motion
            setSlowMotionTimer(360);
          } else if (p.type === 'multi') {
            scoreMultiplierTimerRef.current = 600; // 10s 2x multiplier
            setScoreMultiplierTimer(600);
          } else if (p.type === 'bomb') {
            // Screen Bomb Nuke — destroys regular enemies & sub-bosses, but Main Bosses are 100% immune/invincible!
            const remainingEnemies: Enemy[] = [];
            enemiesRef.current.forEach((e) => {
              if (e.isMainBoss) {
                // Main Boss is immune to Bomb!
                createExplosion(e.x, e.y, '#ffea00', 10);
                remainingEnemies.push(e);
              } else {
                createExplosion(e.x, e.y, e.color, 15);
                const pts = scoreMultiplierTimerRef.current > 0 ? e.points * 2 : e.points;
                scoreRef.current += pts;
              }
            });
            enemiesRef.current = remainingEnemies;
            setScore(scoreRef.current);
          }
          powerUpsRef.current.splice(i, 1);
        } else if (p.y > WORLD_HEIGHT + 20) {
          powerUpsRef.current.splice(i, 1);
        }
      }

      // 6. SPAWN & UPDATE ENEMIES — Regular enemies spawn much less frequently during Main Boss fights!
      const isBossActive = enemiesRef.current.some((e) => e.isMainBoss);
      const spawnInterval = isBossActive ? 320 : Math.max(90, 180 - waveRef.current * 10);
      const maxEnemies = isBossActive ? 3 : 8 + waveRef.current * 2;

      spawnTimer++;
      if (spawnTimer % spawnInterval === 0) {
        if (enemiesRef.current.length < maxEnemies) {
          spawnEnemyBatch(isBossActive ? 1 : undefined);
        }
      }

      // Main Boss Spawner Check: First Main Boss at 20s, then exactly 20s after previous boss death
      const nowTime = Date.now();
      const elapsedSinceStart = nowTime - gameStartTimeRef.current;
      const elapsedSinceLastBossDeath = nowTime - lastBossDeathTimeRef.current;
      const hasActiveMainBoss = enemiesRef.current.some((e) => e.isMainBoss);

      if (elapsedSinceStart >= 20000 && elapsedSinceLastBossDeath >= 20000 && !hasActiveMainBoss) {
        spawnBossEnemy();
      }

      // Track active Main Boss for HUD Health Bar
      const currentMainBoss = enemiesRef.current.find((e) => e.isMainBoss);
      if (currentMainBoss) {
        setActiveMainBoss({
          charName: currentMainBoss.charName,
          hp: currentMainBoss.hp,
          maxHp: currentMainBoss.maxHp,
        });
      } else {
        setActiveMainBoss(null);
      }

      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const e = enemiesRef.current[i];
        const speedMult = slowMotionTimerRef.current > 0 ? 0.4 : 1.0;
        e.x += e.vx * speedMult;
        e.y += e.vy * speedMult;

        // Wall bounce
        if (e.x - e.radius < 0 || e.x + e.radius > WORLD_WIDTH) e.vx *= -1;

        // Main Boss bounds check & Eye Laser Attack logic — Fires twin red eye lasers!
        if (e.isMainBoss) {
          const maxY = WORLD_HEIGHT * 0.42;
          if (e.y > maxY) {
            e.y = maxY;
            e.vy = -Math.abs(e.vy); // Bounce back up into top half!
          }
          if (e.y < 80) {
            e.vy = Math.abs(e.vy);
          }

          // Fire eye lasers with alternating attack patterns (Straight, Spread, Targeted)
          const now = Date.now();
          if (!e.lastLaserShot || now - e.lastLaserShot > 1200) {
            e.lastLaserShot = now;
            if (e.laserPattern === undefined) e.laserPattern = 0;
            e.laserPattern = (e.laserPattern + 1) % 3;

            const eyeLeftX = e.x - 32;
            const eyeRightX = e.x + 32;
            const eyeY = e.y + 25;

            if (e.laserPattern === 0) {
              // Pattern 0: Straight Down Lasers
              enemyBulletsRef.current.push(
                { x: eyeLeftX, y: eyeY, vx: 0, vy: 8.5, radius: 5, color: '#ff0040' },
                { x: eyeRightX, y: eyeY, vx: 0, vy: 8.5, radius: 5, color: '#ff0040' }
              );
            } else if (e.laserPattern === 1) {
              // Pattern 1: Spread / Angled Lasers
              enemyBulletsRef.current.push(
                { x: eyeLeftX, y: eyeY, vx: -2.2, vy: 7.5, radius: 5, color: '#ff0040' },
                { x: eyeRightX, y: eyeY, vx: 2.2, vy: 7.5, radius: 5, color: '#ff0040' },
                { x: e.x, y: eyeY, vx: 0, vy: 8.0, radius: 5, color: '#ff0040' }
              );
            } else {
              // Pattern 2: Targeted Beam straight towards Player Ship
              const dx = px - e.x;
              const dy = py - eyeY;
              const dist = Math.hypot(dx, dy) || 1;
              const speed = 8.2;
              enemyBulletsRef.current.push(
                { x: eyeLeftX, y: eyeY, vx: (dx / dist) * speed, vy: (dy / dist) * speed, radius: 5, color: '#ff0040' },
                { x: eyeRightX, y: eyeY, vx: (dx / dist) * speed, vy: (dy / dist) * speed, radius: 5, color: '#ff0040' }
              );
            }
          }
        }

        // Render Enemy (Direct Character Cutout Image Only — No Circular Boundary)
        const charImg = charImageMapRef.current[e.charId];
        if (charImg && charImg.complete) {
          ctx.save();
          ctx.translate(e.x, e.y);

          // Soft drop-shadow glow behind cutout (no circle boundary)
          ctx.shadowColor = e.isMainBoss ? '#ff0055' : e.isBoss ? '#ff9900' : e.color;
          ctx.shadowBlur = e.isMainBoss ? 25 : e.isBoss ? 16 : 10;

          // Draw direct character cutout image
          const faceSize = e.radius * 2.2;
          ctx.drawImage(charImg, -faceSize / 2, -faceSize / 2, faceSize, faceSize);
          ctx.restore();
        } else {
          ctx.font = `${e.radius * 1.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👾', e.x, e.y);
        }

        // Draw Main Boss Health Bar floating directly above his head
        if (e.isMainBoss) {
          const barW = 150;
          const barH = 10;
          const bx = e.x - barW / 2;
          const by = e.y - e.radius - 22;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
          ctx.strokeStyle = '#ff0055';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx - 2, by - 2, barW + 4, barH + 4);

          const hpPct = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(bx, by, barW * hpPct, barH);
        }

        // Bullet Collisions
        for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
          const b = bulletsRef.current[j];
          const hitDist = Math.hypot(b.x - e.x, b.y - e.y);
          if (hitDist < e.radius + b.radius) {
            bulletsRef.current.splice(j, 1);
            e.hp--;
            createExplosion(b.x, b.y, b.color, 4);

            if (e.hp <= 0) {
              playBoom();
              createExplosion(e.x, e.y, e.color, e.isBoss ? 35 : 14);
              const pts = scoreMultiplierTimerRef.current > 0 ? e.points * 2 : e.points;
              scoreRef.current += pts;
              setScore(scoreRef.current);

              if (e.isMainBoss) {
                lastBossDeathTimeRef.current = Date.now();
              }

              // Powerup drop logic — Bomb & Shield drop much less frequently!
              const powerTypes: PowerUp['type'][] = [
                'triple', 'triple', 'triple', 'triple',
                'quad', 'quad', 'quad', 'quad',
                'multi', 'multi',
                'slow', 'heal',
                'shield', // Less frequent
                'bomb',   // Less frequent
              ];
              const powerIcons: Record<PowerUp['type'], string> = {
                shield: '🛡️',
                triple: '⚡',
                quad: '🚀',
                bomb: '💣',
                heal: '❤️',
                slow: '⏳',
                multi: '⭐',
              };

              // Guaranteed 3 drops for Boss kill, 55% chance for regular enemy kill
              const dropCount = e.isBoss ? 3 : Math.random() < 0.55 ? 1 : 0;
              for (let d = 0; d < dropCount; d++) {
                const selectedType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
                powerUpsRef.current.push({
                  x: e.x + (Math.random() - 0.5) * 40,
                  y: e.y,
                  type: selectedType,
                  icon: powerIcons[selectedType],
                  vy: 2 + Math.random() * 0.5,
                });
              }

              enemiesRef.current.splice(i, 1);
              break;
            }
          }
        }

        // Player Collision Check (matching 125px player size!)
        const playerHitDist = Math.hypot(px - e.x, py - e.y);
        if (playerHitDist < e.radius + 50) {
          if (hasShieldRef.current) {
            hasShieldRef.current = false;
            setHasShield(false);
            createExplosion(px, py, '#00e5ff', 15);
            enemiesRef.current.splice(i, 1);
          } else {
            playerHpRef.current -= 25;
            setPlayerHp(playerHpRef.current);
            createExplosion(px, py, '#ff0040', 20);
            enemiesRef.current.splice(i, 1);

            if (playerHpRef.current <= 0) {
              endGame();
              return;
            }
          }
        }

        // Offscreen check
        if (e.y > WORLD_HEIGHT + 50) {
          enemiesRef.current.splice(i, 1);
        }
      }

      // Check wave progression
      if (enemiesRef.current.length === 0) {
        waveRef.current += 1;
        setWave(waveRef.current);
        spawnEnemyBatch();
      }

      // Update powerup timers
      if (tripleShotTimerRef.current > 0) {
        tripleShotTimerRef.current--;
        setTripleShotTimer(tripleShotTimerRef.current);
      }
      if (quadShotTimerRef.current > 0) {
        quadShotTimerRef.current--;
        setQuadShotTimer(quadShotTimerRef.current);
      }
      if (slowMotionTimerRef.current > 0) {
        slowMotionTimerRef.current--;
        setSlowMotionTimer(slowMotionTimerRef.current);
      }
      if (scoreMultiplierTimerRef.current > 0) {
        scoreMultiplierTimerRef.current--;
        setScoreMultiplierTimer(scoreMultiplierTimerRef.current);
      }

      // 7. PARTICLES
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <section id="space-shooter" className="relative py-16 px-4 overflow-hidden select-none">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Section Header */}
        <div className="section-header text-center mb-6">
          <span className="section-label">◆ GALACTIC DEFENSE DIVISION</span>
          <h2 className="section-title text-cyan-400">KINNA SPACE SHOOTER</h2>
          <p className="font-mono-custom text-xs text-cyan-300/70 mt-1">
            Pilot your character spaceship & blast invading space debris!
          </p>
          <div className="section-divider mt-3" />
        </div>

        {/* Main Game Container Window */}
        <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(0,229,255,0.15)] relative">
          {/* Top Bar HUD — Fixed height h-11 to prevent any layout shifting/shaking */}
          <div className="h-11 bg-black/90 border-b border-cyan-500/30 px-3 flex items-center justify-between font-mono-custom text-xs flex-nowrap shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-cyan-400 font-bold truncate">PILOT: {activeCharacter.name}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div>
                <span className="text-cyan-500/70">WAVE:</span>{' '}
                <span className="text-cyan-300 font-bold">{wave}</span>
              </div>
              <div>
                <span className="text-cyan-500/70">SCORE:</span>{' '}
                <span className="text-cyan-400 font-display font-bold text-sm">{score}</span>
              </div>
              <button
                onClick={() => {
                  playClick();
                  loadLeaderboard();
                  setShowLeaderboard(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center gap-1 text-[11px]"
              >
                <FiAward className="w-3.5 h-3.5 text-cyan-400" /> LEADERBOARD
              </button>
            </div>
          </div>

          {/* Interactive Game Canvas Box */}
          <div
            ref={gameContainerRef}
            className="relative w-full bg-black overflow-hidden h-[540px] sm:h-[720px] cursor-crosshair touch-none"
          >
            {/* Boss Warning Text Overlay — Centered Blinking Red Text with no background */}
            {bossWarningText && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-red-600 font-mono-custom font-black text-xl sm:text-3xl text-center tracking-widest uppercase animate-pulse pointer-events-none drop-shadow-[0_0_25px_rgba(255,0,0,0.95)] whitespace-nowrap">
                {bossWarningText}
              </div>
            )}
            {/* Canvas layer */}
            <canvas
              ref={canvasRef}
              width={WORLD_WIDTH}
              height={WORLD_HEIGHT}
              className="w-full h-full pointer-events-none"
            />

            {/* Floating HUD Overlay during active gameplay — Floating badges never shake top window! */}
            {isPlaying && !gameOver && (
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none font-mono-custom text-xs">
                {/* Left: Hull Shield Bar & Main Boss Health Bar */}
                <div className="flex flex-col gap-1.5">
                  {/* Player Hull Shield */}
                  <div className="w-36 sm:w-44 bg-black/80 border border-cyan-500/40 rounded-xl p-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                    <div className="flex justify-between text-[10px] text-cyan-300 font-bold mb-1">
                      <span>HULL SHIELD</span>
                      <span>{playerHp}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/30">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${playerHp}%`,
                          background: playerHp > 50 ? '#00ff41' : playerHp > 25 ? '#ffea00' : '#ff0040',
                        }}
                      />
                    </div>
                  </div>

                  {/* Main Boss Health Bar (Only Main Boss, not sub-bosses!) */}
                  {activeMainBoss && (
                    <div className="w-36 sm:w-44 bg-black/90 border border-red-500/50 rounded-xl p-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,85,0.4)] animate-pulse">
                      <div className="flex justify-between text-[10px] text-red-400 font-bold mb-1 truncate">
                        <span className="truncate">BOSS: {activeMainBoss.charName}</span>
                        <span>{Math.max(0, Math.ceil((activeMainBoss.hp / activeMainBoss.maxHp) * 100))}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-red-500/40">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-200"
                          style={{
                            width: `${Math.max(0, (activeMainBoss.hp / activeMainBoss.maxHp) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Floating Active Powerup Badges */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {hasShield && (
                    <span className="px-2 py-1 rounded-xl bg-cyan-500/25 text-cyan-300 border border-cyan-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                      <FiShield className="w-3 h-3 text-cyan-400" /> SHIELD
                    </span>
                  )}
                  {quadShotTimer > 0 ? (
                    <span className="px-2 py-1 rounded-xl bg-purple-500/30 text-purple-300 border border-purple-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md animate-pulse shadow-[0_0_10px_rgba(191,0,255,0.4)]">
                      🚀 QUAD LASER
                    </span>
                  ) : tripleShotTimer > 0 ? (
                    <span className="px-2 py-1 rounded-xl bg-yellow-500/25 text-yellow-300 border border-yellow-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md shadow-[0_0_10px_rgba(255,234,0,0.4)]">
                      <FiZap className="w-3 h-3 text-yellow-400" /> TRIPLE
                    </span>
                  ) : null}
                  {slowMotionTimer > 0 && (
                    <span className="px-2 py-1 rounded-xl bg-blue-500/30 text-blue-300 border border-blue-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md animate-pulse shadow-[0_0_10px_rgba(0,149,255,0.4)]">
                      ⏳ SLOW-MO
                    </span>
                  )}
                  {scoreMultiplierTimer > 0 && (
                    <span className="px-2 py-1 rounded-xl bg-amber-500/30 text-amber-300 border border-amber-400 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md animate-bounce shadow-[0_0_10px_rgba(255,165,0,0.4)]">
                      ⭐ 2X SCORE
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* START SCREEN OVERLAY */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md z-30 p-4 text-center">
                <div className="flex flex-col items-center my-auto">
                  {/* Character Preview with Left/Right Arrows spaced nicely */}
                  <div className="flex items-center gap-10 sm:gap-16 mb-3">
                    <button
                      onClick={handleCharPrev}
                      className="p-2 sm:p-2.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 active:scale-90 transition-all shrink-0"
                    >
                      <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center relative shrink-0">
                      <img
                        src={activeCharacter.image}
                        alt={activeCharacter.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(0,229,255,0.8)] animate-pulse"
                      />
                    </div>

                    <button
                      onClick={handleCharNext}
                      className="p-2 sm:p-2.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 active:scale-90 transition-all shrink-0"
                    >
                      <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  <h3 className="font-display font-black text-lg sm:text-xl text-cyan-400 mb-1 tracking-wider">
                    CHOOSE YOUR PILOT &amp; FLY
                  </h3>

                  {/* Operative Name Input */}
                  <div className="w-full max-w-xs mx-auto text-left mb-2">
                    <label className="block font-mono-custom text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1 text-center">
                      PILOT CALLSIGN:
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        if (e.target.value.trim()) setNameError(null);
                      }}
                      placeholder="Enter Pilot Name..."
                      maxLength={25}
                      className={`w-full bg-black/90 border rounded-xl px-3 py-1.5 text-cyan-300 font-mono-custom text-xs outline-none text-center transition-all ${
                        nameError
                          ? 'border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.6)] animate-pulse text-red-300'
                          : 'border-cyan-500/40 focus:border-cyan-400'
                      }`}
                    />
                    {nameError && (
                      <div className="text-red-400 font-mono-custom font-bold text-[10px] text-center mt-1 animate-bounce">
                        {nameError}
                      </div>
                    )}
                  </div>

                  <p className="font-mono-custom text-[11px] text-cyan-200/80 mb-3">
                    SELECTED SHIP: <span className="font-bold text-cyan-400">{activeCharacter.name}</span>
                  </p>

                  <button
                    onClick={startGame}
                    className="px-8 py-3 rounded-2xl bg-cyan-500 text-black font-display font-black text-xs sm:text-sm tracking-widest inline-flex items-center gap-2 shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-105 active:scale-95 transition-all"
                  >
                    <FiPlay className="w-4 h-4 text-black font-bold" />
                    <span>LAUNCH SPACESHIP</span>
                  </button>
                </div>

                {/* Character Carousel Row */}
                <div className="w-full flex-shrink-0 border-t border-cyan-500/20 pt-2">
                  <div className="font-mono-custom uppercase text-cyan-400/80 font-bold text-[10px] mb-1">
                    ALL SPACE PILOTS:
                  </div>
                  <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                    {PLAYABLE_CHARACTERS.map((char) => {
                      const isSelected = char.id === selectedCharId;
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            setSelectedCharId(char.id);
                            try {
                              localStorage.setItem('kinna_space_selected_char', char.id);
                            } catch {}
                            playClick();
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono-custom text-xs border transition-all shrink-0 ${
                            isSelected
                              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                              : 'bg-black/60 border-cyan-500/20 text-cyan-500/70 hover:border-cyan-500/40'
                          }`}
                        >
                          <img src={char.image} alt={char.name} className="w-4 h-4 object-contain" />
                          <span>{char.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* GAME OVER SCREEN OVERLAY */}
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md z-30 p-4 text-center">
                <div className="flex flex-col items-center my-auto w-full max-w-sm">
                  {/* Character Preview with Left/Right Arrows */}
                  <div className="flex items-center gap-10 sm:gap-16 mb-2">
                    <button
                      onClick={handleCharPrev}
                      className="p-2 sm:p-2.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 active:scale-90 transition-all shrink-0"
                    >
                      <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center relative shrink-0">
                      <img
                        src={activeCharacter.image}
                        alt={activeCharacter.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,0,85,0.8)]"
                      />
                    </div>

                    <button
                      onClick={handleCharNext}
                      className="p-2 sm:p-2.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 active:scale-90 transition-all shrink-0"
                    >
                      <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  <div className="font-display font-black text-red-500 tracking-wider text-xl mb-1">
                    MISSION DESTROYED
                  </div>

                  <div className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3 mb-3 font-mono-custom flex items-center justify-around text-center">
                    <div>
                      <div className="text-[10px] text-cyan-400/80 font-bold">FINAL SCORE</div>
                      <div className="font-display font-black text-2xl text-cyan-300">{score}</div>
                    </div>
                    <div className="w-px h-8 bg-cyan-500/30" />
                    <div>
                      <div className="text-[10px] text-cyan-400/80 font-bold">HIGH SCORE</div>
                      <div className="font-display font-bold text-xl text-yellow-400">{highScore}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center w-full">
                    <button
                      onClick={startGame}
                      className="px-6 py-2.5 rounded-2xl bg-cyan-500 text-black font-display font-bold text-xs inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-95 transition-transform flex-1"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>RETRY MISSION</span>
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        loadLeaderboard();
                        setShowLeaderboard(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl font-mono-custom font-bold text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <FiAward className="w-4 h-4 text-cyan-400" />
                      <span>LEADERBOARD</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LEADERBOARD MODAL OVERLAY */}
            {showLeaderboard && (
              <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md p-4 overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5 mb-3">
                  <div className="flex items-center gap-2 font-display text-cyan-400 text-sm font-black tracking-wider">
                    <FiAward className="w-4 h-4 text-cyan-400" />
                    <span>SPACE LEADERBOARD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearLeaderboard}
                      className="px-2 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-mono-custom text-[10px] font-bold hover:bg-red-500/30 flex items-center gap-1"
                    >
                      <FiTrash2 className="w-3 h-3" /> CLEAR
                    </button>
                    <button
                      onClick={() => setShowLeaderboard(false)}
                      className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingLeaderboard ? (
                  <div className="text-center py-8 font-mono-custom text-xs text-cyan-400 animate-pulse">
                    Loading space records from database...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-10 font-mono-custom text-xs text-cyan-400/70 space-y-2">
                    <div className="text-2xl">🚀</div>
                    <div className="font-bold text-cyan-300">NO SPACE RECORDS YET</div>
                    <div className="text-[11px] text-cyan-500/60">Be the first pilot to set a high score!</div>
                  </div>
                ) : (
                  <div className="space-y-2 flex-1">
                    {leaderboard.map((item, index) => {
                      const rank = index + 1;
                      const badge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                      return (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20 font-mono-custom text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 text-center font-bold text-cyan-400">{badge}</span>
                            <div>
                              <div className="font-bold text-cyan-200 text-xs">{item.player_name}</div>
                              <div className="text-[9px] text-cyan-400/60">Wave {item.wave_reached}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display font-bold text-cyan-300 text-xs">{item.high_score || item.score}</div>
                            <div className="text-[8px] text-cyan-500/60 uppercase">PTS</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
