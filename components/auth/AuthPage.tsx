import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface AuthPageProps {
    type: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const isLogin = type === 'login';

    useEffect(() => {
        // Clear errors when switching modes
        setError(null);
        setSuccessMessage(null);
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isLogin) {
                const { error: signInError } = await auth.signIn(email, password);
                if (signInError) throw signInError;

                // Handle redirect
                const urlParams = new URLSearchParams(window.location.search);
                const returnTo = urlParams.get('returnTo') || '/';
                window.location.href = returnTo;
            } else {
                const { error: signUpError } = await auth.signUp(email, password);
                if (signUpError) throw signUpError;

                // Supabase typically requires email verification, so we might not be logged in immediately
                setSuccessMessage('Account created successfully! You can now sign in.');
                // Optionally redirect to login or clear form
                const env = (import.meta as any).env || typeof process !== 'undefined' ? process.env : {};
                const requireConfirmation = env.VITE_SUPABASE_REQUIRE_EMAIL_CONFIRMATION;
                if (requireConfirmation === 'true') {
                    setSuccessMessage('Please check your email to verify your account before logging in.');
                } else {
                    // If auto-confirm is on in Supabase, we can just redirect
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnTo = urlParams.get('returnTo') || '/';
                    window.location.href = returnTo;
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || `Failed to ${isLogin ? 'sign in' : 'sign up'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-bg flex flex-col relative">
            <div className="film-grain animate-noise mix-blend-overlay"></div>
            <div className="vignette"></div>

            {/* Header */}
            <header className="absolute top-0 w-full z-40 bg-transparent">
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-neutral-textSecondary hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium tracking-wider uppercase text-sm">Back to Home</span>
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-10">
                        <h1 className="font-display text-4xl font-bold text-white tracking-widest uppercase mb-2">
                            {isLogin ? 'Welcome Back' : 'Join the Nation'}
                        </h1>
                        <p className="text-neutral-textSecondary">
                            {isLogin
                                ? 'Enter your credentials to access your account'
                                : 'Create an account to unlock exclusive access'}
                        </p>
                    </div>

                    <div className="bg-neutral-surface/60 backdrop-blur-xl border border-neutral-border rounded-xl p-8 shadow-2xl">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </motion.div>
                            )}

                            {successMessage && !error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-200">{successMessage}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider font-bold text-neutral-textSecondary ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-neutral-muted" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-neutral-border rounded-lg bg-neutral-bg/50 text-white placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider font-bold text-neutral-textSecondary ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-neutral-muted" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-neutral-border rounded-lg bg-neutral-bg/50 text-white placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-muted hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3 mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : isLogin ? (
                                    'Sign In'
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-neutral-textSecondary">
                            {isLogin ? (
                                <p>
                                    Don't have an account?{' '}
                                    <a
                                        href={`/auth/signup${window.location.search}`}
                                        className="text-primary-main hover:text-primary-light font-medium transition-colors"
                                    >
                                        Sign up
                                    </a>
                                </p>
                            ) : (
                                <p>
                                    Already have an account?{' '}
                                    <a
                                        href={`/auth/login${window.location.search}`}
                                        className="text-primary-main hover:text-primary-light font-medium transition-colors"
                                    >
                                        Sign in
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};
