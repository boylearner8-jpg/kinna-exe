import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchVisitorLogs } from '../lib/tracker';
import type { VisitorLog } from '../lib/tracker';
import {
  FiX,
  FiShield,
  FiLoader,
  FiMonitor,
  FiSmartphone,
  FiClock,
  FiGlobe,
  FiWifi,
  FiActivity,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';

const RECORDS_PASSWORD = 'minaramchutiya';

interface VisitorRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m ${s}s`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return { date, time };
}

function DeviceIcon({ isMobile }: { isMobile: boolean }) {
  return isMobile
    ? <FiSmartphone className="w-3.5 h-3.5 text-yellow-400" />
    : <FiMonitor className="w-3.5 h-3.5 text-yellow-400" />;
}

export function VisitorRecordsModal({ isOpen, onClose }: VisitorRecordsModalProps) {
  const [phase, setPhase] = useState<'password' | 'records'>('password');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPhase('password');
      setPassword('');
      setPasswordError(false);
      setLogs([]);
    }
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && phase === 'password') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, phase]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === RECORDS_PASSWORD) {
      setPasswordError(false);
      setPhase('records');
      setLoading(true);
      const data = await fetchVisitorLogs();
      setLogs(data);
      setLoading(false);
    } else {
      setPasswordError(true);
      setPassword('');
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await fetchVisitorLogs();
    setLogs(data);
    setRefreshing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(10,8,0,0.98) 100%)',
              border: '1px solid rgba(255,215,0,0.25)',
              boxShadow: '0 0 60px rgba(255,215,0,0.08), inset 0 1px 0 rgba(255,215,0,0.1)',
            }}
          >
            {/* ═══ HEADER ═══ */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <FiShield className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="font-display font-black text-yellow-400 text-sm tracking-widest">
                    CLASSIFIED RECORDS
                  </div>
                  <div className="font-mono-custom text-[10px] text-yellow-500/50 tracking-widest">
                    VISITOR INTELLIGENCE DATABASE
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {phase === 'records' && (
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all font-mono-custom text-xs"
                  >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    REFRESH
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ═══ BODY ═══ */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">

              {/* Password Phase */}
              {phase === 'password' && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                      <div className="text-5xl mb-4">🔐</div>
                      <div className="font-display font-black text-yellow-400 text-xl tracking-widest mb-2">
                        RESTRICTED ACCESS
                      </div>
                      <div className="font-mono-custom text-xs text-yellow-500/50 tracking-wide">
                        ENTER ADMIN CLEARANCE CODE
                      </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          ref={inputRef}
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password..."
                          className="w-full bg-black/60 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-100 font-mono-custom outline-none focus:border-yellow-400 transition-colors text-center tracking-widest"
                          style={{
                            boxShadow: passwordError ? '0 0 20px rgba(239,68,68,0.3)' : undefined,
                            borderColor: passwordError ? 'rgba(239,68,68,0.5)' : undefined,
                          }}
                        />
                        {passwordError && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mt-2 text-red-400 font-mono-custom text-xs justify-center"
                          >
                            <FiAlertCircle className="w-3 h-3" />
                            ACCESS DENIED — WRONG CODE
                          </motion.div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-display font-black text-sm tracking-widest transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                          color: '#000',
                          boxShadow: '0 0 20px rgba(255,215,0,0.3)',
                        }}
                      >
                        🔓 UNLOCK RECORDS
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Records Phase */}
              {phase === 'records' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Stats bar */}
                  <div className="flex-shrink-0 px-6 py-3 border-b border-yellow-500/10 flex items-center gap-6 flex-wrap">
                    <div className="font-mono-custom text-xs text-yellow-500/60">
                      TOTAL SESSIONS:{' '}
                      <span className="text-yellow-400 font-bold">{logs.length}</span>
                    </div>
                    <div className="font-mono-custom text-xs text-yellow-500/60">
                      MOBILE:{' '}
                      <span className="text-yellow-400 font-bold">
                        {logs.filter((l) => l.is_mobile).length}
                      </span>
                    </div>
                    <div className="font-mono-custom text-xs text-yellow-500/60">
                      DESKTOP:{' '}
                      <span className="text-yellow-400 font-bold">
                        {logs.filter((l) => !l.is_mobile).length}
                      </span>
                    </div>
                    <div className="font-mono-custom text-xs text-yellow-500/60">
                      AVG ACTIVE:{' '}
                      <span className="text-green-400 font-bold">
                        {logs.length > 0
                          ? formatDuration(Math.round(logs.reduce((a, l) => a + l.active_seconds, 0) / logs.length))
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Scrollable Records */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD70030 transparent' }}>

                    {loading ? (
                      <div className="flex items-center justify-center py-16 gap-3 text-yellow-400">
                        <FiLoader className="w-5 h-5 animate-spin" />
                        <span className="font-mono-custom text-sm tracking-widest">LOADING RECORDS...</span>
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-yellow-500/40">
                        <FiActivity className="w-8 h-8" />
                        <span className="font-mono-custom text-sm tracking-widest">NO RECORDS FOUND</span>
                      </div>
                    ) : (
                      logs.map((log, i) => {
                        const start = formatDateTime(log.session_start);
                        const end = log.session_end ? formatDateTime(log.session_end) : null;
                        const activeBar = log.total_duration_seconds > 0
                          ? Math.min(100, Math.round((log.active_seconds / log.total_duration_seconds) * 100))
                          : 0;

                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.03, 0.5) }}
                            className="rounded-xl p-4 border border-yellow-500/15 hover:border-yellow-500/30 transition-all"
                            style={{ background: 'rgba(255,215,0,0.02)' }}
                          >
                            {/* Row 1: Session # + Device + Timestamps */}
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-display font-black text-yellow-400 text-xs">
                                  {logs.length - i}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <DeviceIcon isMobile={log.is_mobile} />
                                    <span className="font-display font-bold text-yellow-300 text-xs tracking-wider">
                                      {log.browser}
                                      {log.browser_version ? ` ${log.browser_version.split('.')[0]}` : ''}
                                    </span>
                                    <span className="font-mono-custom text-[10px] text-yellow-500/40">
                                      • {log.device_type}
                                    </span>
                                  </div>
                                  <div className="font-mono-custom text-[10px] text-yellow-500/50 mt-0.5">
                                    {log.os}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <FiClock className="w-3 h-3 text-yellow-500/50" />
                                  <span className="font-mono-custom text-xs text-yellow-400">
                                    {start.date}
                                  </span>
                                </div>
                                <div className="font-mono-custom text-[11px] text-yellow-300 font-bold">
                                  {start.time}
                                </div>
                                {end && (
                                  <div className="font-mono-custom text-[10px] text-yellow-500/40 mt-0.5">
                                    Left: {end.time}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Row 2: Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                              <div className="bg-black/40 rounded-lg px-3 py-2 border border-yellow-500/10">
                                <div className="font-mono-custom text-[9px] text-yellow-500/40 tracking-widest mb-0.5">TOTAL</div>
                                <div className="font-mono-custom text-xs text-yellow-300 font-bold">
                                  {formatDuration(log.total_duration_seconds)}
                                </div>
                              </div>
                              <div className="bg-black/40 rounded-lg px-3 py-2 border border-green-500/10">
                                <div className="font-mono-custom text-[9px] text-green-500/50 tracking-widest mb-0.5">ACTIVE</div>
                                <div className="font-mono-custom text-xs text-green-400 font-bold">
                                  {formatDuration(log.active_seconds)}
                                </div>
                              </div>
                              <div className="bg-black/40 rounded-lg px-3 py-2 border border-red-500/10">
                                <div className="font-mono-custom text-[9px] text-red-500/50 tracking-widest mb-0.5">IDLE</div>
                                <div className="font-mono-custom text-xs text-red-400 font-bold">
                                  {formatDuration(log.idle_seconds)}
                                </div>
                              </div>
                              <div className="bg-black/40 rounded-lg px-3 py-2 border border-yellow-500/10">
                                <div className="font-mono-custom text-[9px] text-yellow-500/40 tracking-widest mb-0.5">ACTIVE%</div>
                                <div className="font-mono-custom text-xs text-yellow-300 font-bold">
                                  {activeBar}%
                                </div>
                              </div>
                            </div>

                            {/* Active/Idle progress bar */}
                            <div className="mb-3">
                              <div className="w-full h-1.5 rounded-full bg-red-900/40 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${activeBar}%`,
                                    background: 'linear-gradient(90deg, #22c55e, #84cc16)',
                                  }}
                                />
                              </div>
                            </div>

                            {/* Row 3: Tech details */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1.5">
                                <FiGlobe className="w-3 h-3 text-yellow-500/40" />
                                <span className="font-mono-custom text-[10px] text-yellow-500/60">
                                  IP: <span className="text-yellow-300">{log.ip_address}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiWifi className="w-3 h-3 text-yellow-500/40" />
                                <span className="font-mono-custom text-[10px] text-yellow-500/60">
                                  Net: <span className="text-yellow-300">{log.connection_type}</span>
                                </span>
                              </div>
                              <div className="font-mono-custom text-[10px] text-yellow-500/60">
                                Screen: <span className="text-yellow-300">{log.screen_resolution}</span>
                              </div>
                              <div className="font-mono-custom text-[10px] text-yellow-500/60">
                                Window: <span className="text-yellow-300">{log.viewport_size}</span>
                              </div>
                              <div className="font-mono-custom text-[10px] text-yellow-500/60">
                                TZ: <span className="text-yellow-300">{log.timezone}</span>
                              </div>
                              <div className="font-mono-custom text-[10px] text-yellow-500/60">
                                Lang: <span className="text-yellow-300">{log.language}</span>
                              </div>
                              {log.referrer !== 'Direct Visit' && (
                                <div className="font-mono-custom text-[10px] text-yellow-500/60 truncate max-w-[200px]">
                                  From: <span className="text-yellow-300">{log.referrer}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="flex-shrink-0 px-6 py-3 border-t border-yellow-500/10 flex items-center justify-between">
              <div className="font-mono-custom text-[10px] text-yellow-500/30 tracking-widest">
                KINNA.EXE // CLASSIFIED INTEL SYSTEM v2.0
              </div>
              <div className="font-mono-custom text-[10px] text-yellow-500/30">
                {new Date().toLocaleString()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
