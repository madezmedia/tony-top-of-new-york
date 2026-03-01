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

  // Handle /watch and /watch/:slug routes
  if (path.startsWith('/watch')) {
    const slug = path.split('/')[2] || 's1e1-concrete-jungle';
    return <WatchPage slug={slug} />;
  }

  // Handle /auth routes (placeholder - would need full auth pages)
  if (path.startsWith('/auth')) {
    // For now, redirect to home with a message
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-text mb-4">
            Authentication Coming Soon
          </h1>
          <p className="text-neutral-textSecondary mb-6">
            Sign up and login functionality is being configured. Check back soon!
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Default: Home page
  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans antialiased selection:bg-primary-main/30">
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
      <Footer />
    </div>
  );
}

export default App;
