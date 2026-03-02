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
  const baseStyles = "px-8 py-3 rounded-sm font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group";

  const variants = {
    primary: "bg-primary-main hover:bg-primary-dark text-black font-black shadow-[0_0_15px_rgba(230,16,37,0.3)] hover:shadow-[0_0_25px_rgba(230,16,37,0.6)] border border-primary-main/20",
    outline: "border border-primary-main text-primary-main hover:bg-primary-main/10 shadow-[inset_0_0_10px_rgba(230,16,37,0.05)] hover:shadow-[inset_0_0_20px_rgba(230,16,37,0.1)]",
    ghost: "text-neutral-text hover:text-primary-main hover:drop-shadow-[0_0_8px_rgba(230,16,37,0.5)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, skewX: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {variant !== 'ghost' && (
        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};
