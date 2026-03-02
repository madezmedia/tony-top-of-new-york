import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { Button } from './ui/Button';
import { buildImageUrl } from '../lib/media';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-neutral-bg/95 backdrop-blur-xl py-4 shadow-[0_4px_30px_rgba(5,3,3,0.9)] border-b border-primary-main/20' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-8'
    }`;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img
              src={buildImageUrl('brand', 'tony-logo', 'thumb')}
              alt="T.O.N.Y."
              className="h-10 w-auto object-contain"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold text-neutral-text hover:text-primary-main hover:drop-shadow-[0_0_8px_rgba(230,16,37,0.8)] transition-all tracking-[0.1em] uppercase relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-main transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(230,16,37,0.8)]"></span>
              </a>
            ))}
            <a href="/watch">
              <Button variant="primary" className="!px-6 !py-2 !text-xs">
                Watch Now
              </Button>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-neutral-bg pt-24 px-8 md:hidden flex flex-col items-center gap-8"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-display font-bold text-white hover:text-primary-main hover:drop-shadow-[0_0_15px_rgba(230,16,37,0.8)] transition-all uppercase tracking-widest relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-main transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(230,16,37,0.8)]"></span>
              </a>
            ))}
            <a href="/watch" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="primary">
                Watch Now <Play size={16} fill="currentColor" />
              </Button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
