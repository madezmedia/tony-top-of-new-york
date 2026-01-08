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

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'bg-neutral-bg/90 backdrop-blur-md py-4 shadow-lg border-b border-neutral-border/30' : 'bg-transparent py-6'
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
                className="text-sm font-medium text-neutral-text hover:text-primary-main transition-colors tracking-wide uppercase"
              >
                {link.label}
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
                className="text-2xl font-display font-bold text-white hover:text-primary-main"
              >
                {link.label}
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
