import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Twitter, Globe } from 'lucide-react';
import { Section } from './ui/Section';
import { CAST_MEMBERS } from '../constants';
import { ANIMATION_PRESETS } from '../utils/animations';
import { CastMember } from '../types';

export const Cast: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);

  return (
    <Section id="cast" className="bg-neutral-surface/30">
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">The Players</h2>
        <div className="w-20 h-1 bg-primary-main mx-auto" />
      </motion.div>

      <motion.div
        variants={ANIMATION_PRESETS.containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {CAST_MEMBERS.map((member) => (
          <motion.div
            key={member.id}
            variants={ANIMATION_PRESETS.itemVariants}
            layoutId={`card-container-${member.id}`}
            onClick={() => setSelectedMember(member)}
            className="group relative h-[500px] overflow-hidden rounded-lg bg-neutral-surface border border-neutral-border hover:border-primary-main/50 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-primary-main/20"
          >
            <img
              src={member.imageUrl}
              alt={member.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-[2px]"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <motion.div 
                className="transform transition-transform duration-500 ease-out"
              >
                <p className="text-primary-main font-bold text-sm tracking-widest uppercase mb-1 drop-shadow-md">{member.role}</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">{member.name}</h3>
                
                {/* Bio Reveal with CSS Grid transition technique */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                   <div className="min-h-0 overflow-hidden">
                      <p className="text-neutral-textSecondary text-sm leading-relaxed pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {member.bio}
                      </p>
                      <div className="pt-4 flex items-center gap-2 text-primary-main font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                         <span>View Full Profile</span>
                         <div className="w-4 h-[1px] bg-primary-main" />
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Cast Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             {/* Backdrop */}
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMember(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
             />
             
             {/* Modal Content */}
             <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-5xl bg-neutral-surface border border-neutral-border rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
             >
                {/* Close Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedMember(null); }}
                  className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-primary-main rounded-full text-white transition-colors"
                >
                  <X size={24} />
                </button>

                {/* Image Side */}
                <div className="md:w-5/12 relative h-64 md:h-auto shrink-0">
                   <img 
                     src={selectedMember.imageUrl} 
                     alt={selectedMember.name} 
                     className="absolute inset-0 w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-neutral-surface to-transparent md:bg-gradient-to-r" />
                </div>

                {/* Text Side */}
                <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                   <div className="mb-6">
                     <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-neutral-bg bg-primary-main rounded-sm uppercase">
                       {selectedMember.role}
                     </span>
                     <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">{selectedMember.name}</h2>
                     <p className="text-neutral-textSecondary italic">Actor / Producer</p>
                   </div>
                   
                   <div className="space-y-6 text-neutral-text text-lg leading-relaxed font-light">
                     <p>{selectedMember.bio}</p>
                     <p>
                       Bringing a raw intensity to the role, {selectedMember.name.split(' ')[0]} captures the essence of a character caught between two worlds. 
                       With a background in independent cinema, they bring an authentic, unfiltered approach that defines the tone of T.O.N.Y.
                     </p>
                     <p className="text-neutral-textSecondary text-base">
                       "It's not just about the crime, it's about the cost of survival in a city that demands everything from you."
                     </p>
                   </div>

                   <div className="mt-10 pt-8 border-t border-neutral-border/50">
                      <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-[0.2em] text-neutral-muted">Follow Cast Member</h4>
                      <div className="flex gap-4">
                        <button className="w-12 h-12 rounded-full bg-neutral-bg border border-neutral-border flex items-center justify-center text-neutral-textSecondary hover:border-primary-main hover:text-primary-main hover:scale-110 transition-all">
                          <Instagram size={20} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-neutral-bg border border-neutral-border flex items-center justify-center text-neutral-textSecondary hover:border-primary-main hover:text-primary-main hover:scale-110 transition-all">
                          <Twitter size={20} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-neutral-bg border border-neutral-border flex items-center justify-center text-neutral-textSecondary hover:border-primary-main hover:text-primary-main hover:scale-110 transition-all">
                          <Globe size={20} />
                        </button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
};
