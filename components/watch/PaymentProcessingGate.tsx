import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/supabase';

interface PaymentProcessingGateProps {
  slug: string;
  onSuccess: () => void;
  onTimeout: () => void;
}

export const PaymentProcessingGate: React.FC<PaymentProcessingGateProps> = ({ slug, onSuccess, onTimeout }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const MAX_ATTEMPTS = 10;
    const POLL_INTERVAL = 3000; // 3 seconds

    const checkEntitlement = async () => {
      try {
        const data = await api.checkEntitlement(slug);
        
        if (data.hasAccess) {
          setStatus('success');
          // Wait 2 seconds so the user sees the green checkmark before the video loads
          setTimeout(() => {
            onSuccess();
          }, 2000);
          return;
        }

        // If not found yet, poll again
        if (attempts < MAX_ATTEMPTS) {
          setAttempts(prev => prev + 1);
          timeoutId = setTimeout(checkEntitlement, POLL_INTERVAL);
        } else {
          // Timeout reached
          setStatus('failed');
          setTimeout(() => {
            onTimeout();
          }, 4000);
        }
      } catch (err) {
        console.error('Error polling entitlement:', err);
        if (attempts < MAX_ATTEMPTS) {
          setAttempts(prev => prev + 1);
          timeoutId = setTimeout(checkEntitlement, POLL_INTERVAL);
        } else {
          setStatus('failed');
          onTimeout();
        }
      }
    };

    // Also trigger the grant-access fallback explicitly in the background
    api.grantAccess(slug).catch(console.warn);

    // Start polling
    checkEntitlement();

    return () => clearTimeout(timeoutId);
  }, [slug, attempts, onSuccess, onTimeout]);

  return (
    <div className="flex flex-col items-center justify-center py-24 min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-surface border border-neutral-border p-8 rounded-xl max-w-md w-full text-center shadow-2xl"
      >
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-main animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment...</h2>
            <p className="text-neutral-textSecondary mb-4">
              We are confirming your transaction with Square. Please do not close this window.
            </p>
            <div className="text-xs text-neutral-textSecondary/50 mt-8">
              Attempt {attempts + 1} of 10
            </div>
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Confirmed!</h2>
            <p className="text-neutral-textSecondary">
              Unlocking your movie now...
            </p>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Waiting for Confirmation</h2>
            <p className="text-neutral-textSecondary mb-6">
              Your transaction might be taking longer than usual to process. Don't worry, your payment is secure.
            </p>
            <button
              onClick={onTimeout}
              className="px-6 py-2 bg-neutral-border hover:bg-neutral-text hover:text-black transition-colors rounded text-sm font-bold uppercase tracking-wider text-white"
            >
              Continue
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
