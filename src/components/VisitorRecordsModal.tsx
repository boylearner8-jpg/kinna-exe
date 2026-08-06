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
  FiSearch,
  FiChevronDown,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPhase('password');
      setPassword('');
      setPasswordError(false);
      setLogs([]);
      setSearchQuery('');
      setDisplayLimit(30);
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

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.user_name || '').toLowerCase().includes(q) ||
      (log.ip_address || '').toLowerCase().includes(q) ||
      (log.browser || '').toLowerCase().includes(q) ||
      (log.os || '').toLowerCase().includes(q) ||
      (log.device_type || '').toLowerCase().includes(q)
    );
  });

  const visibleLogs = filteredLogs.slice(0, displayLimit);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-black/95 border border-yellow-500/30 shadow-[0_0_60px_rgba(255,215,0,0.15)]"
          >
            {/* ═══ HEADER ═══ */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
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
              <div className="flex items-center gap-2 sm:gap-3">
                {phase === 'records' && (
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all font-mono-custom text-xs cursor-pointer"
                  >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">REFRESH</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all cursor-pointer"
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
                          className="w-full bg-black/80 border border-yellow-500/40 rounded-2xl px-4 py-3 text-sm text-yellow-100 font-mono-custom outline-none focus:border-yellow-400 transition-colors text-center tracking-widest"
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
                        className="w-full py-3.5 rounded-2xl font-display font-black text-sm tracking-widest text-black bg-yellow-500 shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:scale-[1.02] cursor-pointer transition-all"
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
                  {/* Search Bar + Stats Bar */}
                  <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-yellow-500/15 flex items-center justify-between gap-4 flex-wrap bg-black/40">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="font-mono-custom text-xs text-yellow-500/60">
                        TOTAL: <span className="text-yellow-400 font-bold">{logs.length}</span>
                      </div>
                      <div className="font-mono-custom text-xs text-yellow-500/60">
                        MOBILE: <span className="text-yellow-400 font-bold">{logs.filter((l) => l.is_mobile).length}</span>
                      </div>
                      <div className="font-mono-custom text-xs text-yellow-500/60">
                        DESKTOP: <span className="text-yellow-400 font-bold">{logs.filter((l) => !l.is_mobile).length}</span>
                      </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-xs min-w-[180px]">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500/50 w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setDisplayLimit(30);
                        }}
                        placeholder="Search logs..."
                        className="w-full bg-black/80 border border-yellow-500/30 rounded-full pl-9 pr-3 py-1 text-xs text-yellow-200 font-mono-custom outline-none focus:border-yellow-400 placeholder-yellow-500/40"
                      />
                    </div>
                  </div>

                  {/* Fast Smooth Records List */}
                  <div
                    className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 custom-scrollbar"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD70030 transparent' }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center py-16 gap-3 text-yellow-400">
                        <FiLoader className="w-5 h-5 animate-spin" />
                        <span className="font-mono-custom text-sm tracking-widest">LOADING DOSSIERS...</span>
                      </div>
                    ) : visibleLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-yellow-500/40">
                        <FiActivity className="w-8 h-8" />
                        <span className="font-mono-custom text-sm tracking-widest">NO MATCHING DOSSIERS FOUND</span>
                      </div>
                    ) : (
                      <>
                        {visibleLogs.map((log, i) => {
                          const start = formatDateTime(log.session_start);
                          const end = log.session_end ? formatDateTime(log.session_end) : null;
                          const activeBar = log.total_duration_seconds > 0
                            ? Math.min(100, Math.round((log.active_seconds / log.total_duration_seconds) * 100))
                            : 0;

                          return (
                            <div
                              key={log.id}
                              className="rounded-2xl p-3.5 border border-yellow-500/20 bg-black/80 hover:border-yellow-500/40 transition-colors"
                            >
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-3 flex-wrap mb-2.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <div className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center font-display font-bold text-yellow-400 text-[11px]">
                                    {logs.length - i}
                                  </div>
                                  <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/35 text-yellow-300 font-display font-bold text-xs tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(255,215,0,0.15)]">
                                    <span>👤</span>
                                    <span>{log.user_name || 'Anonymous'}</span>
                                  </span>
                                  <div className="flex items-center gap-1.5 font-mono-custom text-xs text-yellow-400">
                                    <DeviceIcon isMobile={log.is_mobile} />
                                    <span className="font-bold">
                                      {log.browser}
                                      {log.browser_version ? ` ${log.browser_version.split('.')[0]}` : ''}
                                    </span>
                                    <span className="text-yellow-500/40 text-[10px]">
                                      • {log.device_type}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right ml-auto">
                                  <div className="flex items-center gap-1 justify-end font-mono-custom text-xs text-yellow-400">
                                    <FiClock className="w-3 h-3 text-yellow-500/50" />
                                    <span>{start.date}</span>
                                    <span className="font-bold ml-1">{start.time}</span>
                                  </div>
                                  {end && (
                                    <div className="font-mono-custom text-[10px] text-yellow-500/40">
                                      Left: {end.time}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Stats Row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                <div className="bg-black/60 rounded-xl px-2.5 py-1.5 border border-yellow-500/10">
                                  <div className="font-mono-custom text-[9px] text-yellow-500/40 tracking-widest">TOTAL</div>
                                  <div className="font-mono-custom text-xs text-yellow-300 font-bold">
                                    {formatDuration(log.total_duration_seconds)}
                                  </div>
                                </div>
                                <div className="bg-black/60 rounded-xl px-2.5 py-1.5 border border-green-500/10">
                                  <div className="font-mono-custom text-[9px] text-green-500/50 tracking-widest">ACTIVE</div>
                                  <div className="font-mono-custom text-xs text-green-400 font-bold">
                                    {formatDuration(log.active_seconds)}
                                  </div>
                                </div>
                                <div className="bg-black/60 rounded-xl px-2.5 py-1.5 border border-red-500/10">
                                  <div className="font-mono-custom text-[9px] text-red-500/50 tracking-widest">IDLE</div>
                                  <div className="font-mono-custom text-xs text-red-400 font-bold">
                                    {formatDuration(log.idle_seconds)}
                                  </div>
                                </div>
                                <div className="bg-black/60 rounded-xl px-2.5 py-1.5 border border-yellow-500/10">
                                  <div className="font-mono-custom text-[9px] text-yellow-500/40 tracking-widest">ACTIVE%</div>
                                  <div className="font-mono-custom text-xs text-yellow-300 font-bold">
                                    {activeBar}%
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1 rounded-full bg-red-950/60 overflow-hidden mb-2">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${activeBar}%`,
                                    background: 'linear-gradient(90deg, #22c55e, #84cc16)',
                                  }}
                                />
                              </div>

                              {/* Tech Specs Line */}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono-custom text-[10px] text-yellow-500/60">
                                <div className="flex items-center gap-1">
                                  <FiGlobe className="w-3 h-3 text-yellow-500/40" />
                                  <span>IP: <strong className="text-yellow-300">{log.ip_address}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiWifi className="w-3 h-3 text-yellow-500/40" />
                                  <span>Net: <strong className="text-yellow-300">{log.connection_type}</strong></span>
                                </div>
                                <div>OS: <strong className="text-yellow-300">{log.os}</strong></div>
                                <div>Screen: <strong className="text-yellow-300">{log.screen_resolution}</strong></div>
                                <div>TZ: <strong className="text-yellow-300">{log.timezone}</strong></div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Load More Button */}
                        {filteredLogs.length > displayLimit && (
                          <div className="text-center pt-3 pb-1">
                            <button
                              onClick={() => setDisplayLimit((prev) => prev + 30)}
                              className="px-5 py-2.5 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 font-display font-bold text-xs tracking-wider inline-flex items-center gap-2 hover:bg-yellow-500/25 transition-all cursor-pointer"
                            >
                              <span>LOAD MORE DOSSIERS (+30)</span>
                              <FiChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-yellow-500/15 flex items-center justify-between bg-black/90">
              <div className="font-mono-custom text-[10px] text-yellow-500/40 tracking-widest">
                KINNA.EXE // CLASSIFIED INTEL SYSTEM v2.0
              </div>
              <div className="font-mono-custom text-[10px] text-yellow-500/40">
                {new Date().toLocaleString()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
