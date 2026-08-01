import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { ORIGIN_TIMELINE } from '../../data/content';

export function OriginStory() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="origin" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,215,0,0.03) 0%, transparent 60%)' }}
      />
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ CLASSIFIED DOSSIER</span>
          <h2 className="section-title">Origin Story</h2>
          <p className="font-mono-custom text-sm" style={{ color: 'rgba(255,215,0,0.5)' }}>
            How a perfectly normal world was never the same again
          </p>
          <div className="section-divider mt-4" />
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px"
            style={{
              background: 'linear-gradient(180deg, transparent, #FFD700, #FFA500, transparent)',
              transform: 'translateX(-50%)',
            }}
          />

          <div className="space-y-12">
            {ORIGIN_TIMELINE.map((item: typeof ORIGIN_TIMELINE[0], i: number) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={visible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.2, duration: 0.6, ease: 'easeOut' }}
                  className={`relative flex ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 pl-16 md:pl-0`}
                >
                  {/* Content card */}
                  <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="glass-card-hover p-5 rounded-xl">
                      <div
                        className="font-mono-custom text-xs tracking-widest mb-1"
                        style={{ color: 'rgba(255,215,0,0.5)' }}
                      >
                        {item.year}
                      </div>
                      <div
                        className="font-display font-bold text-lg mb-2"
                        style={{ color: '#FFD700' }}
                      >
                        {item.event}
                      </div>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {item.funny}
                      </p>
                    </div>
                  </div>

                  {/* Center icon */}
                  <div
                    className="absolute left-0 md:relative md:left-auto flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold z-10"
                    style={{
                      background: 'rgba(10,10,10,0.9)',
                      border: '2px solid rgba(255,215,0,0.5)',
                      boxShadow: '0 0 20px rgba(255,215,0,0.3)',
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom classified stamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="flex justify-center mt-16 gap-6"
        >
          <div className="classified-stamp">CLASSIFIED</div>
          <div className="top-secret-stamp">TOP SECRET</div>
        </motion.div>
      </div>
    </section>
  );
}
