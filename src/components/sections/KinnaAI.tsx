import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, randomItem } from '../../hooks/useKinna';
import { AI_RESPONSES } from '../../data/content';
import { FiSend } from 'react-icons/fi';

const SUGGESTED_QUESTIONS = [
  'Are you smart?',
  'Where are you?',
  'Why are you late?',
  'Favorite food?',
  'Who is your enemy?',
  'Do you do homework?',
  'What is your plan?',
  'Are you awake?',
  'Why are you like this?',
  'What is your talent?',
];

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
}

const getResponse = (q: string): string => {
  const lower = q.toLowerCase();
  if (lower.includes('smart') || lower.includes('iq') || lower.includes('intelligent')) return randomItem(AI_RESPONSES.smart);
  if (lower.includes('late') || lower.includes('time') || lower.includes('punctual')) return randomItem(AI_RESPONSES.late);
  if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry')) return randomItem(AI_RESPONSES.food);
  if (lower.includes('enemy') || lower.includes('hate') || lower.includes('dislike')) return randomItem(AI_RESPONSES.enemy);
  return randomItem(AI_RESPONSES.default);
};

export function KinnaAI() {
  const { ref, visible } = useScrollReveal(0.1);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, type: 'ai', text: 'Greetings. I am KINNA AI v1.0. Ask me anything. I may or may not answer properly. Proceed at your own risk.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgId, setMsgId] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: msgId, type: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setMsgId((id) => id + 1);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const aiReply: Message = { id: msgId + 1, type: 'ai', text: getResponse(text) };
      setMessages((m) => [...m, aiReply]);
      setMsgId((id) => id + 2);
      setTyping(false);
    }, 800 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section id="kinna-ai" className="relative py-24 px-4 overflow-hidden grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(191,0,255,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-2xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ AI DIVISION</span>
          <h2 className="section-title">KINNA AI</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Powered by extremely questionable intelligence
          </p>
          <div className="section-divider" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Suggested questions */}
          <div className="mb-4 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="font-mono-custom text-xs px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(191,0,255,0.05)',
                  border: '1px solid rgba(191,0,255,0.2)',
                  color: 'rgba(191,0,255,0.8)',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div
            className="terminal-window"
            style={{ border: '1px solid rgba(191,0,255,0.3)' }}
          >
            <div
              className="terminal-header"
              style={{ background: 'rgba(191,0,255,0.05)', borderBottom: '1px solid rgba(191,0,255,0.2)' }}
            >
              <div className="terminal-dot" style={{ background: '#ff5f56' }} />
              <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
              <div className="terminal-dot" style={{ background: '#27c93f' }} />
              <span className="font-mono-custom text-xs ml-2" style={{ color: 'rgba(191,0,255,0.6)' }}>
                KINNA_AI v1.0 — Neural Interface Active
              </span>
              <div
                className="ml-auto w-2 h-2 rounded-full"
                style={{ background: '#00ff41', boxShadow: '0 0 6px #00ff41' }}
              />
            </div>

            <div
              ref={chatRef}
              className="p-4 h-80 overflow-y-auto space-y-3"
              style={{ scrollbarWidth: 'none' }}
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-xs px-4 py-2 rounded-2xl font-mono-custom text-sm"
                      style={{
                        background: msg.type === 'user'
                          ? 'rgba(255,215,0,0.1)'
                          : 'rgba(191,0,255,0.08)',
                        border: `1px solid ${msg.type === 'user' ? 'rgba(255,215,0,0.3)' : 'rgba(191,0,255,0.3)'}`,
                        color: msg.type === 'user' ? '#FFD700' : 'rgba(255,255,255,0.85)',
                        borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      }}
                    >
                      {msg.type === 'ai' && (
                        <span className="text-purple-400 font-bold text-xs block mb-1">KINNA AI ▸</span>
                      )}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div
                      className="px-4 py-2 rounded-2xl font-mono-custom text-sm"
                      style={{
                        background: 'rgba(191,0,255,0.08)',
                        border: '1px solid rgba(191,0,255,0.3)',
                        color: 'rgba(191,0,255,0.7)',
                        borderRadius: '20px 20px 20px 4px',
                      }}
                    >
                      <span style={{ animation: 'blink 0.7s step-end infinite' }}>Processing...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t flex gap-2"
              style={{ borderColor: 'rgba(191,0,255,0.2)' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask KINNA anything..."
                className="flex-1 bg-transparent font-mono-custom text-sm outline-none px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(191,0,255,0.05)',
                  border: '1px solid rgba(191,0,255,0.2)',
                  color: '#fff',
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(191,0,255,0.15)',
                  border: '1px solid rgba(191,0,255,0.4)',
                  color: '#bf00ff',
                }}
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
