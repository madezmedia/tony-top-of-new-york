import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-md font-bold text-sm tracking-wider uppercase transition-colors duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary-main hover:bg-primary-light text-neutral-bg",
    outline: "border-2 border-primary-main text-primary-main hover:bg-primary-main/10",
    ghost: "text-neutral-text hover:text-primary-main",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
