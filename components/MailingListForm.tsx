import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface MailingListFormProps {
  variant?: 'inline' | 'card';
  source?: string;
}

export const MailingListForm: React.FC<MailingListFormProps> = ({ 
  variant = 'inline',
  source = 'website'
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus('loading');
      
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setMessage('You are now on the list.');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 text-green-400 ${variant === 'card' ? 'bg-neutral-surface border border-green-500/20 rounded-xl p-6 justify-center' : ''}`}
      >
        <CheckCircle2 className="w-6 h-6 shrink-0" />
        <p className="font-medium text-lg">{message}</p>
      </motion.div>
    );
  }

  const InlineForm = (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-neutral-textSecondary" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            placeholder="Enter your email"
            className="block w-full pl-10 pr-3 py-3 border border-neutral-border rounded-lg bg-neutral-surface text-white placeholder-neutral-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={status === 'loading'}
          className="whitespace-nowrap sm:w-auto w-full flex justify-center py-3"
        >
          {status === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Join the List'
          )}
        </Button>
      </div>
      {status === 'error' && (
        <div className="mt-2 flex items-center gap-2 text-primary-main text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{message}</p>
        </div>
      )}
    </form>
  );

  if (variant === 'inline') return InlineForm;

  return (
    <div className="bg-neutral-surface border border-neutral-border p-8 rounded-2xl relative overflow-hidden group">
      {/* Decorative gradient blur */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary-main/10 rounded-full blur-3xl group-hover:bg-primary-main/20 transition-colors duration-700 pointer-events-none" />
      
      <div className="relative z-10 space-y-4">
        <Mail className="w-8 h-8 text-primary-main" />
        <h3 className="text-2xl font-display font-bold text-white">
          The Inner Circle
        </h3>
        <p className="text-neutral-textSecondary leading-relaxed pb-2">
          Hustlers don't wait for news. Get exclusive updates, early access to episodes, and behind-the-scenes content delivered directly to your inbox.
        </p>
        {InlineForm}
      </div>
    </div>
  );
};
