import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { ACHIEVEMENTS } from '../../data/content';

export function AchievementsSection() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="achievements" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,215,0,0.03) 0%, transparent 60%)' }}
      />
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ ACHIEVEMENT SYSTEM</span>
          <h2 className="section-title">Achievements</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Unlocked and locked records of Kinna's legendary achievements
          </p>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={visible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`glass-card-hover rounded-xl p-5 relative overflow-hidden ${ach.locked ? 'achievement-locked' : ''}`}
            >
              {/* Rarity badge */}
              <div
                className="absolute top-3 right-3 font-mono-custom text-xs px-2 py-0.5 rounded"
                style={{
                  background: ach.locked ? 'rgba(100,100,100,0.2)' : 'rgba(255,215,0,0.15)',
                  border: `1px solid ${ach.locked ? 'rgba(100,100,100,0.3)' : 'rgba(255,215,0,0.3)'}`,
                  color: ach.locked ? 'rgba(150,150,150,0.8)' : '#FFD700',
                  fontSize: '0.6rem',
                }}
              >
                {ach.rarity}
              </div>

              <div className="text-3xl mb-3">
                {ach.locked ? '🔒' : ach.icon}
              </div>

              <div
                className="font-display font-bold text-sm mb-1"
                style={{ color: ach.locked ? 'rgba(150,150,150,0.7)' : '#FFD700' }}
              >
                {ach.title}
              </div>

              <p
                className="font-mono-custom text-xs mb-3"
                style={{ color: ach.locked ? 'rgba(100,100,100,0.7)' : 'rgba(255,255,255,0.5)' }}
              >
                {ach.locked ? '????? LOCKED ?????': ach.description}
              </p>

              {/* Points */}
              <div
                className="font-mono-custom text-xs"
                style={{ color: ach.locked ? 'rgba(100,100,100,0.5)' : 'rgba(255,215,0,0.5)' }}
              >
                {ach.locked ? '??? pts' : `${ach.points.toLocaleString()} pts`}
              </div>

              {/* Locked overlay */}
              {ach.locked && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <div
                    className="font-display font-black text-lg tracking-widest px-4 py-2 rounded"
                    style={{
                      color: 'rgba(255,215,0,0.8)',
                      border: '2px solid rgba(255,215,0,0.3)',
                      background: 'rgba(0,0,0,0.7)',
                    }}
                  >
                    LOCKED
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
