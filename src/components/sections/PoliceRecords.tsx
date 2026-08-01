import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { POLICE_CHARGES } from '../../data/content';

export function PoliceRecords() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="police" className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,0,64,0.03) 0%, transparent 60%)' }}
      />
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ LAW ENFORCEMENT</span>
          <h2 className="section-title">Police Records</h2>
          <div className="section-divider mt-4" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,0,64,0.2)' }}
        >
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{ borderColor: 'rgba(255,0,64,0.2)', background: 'rgba(255,0,64,0.03)' }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div
                  className="font-display font-black text-xl mb-1"
                  style={{ color: '#ff0040', textShadow: '0 0 15px #ff0040' }}
                >
                  🚨 CRIMINAL FILE #KNA-2006
                </div>
                <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,0,64,0.7)' }}>
                  NATIONAL BUREAU OF SUSPICIOUS BEHAVIOR
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="classified-stamp" style={{ fontSize: '1rem' }}>CLASSIFIED</div>
                <div
                  className="top-secret-stamp"
                  style={{ fontSize: '0.85rem', borderColor: 'rgba(255,0,64,0.8)', color: 'rgba(255,0,64,0.8)' }}
                >
                  DO NOT SHARE
                </div>
              </div>
            </div>

            {/* Subject info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'SUBJECT', value: 'KINNA' },
                { label: 'FILE NO.', value: 'KNA-2006' },
                { label: 'STATUS', value: 'ACTIVE' },
                { label: 'DANGER', value: 'EXTREME' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,0,64,0.6)' }}>{item.label}</div>
                  <div className="font-display font-bold text-sm mt-1" style={{ color: '#ff0040' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Charges list */}
          <div className="p-6">
            <div
              className="font-mono-custom text-xs tracking-widest mb-4"
              style={{ color: 'rgba(255,215,0,0.6)' }}
            >
              ▌ CHARGES FILED AGAINST SUBJECT:
            </div>

            <div className="space-y-3">
              {POLICE_CHARGES.map((charge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={visible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-4 p-3 rounded-lg"
                  style={{ background: 'rgba(255,0,64,0.03)', border: '1px solid rgba(255,0,64,0.1)' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,0,64,0.2)', color: '#ff0040' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-display font-bold text-sm mb-1"
                      style={{ color: '#FFD700' }}
                    >
                      {charge.charge}
                    </div>
                    <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Evidence: {charge.evidence}
                    </div>
                  </div>
                  <span
                    className="font-mono-custom text-xs px-2 py-1 rounded flex-shrink-0"
                    style={{
                      background: charge.severity === 'FEDERAL' ? 'rgba(255,0,64,0.2)' : 'rgba(255,165,0,0.1)',
                      border: `1px solid ${charge.severity === 'FEDERAL' ? 'rgba(255,0,64,0.4)' : 'rgba(255,165,0,0.3)'}`,
                      color: charge.severity === 'FEDERAL' ? '#ff0040' : '#FFA500',
                    }}
                  >
                    {charge.severity}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Fingerprint area */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fingerprint SVG */}
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.1)' }}
              >
                <div
                  className="text-6xl mb-2 font-mono-custom"
                  style={{ color: 'rgba(255,215,0,0.2)', letterSpacing: '2px' }}
                >
                  𝞓𝞓𝞓𝞓𝞓
                  𝞓𝞓𝞓𝞓𝞓
                  𝞓𝞓𝞓𝞓𝞓
                </div>
                <div className="text-7xl mb-2">👆</div>
                <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.5)' }}>
                  FINGERPRINT ON FILE
                </div>
                <div className="font-mono-custom text-xs mt-1" style={{ color: 'rgba(255,215,0,0.3)' }}>
                  Match Rate: 99.9%
                </div>
              </div>

              {/* Case verdict */}
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,0,64,0.03)', border: '1px solid rgba(255,0,64,0.15)' }}
              >
                <div className="font-mono-custom text-xs tracking-widest mb-3" style={{ color: 'rgba(255,0,64,0.7)' }}>
                  VERDICT
                </div>
                <div
                  className="font-display font-black text-xl mb-2"
                  style={{ color: '#ff0040', textShadow: '0 0 15px #ff0040' }}
                >
                  GUILTY
                </div>
                <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Of being suspicious, extremely late, and possibly the most relaxed criminal in government history.
                </div>
                <div className="mt-3 font-mono-custom text-xs tracking-widest" style={{ color: 'rgba(255,0,64,0.6)' }}>
                  CASE STATUS: STILL UNDER INVESTIGATION 🔴
                </div>

                {/* Redacted lines */}
                <div className="mt-3 space-y-2">
                  {[80, 60, 90, 50].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: '10px',
                        width: `${w}%`,
                        background: 'rgba(0,0,0,0.9)',
                        borderRadius: '2px',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: '4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '6px',
                          color: '#000',
                          fontFamily: 'monospace',
                        }}
                      >
                        REDACTED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
