import { useState, useEffect, useRef, useCallback } from 'react';

const AUDIO_SOURCES = ['/kinna.mpeg', '/kinna.mp3'];
const TARGET_VOLUME = 0.4; // 40% default volume
const FADE_DURATION_MS = 2000; // 2-second smooth fade-in
const MUTE_STORAGE_KEY = 'kinna_bg_music_muted';

// Global singleton audio instance to prevent duplicate elements
let globalAudio: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio(AUDIO_SOURCES[0]);
    globalAudio.loop = true;
    globalAudio.preload = 'auto';

    // Fallback error handler if kinna.mpeg fails, fallback to kinna.mp3
    globalAudio.addEventListener('error', () => {
      if (globalAudio && globalAudio.src.endsWith('.mpeg')) {
        globalAudio.src = AUDIO_SOURCES[1];
        globalAudio.load();
      }
    });
  }
  return globalAudio;
}

export function pauseGlobalBackgroundMusic(): boolean {
  if (globalAudio && !globalAudio.paused) {
    globalAudio.pause();
    return true;
  }
  return false;
}

export function resumeGlobalBackgroundMusic() {
  if (globalAudio && globalAudio.paused && !globalAudio.muted) {
    globalAudio.play().catch(() => {});
  }
}

export function useBackgroundMusic(introFinished: boolean) {
  // Read initial mute state from localStorage
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(MUTE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const fadeIntervalRef = useRef<number | null>(null);
  const wasPlayingBeforeHidden = useRef(false);

  // Smooth 2-second fade-in helper
  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audio.volume = 0;
    const startTime = Date.now();

    fadeIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / FADE_DURATION_MS, 1);
      audio.volume = progress * TARGET_VOLUME;

      if (progress >= 1) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, 50);
  }, []);

  // Safe play function with fade-in and autoplay error handling
  const safePlay = useCallback(async () => {
    const audio = getGlobalAudio();
    audio.muted = muted;

    try {
      if (audio.paused) {
        audio.currentTime = 0; // Start from beginning
      }
      await audio.play();
      setIsPlaying(true);
      fadeIn(audio);
    } catch (err) {
      console.warn('Autoplay waiting for user interaction...', err);
      setIsPlaying(false);
    }
  }, [muted, fadeIn]);

  // Global first-user-interaction listener for seamless browser autoplay fallback
  useEffect(() => {
    const handleFirstInteraction = async () => {
      const audio = getGlobalAudio();
      if (audio.paused && !muted) {
        try {
          audio.muted = muted;
          await audio.play();
          setIsPlaying(true);
          fadeIn(audio);
        } catch (e) {
          console.error('Interaction playback error', e);
        }
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [muted, fadeIn]);

  // Attempt playback when intro finished
  useEffect(() => {
    if (introFinished && !muted) {
      safePlay();
    }
  }, [introFinished, muted, safePlay]);

  // Sync mute state changes to audio element and localStorage
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const nextMuted = !prev;
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, JSON.stringify(nextMuted));
      } catch (e) {
        console.error('Failed to save mute preference', e);
      }

      const audio = getGlobalAudio();
      audio.muted = nextMuted;

      if (!nextMuted && audio.paused) {
        safePlay();
      }

      return nextMuted;
    });
  }, [safePlay]);

  // Handle Tab Visibility (Pause when hidden, Resume when active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = getGlobalAudio();

      if (document.hidden) {
        if (!audio.paused) {
          wasPlayingBeforeHidden.current = true;
          audio.pause();
          setIsPlaying(false);
        } else {
          wasPlayingBeforeHidden.current = false;
        }
      } else {
        if (wasPlayingBeforeHidden.current && !muted) {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [muted]);

  return { muted, toggleMute, isPlaying };
}
