import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { PressContact } from '../../types';
import { ANIMATION_PRESETS } from '../../utils/animations';

interface ContactCardProps {
  contacts: PressContact[];
}

export const ContactCard: React.FC<ContactCardProps> = ({ contacts }) => {
  return (
    <motion.div
      variants={ANIMATION_PRESETS.slideUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="bg-neutral-surface border border-neutral-border rounded-lg p-8 mt-16"
    >
      <h3 className="font-display text-2xl font-bold text-white mb-6">
        Press Contacts
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-neutral-bg rounded-lg border border-neutral-border hover:border-primary-main/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary-main/10 border border-primary-main/30 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-primary-main" />
            </div>
            <div>
              <h4 className="font-bold text-white">{contact.name}</h4>
              <p className="text-neutral-muted text-sm mb-2">{contact.role}</p>
              <a
                href={`mailto:${contact.email}`}
                className="text-primary-main hover:text-primary-light transition-colors text-sm font-medium"
              >
                {contact.email}
              </a>
              {contact.phone && (
                <div className="flex items-center gap-1 mt-1 text-neutral-textSecondary text-sm">
                  <Phone size={12} />
                  {contact.phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
