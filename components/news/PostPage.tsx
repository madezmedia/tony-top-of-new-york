import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../ui/Button';

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
}

interface PostPageProps {
  slug: string;
}

export const PostPage: React.FC<PostPageProps> = ({ slug }) => {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabase');
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Post not found (or not published yet).');
        }
        throw error;
      }
      
      setPost(data);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Failed to load the article.');
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-primary-main mb-4" />
        <h2 className="text-2xl font-bold text-neutral-text mb-2">
          Unable to find article
        </h2>
        <p className="text-neutral-textSecondary mb-6 max-w-md">{error}</p>
        <Button variant="outline" onClick={() => window.location.href = '/news'}>
          Back to News
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="sticky top-0 z-40 bg-neutral-bg/80 backdrop-blur-xl border-b border-neutral-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/news" className="flex items-center gap-2 text-neutral-textSecondary hover:text-neutral-text transition-colors">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to News</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="mb-12 border-b border-neutral-border pb-12">
            <div className="flex items-center gap-2 text-sm text-primary-main mb-6 font-medium uppercase tracking-wider">
              <Calendar size={16} />
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-neutral-textSecondary leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          <div className="prose prose-invert prose-lg md:prose-xl max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary-main hover:prose-a:text-red-400 prose-img:rounded-xl">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </motion.article>
      </main>

      <footer className="border-t border-neutral-border mt-24">
        <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center gap-4">
          <img src="/assets/logo.svg" alt="T.O.N.Y." className="w-16 h-16 opacity-50 grayscale" onError={(e) => e.currentTarget.style.display = 'none'} />
          <p className="text-sm text-neutral-textSecondary">&copy; {new Date().getFullYear()} T.O.N.Y. - Top of New York. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
