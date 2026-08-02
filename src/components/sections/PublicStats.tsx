import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { fetchVisitorLogs } from '../../lib/tracker';
import type { VisitorLog } from '../../lib/tracker';
import {
  FiActivity,
  FiClock,
  FiUsers,
  FiSmartphone,
  FiMonitor,
  FiRefreshCw,
  FiZap,
  FiTrendingUp,
  FiCompass,
} from 'react-icons/fi';

interface TimePeriod {
  label: string;
  subLabel: string;
  icon: string;
  count: number;
  color: string;
}

export function PublicStats() {
  const { ref, visible } = useScrollReveal(0.1);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchVisitorLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to load visitor stats:', e);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => loadData(), 30000);
    return () => clearInterval(interval);
  }, []);

  // ══════════════════════════════════════════════
  // STATS CALCULATIONS
  // ══════════════════════════════════════════════
  const totalVisitors = logs.length > 0 ? logs.length : 1; // Fallback to 1 for initial visit

  // Calculate Time of Day breakdown
  // Morning: 6 AM - 12 PM
  // Afternoon: 12 PM - 5 PM
  // Evening: 5 PM - 10 PM
  // Night: 10 PM - 6 AM
  let morning = 0;
  let afternoon = 0;
  let evening = 0;
  let night = 0;

  const hourCounts = new Array(24).fill(0);

  logs.forEach((log) => {
    const d = new Date(log.session_start);
    const hour = d.getHours();
    hourCounts[hour]++;

    if (hour >= 6 && hour < 12) morning++;
    else if (hour >= 12 && hour < 17) afternoon++;
    else if (hour >= 17 && hour < 22) evening++;
    else night++;
  });

  // Find peak hour
  let maxHour = 21; // default fallback 9 PM
  let maxHourCount = 0;
  hourCounts.forEach((cnt, h) => {
    if (cnt > maxHourCount) {
      maxHourCount = cnt;
      maxHour = h;
    }
  });

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${ampm}`;
  };

  const peakWindow = `${formatHour(maxHour)} - ${formatHour((maxHour + 2) % 24)}`;

  // Determine dominant time of day
  const periods: TimePeriod[] = [
    { label: 'Night Ops', subLabel: '10 PM - 6 AM', icon: '🌙', count: night, color: '#a855f7' },
    { label: 'Evening Surge', subLabel: '5 PM - 10 PM', icon: '🌆', count: evening, color: '#FFD700' },
    { label: 'Afternoon Patrol', subLabel: '12 PM - 5 PM', icon: '☀️', count: afternoon, color: '#f97316' },
    { label: 'Morning Intel', subLabel: '6 AM - 12 PM', icon: '🌅', count: morning, color: '#38bdf8' },
  ];

  const sortedPeriods = [...periods].sort((a, b) => b.count - a.count);
  const mostActivePeriod = sortedPeriods[0];

  // Device Ratio
  const mobileCount = logs.filter((l) => l.is_mobile).length;
  const mobilePercent = logs.length > 0 ? Math.round((mobileCount / logs.length) * 100) : 65;
  const desktopPercent = 100 - mobilePercent;

  // Average session duration (in seconds)
  const avgDurationSec = logs.length > 0
    ? Math.round(logs.reduce((acc, l) => acc + (l.active_seconds || l.total_duration_seconds || 15), 0) / logs.length)
    : 45;

  const formatAvgTime = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <section id="stats" className="relative py-24 px-4 overflow-hidden grid-bg">
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.12) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label flex items-center justify-center gap-2">
            <FiActivity className="w-4 h-4 text-yellow-400 animate-pulse" />
            ◆ PUBLIC DOSSIER & ANALYTICS
          </span>
          <h2 className="section-title">Live Intelligence Stats</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Real-time telemetry and visitor engagement metrics captured across all devices
          </p>
          <div className="section-divider" />
        </div>

        {/* Top Control Bar */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-mono-custom text-xs text-yellow-400 font-bold tracking-wider uppercase">
              LIVE NETWORK FEED ACTIVE
            </span>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono-custom text-xs hover:bg-yellow-500/20 transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'REFRESHING...' : 'REFRESH METRICS'}</span>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Total Visitors */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card-hover rounded-2xl p-6 border-2 border-yellow-500/30 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-mono-custom text-[11px] uppercase tracking-widest text-yellow-500/60 font-bold mb-1">
                  TOTAL VISITORS
                </div>
                <div className="font-display font-black text-4xl text-yellow-400 drop-shadow-[0_0_15px_#FFD700]">
                  {loading ? '...' : totalVisitors.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
            <div className="font-mono-custom text-xs text-yellow-100/70 flex items-center gap-1.5 pt-2 border-t border-yellow-500/15">
              <FiTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Session Records</span>
            </div>
          </motion.div>

          {/* Card 2: Most Active Time of Day */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card-hover rounded-2xl p-6 border-2 border-yellow-500/30 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-mono-custom text-[11px] uppercase tracking-widest text-yellow-500/60 font-bold mb-1">
                  MOST ACTIVE PERIOD
                </div>
                <div className="font-display font-black text-2xl text-yellow-400 flex items-center gap-2 drop-shadow-[0_0_15px_#FFD700]">
                  <span>{mostActivePeriod.icon}</span>
                  <span>{mostActivePeriod.label}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <FiClock className="w-6 h-6" />
              </div>
            </div>
            <div className="font-mono-custom text-xs text-yellow-100/70 flex items-center gap-1.5 pt-2 border-t border-yellow-500/15">
              <FiZap className="w-3.5 h-3.5 text-amber-400" />
              <span>Peak Window: {peakWindow}</span>
            </div>
          </motion.div>

          {/* Card 3: Avg Active Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card-hover rounded-2xl p-6 border-2 border-yellow-500/30 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-mono-custom text-[11px] uppercase tracking-widest text-yellow-500/60 font-bold mb-1">
                  AVG SESSION TIME
                </div>
                <div className="font-display font-black text-3xl text-yellow-400 drop-shadow-[0_0_15px_#FFD700]">
                  {loading ? '...' : formatAvgTime(avgDurationSec)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <FiActivity className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="font-mono-custom text-xs text-yellow-100/70 flex items-center gap-1.5 pt-2 border-t border-yellow-500/15">
              <FiCompass className="w-3.5 h-3.5 text-sky-400" />
              <span>Active user interaction</span>
            </div>
          </motion.div>

          {/* Card 4: Dominant Access Device */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card-hover rounded-2xl p-6 border-2 border-yellow-500/30 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-mono-custom text-[11px] uppercase tracking-widest text-yellow-500/60 font-bold mb-1">
                  DOMINANT DEVICE
                </div>
                <div className="font-display font-black text-2xl text-yellow-400 flex items-center gap-2 drop-shadow-[0_0_15px_#FFD700]">
                  {mobilePercent >= desktopPercent ? (
                    <>
                      <FiSmartphone className="w-6 h-6 text-yellow-400" />
                      <span>Mobile ({mobilePercent}%)</span>
                    </>
                  ) : (
                    <>
                      <FiMonitor className="w-6 h-6 text-yellow-400" />
                      <span>Desktop ({desktopPercent}%)</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                {mobilePercent >= desktopPercent ? <FiSmartphone className="w-6 h-6" /> : <FiMonitor className="w-6 h-6" />}
              </div>
            </div>
            <div className="font-mono-custom text-xs text-yellow-100/70 flex items-center gap-1.5 pt-2 border-t border-yellow-500/15">
              <span>Desktop: {desktopPercent}% | Mobile: {mobilePercent}%</span>
            </div>
          </motion.div>
        </div>

        {/* Detailed Visual Breakdown: Time-of-Day Activity Spectrum */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card rounded-3xl p-6 md:p-8 border-2 border-yellow-500/30 shadow-[0_0_30px_rgba(255,215,0,0.1)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-yellow-500/20 pb-4 mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <FiClock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-yellow-400 tracking-wide">
                  24-Hour Activity Spectrum
                </h3>
                <div className="font-mono-custom text-xs text-yellow-500/50">
                  Distribution of visitor traffic across operational time slots
                </div>
              </div>
            </div>

            <div className="font-mono-custom text-xs px-3 py-1.5 rounded-lg bg-black/60 border border-yellow-500/30 text-yellow-400 font-bold">
              PEAK HOUR: {formatHour(maxHour)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {periods.map((period, i) => {
              const count = period.count;
              const percentage = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : (i === 0 ? 40 : 20);

              return (
                <div
                  key={period.label}
                  className="glass-card-hover p-4 rounded-2xl border border-yellow-500/20 relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{period.icon}</span>
                      <div>
                        <div className="font-display font-bold text-sm text-yellow-300">
                          {period.label}
                        </div>
                        <div className="font-mono-custom text-[10px] text-yellow-500/50">
                          {period.subLabel}
                        </div>
                      </div>
                    </div>

                    <div className="font-display font-black text-xl text-yellow-400">
                      {percentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-yellow-500/20 mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={visible ? { width: `${Math.max(percentage, 5)}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${period.color}aa, ${period.color})`,
                        boxShadow: `0 0 10px ${period.color}`,
                      }}
                    />
                  </div>

                  <div className="mt-2 font-mono-custom text-[10px] text-yellow-500/50 text-right">
                    {count} visitor session{count === 1 ? '' : 's'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer classified notice */}
          <div className="mt-8 pt-4 border-t border-yellow-500/15 text-center">
            <span className="font-mono-custom text-xs text-yellow-500/40 inline-flex items-center gap-2">
              <FiZap className="w-3.5 h-3.5 text-yellow-400" />
              Public metrics updated automatically via Kinna Visitor Intelligence Network.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
