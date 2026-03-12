import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';
import { buildImageUrl } from '../lib/media';
import { MailingListForm } from './MailingListForm';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-bg border-t border-neutral-border py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          {/* Brand & Newsletter */}
          <div className="w-full md:w-1/2 lg:w-1/3">
            <img
              src={buildImageUrl('brand', 'tony-logo', 'thumb')}
              alt="T.O.N.Y."
              className="h-10 w-auto object-contain mb-6 mx-auto md:mx-0 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
            />
            <p className="text-neutral-textSecondary mb-6 text-center md:text-left">
              Join the inner circle for exclusive updates, early access, and behind-the-scenes content from the Bronx.
            </p>
            <MailingListForm variant="inline" source="footer" />
          </div>

          {/* Socials & Copyright */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-6 pt-4">
            <img
              src={buildImageUrl('brand', 'tony-logo', 'thumb')}
              alt="T.O.N.Y."
              className="h-12 w-auto object-contain mb-2 mx-auto md:mx-0"
            />
            <p className="text-neutral-textSecondary text-sm">© 2024 Top of New York Productions. All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="text-neutral-textSecondary hover:text-primary-main transition-colors focus-visible:ring-2 focus-visible:ring-primary-main outline-none rounded-sm bg-transparent"><Facebook size={24} /></a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter" className="text-neutral-textSecondary hover:text-primary-main transition-colors focus-visible:ring-2 focus-visible:ring-primary-main outline-none rounded-sm bg-transparent"><Twitter size={24} /></a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="text-neutral-textSecondary hover:text-primary-main transition-colors focus-visible:ring-2 focus-visible:ring-primary-main outline-none rounded-sm bg-transparent"><Instagram size={24} /></a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="Subscribe to our YouTube channel" className="text-neutral-textSecondary hover:text-primary-main transition-colors focus-visible:ring-2 focus-visible:ring-primary-main outline-none rounded-sm bg-transparent"><Youtube size={24} /></a>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 text-xs text-neutral-textSecondary uppercase tracking-wider font-bold">
          <a href="/privacy" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-main outline-none rounded-sm">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-main outline-none rounded-sm">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
