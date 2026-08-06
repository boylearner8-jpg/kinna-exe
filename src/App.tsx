import { useState } from 'react';
import { useBackgroundMusic, playGlobalBackgroundMusic } from './hooks/useBackgroundMusic';
import { useVisitorTracker } from './hooks/useVisitorTracker';
import { CursorGlow, FloatingParticles, ScanLines } from './components/effects/CursorAndParticles';
import { LoadingScreen } from './components/LoadingScreen';
import { SiteNameEntryModal } from './components/SiteNameEntryModal';
import { KinnaNotificationModal } from './components/KinnaNotificationModal';
import { VisitorRecordsModal } from './components/VisitorRecordsModal';
import { CommentToastContainer } from './components/CommentToastContainer';
import { FloatingCommentsModal } from './components/FloatingCommentsModal';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { KinnaJourney } from './components/sections/KinnaJourney';
import { HorseRallyRunner } from './components/sections/HorseRallyRunner';
import { SpaceShooterGame } from './components/sections/SpaceShooterGame';
import { PublicStats } from './components/sections/PublicStats';
import { CrimePartner } from './components/sections/CrimePartner';
import { HallOfFame } from './components/sections/HallOfFame';
import { Kinnapedia } from './components/sections/Kinnapedia';
import { Fathersahab } from './components/sections/Fathersahab';

import { updateCurrentVisitorName } from './lib/tracker';
import { Footer } from './components/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [userContinued, setUserContinued] = useState(false);

  // Background Music Hook
  const { muted, toggleMute } = useBackgroundMusic(loaded);

  // Visitor Tracker — auto-records session to Supabase
  useVisitorTracker();

  const handleLoadingComplete = () => {
    setLoaded(true);
    playGlobalBackgroundMusic();
    let savedName = '';
    try {
      savedName = localStorage.getItem('kinna_user_global_name') || '';
    } catch {}

    if (!savedName) {
      setShowNameModal(true);
    } else {
      setShowNotificationModal(true);
    }
  };

  const handleSiteNameComplete = (enteredName: string) => {
    if (enteredName) {
      updateCurrentVisitorName(enteredName);
    }
    playGlobalBackgroundMusic();
    setShowNameModal(false);
    setShowNotificationModal(true);
  };

  const handleNotificationClose = () => {
    playGlobalBackgroundMusic();
    setShowNotificationModal(false);
    setUserContinued(true);
  };

  const scrollToDatabase = () => {
    const spaceEl = document.getElementById('space-shooter') || document.getElementById('horse-runner');
    if (spaceEl) {
      spaceEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30 selection:text-yellow-400 relative">
      {/* Intro Loading Screen */}
      {!loaded && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Mandatory Site Entrance Name Prompt */}
      <SiteNameEntryModal
        isOpen={showNameModal}
        onComplete={handleSiteNameComplete}
      />

      {/* Kinna Discord/WhatsApp Style Notification Popup */}
      <KinnaNotificationModal
        isOpen={showNotificationModal}
        onClose={handleNotificationClose}
      />

      {/* Secret Visitor Records Modal (5-click on KINNA.EXE) */}
      <VisitorRecordsModal
        isOpen={showRecordsModal}
        onClose={() => setShowRecordsModal(false)}
      />

      {/* Realtime & Random Comment Toast Notifications (Starts only after clicking Continue) */}
      <CommentToastContainer isLoaded={userContinued} />

      {/* Floating Left Corner Quick Comments Icon & Interactive Guestbook Drawer */}
      <FloatingCommentsModal />

      {/* Global Visual Effects */}
      <CursorGlow />
      <FloatingParticles count={25} />
      <ScanLines />

      {/* Navigation Header */}
      <Navbar
        muted={muted}
        onToggleMute={toggleMute}
        onSecretTrigger={() => setShowRecordsModal(true)}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero onEnter={scrollToDatabase} />
        <SpaceShooterGame />
        <HorseRallyRunner />
        <KinnaJourney />
        <CrimePartner />
        <HallOfFame />
        <Fathersahab />
        <PublicStats />
        <Kinnapedia />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
