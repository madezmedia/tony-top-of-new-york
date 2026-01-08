import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Auth features will not work.');
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Auth helper functions
export const auth = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current user session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  /**
   * Get the current user
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  /**
   * Get the access token for API calls
   */
  async getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/auth/reset-password`,
    });
    return { data, error };
  },
};

// API helper for making authenticated requests
export const api = {
  /**
   * Make an authenticated POST request to our API
   */
  async post(endpoint: string, body: any) {
    const token = await auth.getAccessToken();

    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  },

  /**
   * Check entitlement for a film
   */
  async checkEntitlement(slug: string) {
    return this.post('check-entitlement', { slug });
  },

  /**
   * Get Mux playback token
   */
  async getMuxToken(slug: string) {
    return this.post('mux-token', { slug });
  },

  /**
   * Create checkout session
   */
  async createCheckout(slug: string) {
    return this.post('checkout', { slug });
  },

  /**
   * Get download link
   */
  async getDownloadLink(slug: string, quality: string = '1080p') {
    return this.post('download-link', { slug, quality });
  },
};
