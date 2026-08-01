import { useState } from 'react';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { CursorGlow, FloatingParticles, ScanLines } from './components/effects/CursorAndParticles';
import { LoadingScreen } from './components/LoadingScreen';
import { KinnaNotificationModal } from './components/KinnaNotificationModal';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { KinnaJourney } from './components/sections/KinnaJourney';
import { CrimePartner } from './components/sections/CrimePartner';
import { HallOfFame } from './components/sections/HallOfFame';
import { Kinnapedia } from './components/sections/Kinnapedia';
import { Fathersahab } from './components/sections/Fathersahab';
import { LeaveMessage } from './components/sections/LeaveMessage';
import { Footer } from './components/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Background Music Hook with autoplay fallback, fade-in & localStorage mute persistence
  const { muted, toggleMute } = useBackgroundMusic(loaded);

  const handleLoadingComplete = () => {
    setLoaded(true);
    setShowNotificationModal(true);
  };

  const scrollToDatabase = () => {
    const journeyEl = document.getElementById('journey');
    if (journeyEl) {
      journeyEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30 selection:text-yellow-400 relative">
      {/* Intro Loading Screen */}
      {!loaded && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Kinna Discord/WhatsApp Style Notification Popup (Appears immediately after intro) */}
      <KinnaNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      {/* Global Visual Effects */}
      <CursorGlow />
      <FloatingParticles count={25} />
      <ScanLines />

      {/* Navigation Header */}
      <Navbar
        muted={muted}
        onToggleMute={toggleMute}
      />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <Hero onEnter={scrollToDatabase} />

        {/* Classified Sections */}
        <KinnaJourney />
        <CrimePartner />
        <HallOfFame />
        <Kinnapedia />
        <Fathersahab />
        <LeaveMessage />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
