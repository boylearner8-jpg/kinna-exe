import { useEffect, useRef } from 'react';
import {
  generateSessionId,
  buildVisitorLog,
  insertVisitorLog,
  updateVisitorLog,
} from '../lib/tracker';

const IDLE_THRESHOLD_MS = 30_000; // 30 seconds to become idle
const UPDATE_INTERVAL_MS = 15_000; // Update DB every 15 seconds

export function useVisitorTracker() {
  const sessionIdRef = useRef<string>(generateSessionId());
  const sessionStartRef = useRef<number>(Date.now());
  const activeSecondsRef = useRef<number>(0);
  const idleSecondsRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    const sessionId = sessionIdRef.current;

    // Record visit in Supabase
    buildVisitorLog(sessionId).then((log) => {
      insertVisitorLog(log);
    });

    // Track user activity
    const markActive = () => {
      lastActivityRef.current = Date.now();
      if (isIdleRef.current) {
        isIdleRef.current = false;
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));

    // Tick every second: accumulate active vs idle seconds
    const ticker = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const timeSinceActivity = now - lastActivityRef.current;
      if (timeSinceActivity > IDLE_THRESHOLD_MS) {
        isIdleRef.current = true;
        idleSecondsRef.current += elapsed;
      } else {
        isIdleRef.current = false;
        activeSecondsRef.current += elapsed;
      }
    }, 1000);

    // Periodically persist to Supabase
    const persister = setInterval(() => {
      const total = Math.round((Date.now() - sessionStartRef.current) / 1000);
      updateVisitorLog(sessionId, {
        total_duration_seconds: total,
        active_seconds: Math.round(activeSecondsRef.current),
        idle_seconds: Math.round(idleSecondsRef.current),
      });
    }, UPDATE_INTERVAL_MS);

    // On tab close / navigate away — final update
    const handleUnload = () => {
      const total = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const payload = JSON.stringify({
        id: sessionId,
        total: total,
        active: Math.round(activeSecondsRef.current),
        idle: Math.round(idleSecondsRef.current),
        end: new Date().toISOString(),
      });
      // Use sendBeacon for reliability on unload
      navigator.sendBeacon(
        `https://vdqivfmhlweemtbsaabs.supabase.co/rest/v1/visitor_logs?id=eq.${sessionId}`,
        new Blob([payload], { type: 'application/json' })
      );
      // Also try regular update as fallback
      updateVisitorLog(sessionId, {
        session_end: new Date().toISOString(),
        total_duration_seconds: total,
        active_seconds: Math.round(activeSecondsRef.current),
        idle_seconds: Math.round(idleSecondsRef.current),
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleUnload();
    });

    return () => {
      clearInterval(ticker);
      clearInterval(persister);
      activityEvents.forEach((ev) => window.removeEventListener(ev, markActive));
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
}
