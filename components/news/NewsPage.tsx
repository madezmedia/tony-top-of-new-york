import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { api } from '../../lib/supabase';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
}

import { MailingListForm } from '../MailingListForm';

export const NewsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      // Only fetch published posts for the public view
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError('Failed to load news updates.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="sticky top-0 z-40 bg-neutral-bg/80 backdrop-blur-xl border-b border-neutral-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-neutral-textSecondary hover:text-neutral-text transition-colors">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to T.O.N.Y.</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-text mb-4">
            Latest Dispatches
          </h1>
          <p className="text-lg text-neutral-textSecondary">
            News, behind-the-scenes updates, and announcements from the Bronx.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="mb-16"
        >
          <MailingListForm variant="card" source="news-page" />
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {posts.length === 0 && !error ? (
          <div className="text-center py-12 text-neutral-textSecondary border border-neutral-border border-dashed rounded-xl">
            No updates yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-neutral-surface border border-neutral-border rounded-2xl p-6 md:p-8 hover:border-primary-main/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-primary-main mb-4 font-medium uppercase tracking-wider">
                  <Calendar size={16} />
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-primary-main transition-colors">
                  <a href={`/news/${post.slug}`} className="focus:outline-none before:absolute before:inset-0">
                    {post.title}
                  </a>
                </h2>
                
                {post.excerpt && (
                  <p className="text-neutral-textSecondary text-lg leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="text-primary-main font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                  Read Full Update <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-border mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-neutral-textSecondary">
          <p>&copy; {new Date().getFullYear()} T.O.N.Y. - Top of New York. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
