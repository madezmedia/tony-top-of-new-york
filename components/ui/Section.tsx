import React from 'react';

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Section: React.FC<SectionProps> = ({ 
  id, 
  children, 
  className = '', 
  fullWidth = false 
}) => {
  return (
    <section id={id} className={`py-20 md:py-32 relative ${className}`}>
      <div className={fullWidth ? 'w-full' : 'container mx-auto px-4 md:px-8 max-w-7xl'}>
        {children}
      </div>
    </section>
  );
};
