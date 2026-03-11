import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSeries } from './components/AboutSeries';
import { Players } from './components/Players';
import { Episodes } from './components/Episodes';
import { News } from './components/News';
import { PressKit } from './components/PressKit';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { WatchPage } from './components/watch';
import { AuthPage } from './components/auth/AuthPage';
import { ActivatePage } from './components/device/ActivatePage';

import { PrivacyPage } from './components/legal/PrivacyPage';
import { TermsPage } from './components/legal/TermsPage';
import CookieConsent from 'react-cookie-consent';

// Simple client-side routing
function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return path;
}

function App() {
  const path = useRoute();

  // Feature toggles via environment variables
  const ENABLE_PRESS_KIT = process.env.VITE_ENABLE_PRESS_KIT === 'true';

  // Handle Legal routes
  if (path.startsWith('/privacy')) return <PrivacyPage />;
  if (path.startsWith('/terms')) return <TermsPage />;

  // Handle /watch and /watch/:slug routes
  if (path.startsWith('/watch')) {
    const slug = path.split('/')[2] || 'episode-one';
    return <WatchPage slug={slug} />;
  }

  // Handle /auth routes
  if (path.startsWith('/auth')) {
    const isSignup = path.includes('/signup');
    return <AuthPage type={isSignup ? 'signup' : 'login'} />;
  }

  // Handle /activate route for Roku TV Linking
  if (path.startsWith('/activate')) {
    return <ActivatePage />;
  }

  // Default: Home page
  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans antialiased selection:bg-primary-main/30 relative">
      <div className="film-grain animate-noise"></div>
      <div className="vignette"></div>
      <Navbar />
      <main>
        <Hero />
        <AboutSeries />
        <Players />
        <Episodes />
        <News />
        {ENABLE_PRESS_KIT && <PressKit />}
        <Contact />
      </main>
      
      <CookieConsent
        location="bottom"
        buttonText="Accept All"
        style={{ background: "#0a0a0a", borderTop: "1px solid #1f1f1f", zIndex: 50 }}
        buttonStyle={{ backgroundColor: "#E61025", color: "#fff", fontSize: "14px", fontWeight: "bold", borderRadius: "4px" }}
        expires={150}
      >
        We use cookies to enable device linking, remember your streaming progress, and analyze site traffic to improve T.O.N.Y. By continuing to use this site, you consent to our use of cookies.
      </CookieConsent>

      <Footer />
    </div>
  );
}

export default App;
