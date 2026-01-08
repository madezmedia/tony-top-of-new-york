import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSeries } from './components/AboutSeries';
import { Players } from './components/Players';
import { Episodes } from './components/Episodes';
import { News } from './components/News';
import { PressKit } from './components/PressKit';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans antialiased selection:bg-primary-main/30">
      <Navbar />
      <main>
        <Hero />
        <AboutSeries />
        <Players />
        <Episodes />
        <News />
        <PressKit />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
