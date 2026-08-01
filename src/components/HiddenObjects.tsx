import { motion } from 'framer-motion';
import { useSound } from '../hooks/useKinna';

interface HiddenObjectsProps {
  foundSet: Set<string>;
  onFind: (id: string) => void;
}

const OBJECT_LOCATIONS = [
  { id: 'secret-1', top: '15%', left: '5%', icon: '🕵️‍♂️', label: 'Spy Agent' },
  { id: 'secret-2', top: '28%', right: '4%', icon: '🍕', label: 'Stolen Pizza' },
  { id: 'secret-3', top: '42%', left: '3%', icon: '⏰', label: 'Snoozed Alarm' },
  { id: 'secret-4', top: '55%', right: '6%', icon: '💤', label: 'Floating Zzz' },
  { id: 'secret-5', top: '68%', left: '4%', icon: '🎮', label: 'Hidden Controller' },
  { id: 'secret-6', top: '78%', right: '3%', icon: '☕', label: 'Secret Tea Cup' },
  { id: 'secret-7', top: '88%', left: '6%', icon: '🔑', label: 'Vault Key' },
  { id: 'secret-8', top: '96%', right: '5%', icon: '🛸', label: 'Unidentified Flying Snack' },
  { id: 'secret-9', top: '22%', left: '92%', icon: '🐱', label: 'Non-existent Cat' },
  { id: 'secret-10', top: '35%', left: '8%', icon: '📜', label: 'Unread Homework' },
  { id: 'secret-11', top: '48%', right: '12%', icon: '🔋', label: '1% Battery Icon' },
  { id: 'secret-12', top: '62%', left: '10%', icon: '🛌', label: 'Mini Bed' },
  { id: 'secret-13', top: '73%', left: '88%', icon: '🧦', label: 'Lost Sock' },
  { id: 'secret-14', top: '83%', left: '12%', icon: '👑', label: 'Lazy Crown' },
  { id: 'secret-15', top: '92%', right: '15%', icon: '🏆', label: 'Procrastination Trophy' },
];

export function HiddenObjectsLayer({ foundSet, onFind }: HiddenObjectsProps) {
  const { playSuccess, playNotification } = useSound();

  const handleFound = (id: string) => {
    if (foundSet.has(id)) return;
    playNotification();
    playSuccess();
    onFind(id);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {OBJECT_LOCATIONS.map((obj) => {
        const isFound = foundSet.has(obj.id);
        return (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              top: obj.top,
              left: obj.left,
              right: obj.right,
              pointerEvents: 'auto',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.4, rotate: 15 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleFound(obj.id)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isFound
                  ? 'bg-yellow-500/30 border border-yellow-400 opacity-100 shadow-[0_0_15px_#FFD700]'
                  : 'opacity-30 hover:opacity-100 bg-black/40 border border-yellow-500/20'
              }`}
              title={isFound ? `Found: ${obj.label}` : 'Secret Classified Evidence'}
            >
              <span className="text-xl md:text-2xl">{isFound ? '⭐' : obj.icon}</span>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}
