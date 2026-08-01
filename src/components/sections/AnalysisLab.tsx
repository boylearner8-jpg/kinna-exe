import { motion } from 'framer-motion';
import { useScrollReveal, useRandomStats } from '../../hooks/useKinna';
import { FiRefreshCw } from 'react-icons/fi';

const STAT_CONFIG: Record<string, { label: string; icon: string; color: string; description: (v: number) => string }> = {
  threat: { label: 'Threat Level', icon: '☠️', color: '#ff0040', description: (v) => v > 90 ? 'CRITICAL DANGER' : 'HIGH RISK' },
  iq: { label: 'IQ', icon: '🧠', color: '#00d4ff', description: (v) => v < 60 ? 'Below Average' : v < 80 ? 'Questionable' : 'Surprisingly OK' },
  battery: { label: 'Battery', icon: '🔋', color: '#00ff41', description: (v) => v < 20 ? 'CRITICAL — NEEDS FOOD' : 'Low' },
  luck: { label: 'Luck', icon: '🍀', color: '#FFED4A', description: (v) => v < 30 ? 'Terrible' : 'Bad but not awful' },
  homework: { label: 'Homework', icon: '📚', color: '#9B59B6', description: (v) => v < 5 ? 'Essentially Zero' : 'Critically Low' },
  energy: { label: 'Energy', icon: '⚡', color: '#FFA500', description: (v) => v < 20 ? 'Send Help' : 'Depleted' },
  sleep: { label: 'Sleep', icon: '😴', color: '#00d4ff', description: (v) => v > 80 ? 'Expert Level' : 'Still More Than Yours' },
  anger: { label: 'Anger', icon: '😤', color: '#ff6b6b', description: (v) => v > 60 ? 'When WiFi Is Slow' : 'Pre-coffee' },
  money: { label: 'Money', icon: '💰', color: '#FFD700', description: (v) => v < 15 ? 'Broke But Happy' : 'Managed Somehow' },
};

export function AnalysisLab() {
  const { ref, visible } = useScrollReveal(0.1);
  const { stats, generate } = useRandomStats();

  return (
    <section id="analysis" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,255,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ INTELLIGENCE DIVISION</span>
          <h2 className="section-title">Analysis Lab</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Real-time subject analysis — refreshes every visit
          </p>
          <div className="section-divider" />
        </div>

        {/* Refresh button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={generate}
            className="btn-gold px-6 py-3 rounded-lg flex items-center gap-2 text-sm"
          >
            <FiRefreshCw className="w-4 h-4" />
            RE-SCAN SUBJECT
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(STAT_CONFIG).map(([key, config], i) => {
            const value = stats[key] ?? 0;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card-hover p-5 rounded-xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <div className="font-mono-custom text-xs tracking-widest" style={{ color: 'rgba(255,215,0,0.5)' }}>
                      {config.label}
                    </div>
                  </div>
                  <div
                    className="font-display font-black text-2xl"
                    style={{ color: config.color, textShadow: `0 0 10px ${config.color}` }}
                  >
                    {value}%
                  </div>
                </div>

                <div className="progress-bar mb-2">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={visible ? { width: `${value}%` } : { width: 0 }}
                    transition={{ delay: i * 0.08 + 0.3, duration: 1, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(90deg, ${config.color}88, ${config.color})` }}
                  />
                </div>

                <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {config.description(value)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall threat badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-10"
        >
          <div
            className="inline-block glass-card rounded-xl px-8 py-4"
            style={{ border: '1px solid rgba(255,0,64,0.3)' }}
          >
            <div className="font-mono-custom text-xs tracking-widest mb-1" style={{ color: 'rgba(255,0,64,0.7)' }}>
              OVERALL ASSESSMENT
            </div>
            <div
              className="font-display font-black text-2xl"
              style={{ color: '#ff0040', textShadow: '0 0 20px #ff0040' }}
            >
              EXTREMELY SUSPICIOUS
            </div>
            <div className="font-mono-custom text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Subject should be monitored at all times. Especially during sleeping hours.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
