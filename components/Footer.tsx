import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';
import { buildImageUrl } from '../lib/media';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-bg border-t border-neutral-border py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="text-center md:text-left">
            <img
              src={buildImageUrl('brand', 'tony-logo', 'thumb')}
              alt="T.O.N.Y."
              className="h-12 w-auto object-contain mb-2 mx-auto md:mx-0"
            />
            <p className="text-neutral-textSecondary text-sm">© 2024 Top of New York Productions. All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-neutral-textSecondary hover:text-primary-main transition-colors"><Facebook size={24} /></a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-textSecondary hover:text-primary-main transition-colors"><Twitter size={24} /></a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-textSecondary hover:text-primary-main transition-colors"><Instagram size={24} /></a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-neutral-textSecondary hover:text-primary-main transition-colors"><Youtube size={24} /></a>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 text-xs text-neutral-textSecondary uppercase tracking-wider font-bold">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          <a href="#" className="hover:text-white transition-colors">Accessibility</a>
        </div>
      </div>
    </footer>
  );
};
