import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { DAILY_ROUTINE } from '../../data/content';

export function DailyRoutine() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="routine" className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(255,165,0,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-3xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ BEHAVIORAL REPORT</span>
          <h2 className="section-title">Daily Routine</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            24-hour surveillance report — classified observations
          </p>
          <div className="section-divider" />
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="absolute left-8 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,215,0,0.4), transparent)' }}
          />

          <div className="space-y-6">
            {DAILY_ROUTINE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-6 pl-2"
              >
                {/* Time dot */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl z-10 relative"
                    style={{
                      background: 'rgba(10,10,10,0.9)',
                      border: '2px solid rgba(255,215,0,0.4)',
                      boxShadow: '0 0 15px rgba(255,215,0,0.2)',
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 glass-card-hover rounded-xl p-4">
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                    <div
                      className="font-mono-custom text-xs tracking-widest"
                      style={{ color: 'rgba(255,215,0,0.5)' }}
                    >
                      {item.time}
                    </div>
                    <span
                      className="font-display font-bold text-sm"
                      style={{ color: '#FFD700' }}
                    >
                      {item.activity}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <div
            className="inline-block font-mono-custom text-xs px-4 py-2 rounded"
            style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.2)',
              color: 'rgba(255,215,0,0.6)',
            }}
          >
            ⚠ Surveillance report verified by 12 eyewitnesses and 3 ring cameras
          </div>
        </motion.div>
      </div>
    </section>
  );
}
