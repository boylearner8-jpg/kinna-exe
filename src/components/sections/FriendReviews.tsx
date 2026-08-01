import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useKinna';
import { FRIEND_REVIEWS } from '../../data/content';

export function FriendReviews() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section id="reviews" className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(255,215,0,0.02) 0%, transparent 60%)' }}
      />
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="section-header">
          <span className="section-label">◆ PUBLIC TESTIMONY</span>
          <h2 className="section-title">Friend Reviews</h2>
          <p className="font-mono-custom text-sm mb-4" style={{ color: 'rgba(255,215,0,0.5)' }}>
            Verified reviews from real victims
          </p>
          <div className="section-divider" />
        </div>

        {/* Overall rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-block glass-card rounded-2xl px-10 py-6">
            <div
              className="font-display font-black text-6xl"
              style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.5)' }}
            >
              4.9
            </div>
            <div className="text-3xl mb-2">⭐⭐⭐⭐⭐</div>
            <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.5)' }}>
              Based on everyone who has ever met Kinna
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FRIEND_REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card-hover rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="text-xl mb-3">
                {'⭐'.repeat(review.rating)}
              </div>

              {/* Title */}
              <div
                className="font-display font-bold text-base mb-3"
                style={{ color: '#FFD700' }}
              >
                {review.title}
              </div>

              {/* Review */}
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
                &ldquo;{review.review}&rdquo;
              </p>

              {/* Author */}
              <div className="border-t pt-3" style={{ borderColor: 'rgba(255,215,0,0.1)' }}>
                <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.7)' }}>
                  {review.name}
                </div>
                <div className="font-mono-custom text-xs" style={{ color: 'rgba(255,215,0,0.4)' }}>
                  {review.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
