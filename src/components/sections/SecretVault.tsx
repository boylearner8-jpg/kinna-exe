import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { SECRET_VAULT_RESPONSES } from '../../data/content';

export function SecretVault() {
  const { ref, visible } = useScrollReveal(0.1);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [response, setResponse] = useState('');
  const [granted, setGranted] = useState(false);
  const [shaking, setShaking] = useState(false);

  const tryPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setAttempts((a) => a + 1);
    const newAttempts = attempts + 1;

    if (newAttempts >= 6) {
      setGranted(true);
      setResponse('');
      return;
    }

    setShaking(true);
    const responseIdx = Math.min(attempts, SECRET_VAULT_RESPONSES.length - 1);
    setResponse(SECRET_VAULT_RESPONSES[responseIdx]);
    setPassword('');
    setTimeout(() => setShaking(false), 600);
  };

  return (
    <section id="vault" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,165,0,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-lg mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ RESTRICTED ACCESS</span>
          <h2 className="section-title">Secret Vault</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Enter the correct password. Good luck.
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className={`glass-card rounded-2xl p-8 text-center ${shaking ? 'animate-camera-shake' : ''}`}
          style={{ border: '1px solid rgba(255,165,0,0.3)' }}
        >
          {!granted ? (
            <>
              {/* Vault door icon */}
              <div className="text-7xl mb-6">🔐</div>

              <div
                className="font-mono-custom text-xs tracking-widest mb-6"
                style={{ color: 'rgba(255,165,0,0.7)' }}
              >
                CLEARANCE LEVEL: TOP SECRET<br />
                ATTEMPTS REMAINING: {Math.max(0, 6 - attempts - 1)}
              </div>

              <form onSubmit={tryPassword} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter classified password..."
                  className="w-full bg-transparent font-mono-custom text-sm outline-none px-4 py-3 rounded-xl text-center"
                  style={{
                    background: 'rgba(255,165,0,0.05)',
                    border: '1px solid rgba(255,165,0,0.3)',
                    color: '#FFA500',
                    letterSpacing: '0.3em',
                  }}
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-display font-bold tracking-widest transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(255,165,0,0.1)',
                    border: '2px solid rgba(255,165,0,0.4)',
                    color: '#FFA500',
                    boxShadow: '0 0 20px rgba(255,165,0,0.2)',
                  }}
                >
                  ACCESS VAULT
                </button>
              </form>

              {/* Response */}
              <AnimatePresence mode="wait">
                {response && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,0,64,0.1)',
                      border: '1px solid rgba(255,0,64,0.3)',
                    }}
                  >
                    <div className="text-2xl mb-2">🚫</div>
                    <div className="font-mono-custom text-sm" style={{ color: '#ff6b6b' }}>
                      {response}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {attempts > 2 && (
                <div
                  className="mt-4 font-mono-custom text-xs"
                  style={{ color: 'rgba(255,165,0,0.4)' }}
                >
                  Hint: It's not "kinna", "1234", "password", or "kinna123". Keep trying!
                </div>
              )}
            </>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className="text-6xl mb-4">🔓</div>
                <div
                  className="font-display font-black text-3xl mb-4"
                  style={{ color: '#00ff41', textShadow: '0 0 30px #00ff41' }}
                >
                  ACCESS GRANTED
                </div>
                <div
                  className="font-mono-custom text-sm mb-4"
                  style={{ color: 'rgba(0,255,65,0.8)' }}
                >
                  Welcome to the Secret Vault.
                </div>

                {/* Just kidding */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,0,64,0.1)',
                    border: '1px solid rgba(255,0,64,0.3)',
                  }}
                >
                  <div className="text-4xl mb-3">😂</div>
                  <div
                    className="font-display font-black text-2xl mb-2"
                    style={{ color: '#ff0040', textShadow: '0 0 20px #ff0040' }}
                  >
                    JUST KIDDING.
                  </div>
                  <div className="font-mono-custom text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    There is no secret vault. There is nothing here.<br />
                    You just got trolled. Congratulations.
                  </div>
                  <div className="mt-3 font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.4)' }}>
                    — Signed, KINNA.EXE Security Division
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
}
