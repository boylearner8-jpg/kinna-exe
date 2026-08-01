import { useState, useEffect, useCallback, useRef } from 'react';

// ═══ Hook: Use sound effects ═══
export function useSound() {
  const [muted, setMuted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = type;
      gainNode.gain.setValueAtTime(gain, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) { /* silent fail */ }
  }, [muted, getCtx]);

  const playClick = useCallback(() => playTone(440, 0.1, 'square', 0.2), [playTone]);
  const playSuccess = useCallback(() => {
    playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
  }, [playTone]);
  const playError = useCallback(() => playTone(200, 0.3, 'sawtooth', 0.3), [playTone]);
  const playScanner = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(300 + i * 100, 0.15, 'sine', 0.2), i * 150);
    }
  }, [playTone]);
  const playBoom = useCallback(() => playTone(80, 0.4, 'sawtooth', 0.5), [playTone]);
  const playNotification = useCallback(() => {
    playTone(880, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.2), 120);
  }, [playTone]);
  const playTypeKey = useCallback(() => playTone(400 + Math.random() * 200, 0.05, 'square', 0.1), [playTone]);

  return { muted, setMuted, playClick, playSuccess, playError, playScanner, playBoom, playNotification, playTypeKey };
}

// ═══ Hook: Intersection Observer for scroll reveal ═══
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ═══ Hook: Random number generator (re-generates on mount) ═══
export function useRandomStats() {
  const [stats, setStats] = useState<Record<string, number>>({});

  const generate = useCallback(() => {
    setStats({
      threat: Math.floor(Math.random() * 20) + 80,
      iq: Math.floor(Math.random() * 30) + 40,
      battery: Math.floor(Math.random() * 30) + 5,
      luck: Math.floor(Math.random() * 50) + 10,
      homework: Math.floor(Math.random() * 10),
      energy: Math.floor(Math.random() * 30) + 5,
      sleep: Math.floor(Math.random() * 20) + 75,
      anger: Math.floor(Math.random() * 60) + 20,
      money: Math.floor(Math.random() * 20),
    });
  }, []);

  useEffect(() => { generate(); }, [generate]);

  return { stats, generate };
}

// ═══ Hook: Typing animation ═══
export function useTypingEffect(texts: string[], speed = 60, deleteSpeed = 30, pauseMs = 1500) {
  const [displayed, setDisplayed] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      const timer = setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, pauseMs);
      return () => clearTimeout(timer);
    }

    const currentText = texts[currentIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < currentText.length) {
          setDisplayed(currentText.slice(0, displayed.length + 1));
        } else {
          setIsPaused(true);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [displayed, isDeleting, isPaused, currentIndex, texts, speed, deleteSpeed, pauseMs]);

  return displayed;
}

// ═══ Hook: Hidden objects game ═══
export function useHiddenObjects(total = 15) {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [missionComplete, setMissionComplete] = useState(false);

  const findObject = useCallback((id: string) => {
    setFound((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= total) setMissionComplete(true);
      return next;
    });
  }, [total]);

  return { found, findObject, missionComplete, count: found.size, total };
}

// ═══ Utility: Random item from array ═══
export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══ Utility: Clamp ═══
export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}
