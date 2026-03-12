import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, auth } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Loader2, Plus, Edit2, Trash2, X, Check, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  published: boolean;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [category, setCategory] = useState('');
  const [published, setPublished] = useState(false);
  
  // Preview State
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      const { session } = await auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is in admins table by trying to fetch it
      const { supabase } = await import('../../lib/supabase');
      const { data: adminCheck, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (adminError || !adminCheck) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      fetchPosts();
    } catch (err) {
      console.error('Error checking admin access:', err);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { session } = await auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { supabase } = await import('../../lib/supabase');
      
      const postData = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        content,
        excerpt,
        featured_image: featuredImage,
        category,
        published,
        author_id: session.user.id
      };

      if (editingPostId) {
        const { error: updateError } = await (supabase as any)
          .from('posts')
          .update({ ...postData, updated_at: new Date().toISOString() })
          .eq('id', editingPostId);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await (supabase as any)
          .from('posts')
          .insert([postData]);
          
        if (insertError) throw insertError;
      }

      await fetchPosts();
      resetEditor();
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err.message || 'Failed to save post');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabase');
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      await fetchPosts();
    } catch (err: any) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
      setLoading(false);
    }
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setExcerpt(post.excerpt || '');
    setFeaturedImage(post.featured_image || '');
    setCategory(post.category || '');
    setPublished(post.published);
    setIsEditing(true);
    setShowPreview(false);
  };

  const startNew = () => {
    resetEditor();
    setIsEditing(true);
  };

  const resetEditor = () => {
    setIsEditing(false);
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setContent('');
    setExcerpt('');
    setFeaturedImage('');
    setCategory('');
    setPublished(false);
    setShowPreview(false);
    setError(null);
  };

  if (loading && !isEditing) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-neutral-text mb-2">Access Denied</h1>
        <p className="text-neutral-textSecondary mb-6">
          You must be an administrator to view this page.
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-text">Admin Dashboard</h1>
          <p className="text-neutral-textSecondary">Manage News & Updates</p>
        </div>
        {!isEditing && (
          <Button variant="primary" onClick={startNew}>
            <Plus className="w-4 h-4 mr-2 inline" /> New Post
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isEditing ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-surface border border-neutral-border rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6 border-b border-neutral-border pb-4">
            <h2 className="text-xl font-bold">{editingPostId ? 'Edit Post' : 'New Post'}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <Edit2 className="w-4 h-4 mr-1 inline" /> : <Eye className="w-4 h-4 mr-1 inline" />}
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" onClick={resetEditor}>
                <X className="w-4 h-4 mr-1 inline" /> Cancel
              </Button>
            </div>
          </div>

          {!showPreview ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-neutral-bg border border-neutral-border rounded-lg px-4 py-2 text-white focus:border-primary-main focus:ring-1 focus:ring-primary-main outline-none"
                  placeholder="Post Title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-1">Slug (optional)</label>
                <input 
                  type="text" 
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full bg-neutral-bg border border-neutral-border rounded-lg px-4 py-2 text-white focus:border-primary-main focus:ring-1 focus:ring-primary-main outline-none"
                  placeholder="custom-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-1">Short Excerpt</label>
                <textarea 
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  className="w-full bg-neutral-bg border border-neutral-border rounded-lg px-4 py-2 text-white focus:border-primary-main focus:ring-1 focus:ring-primary-main outline-none h-20"
                  placeholder="A brief summary for the news feed..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-textSecondary mb-1">Featured Image URL</label>
                  <input 
                    type="text" 
                    value={featuredImage}
                    onChange={e => setFeaturedImage(e.target.value)}
                    className="w-full bg-neutral-bg border border-neutral-border rounded-lg px-4 py-2 text-white focus:border-primary-main focus:ring-1 focus:ring-primary-main outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-textSecondary mb-1">Category</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-neutral-bg border border-neutral-border rounded-lg px-4 py-2 text-white focus:border-primary-main focus:ring-1 focus:ring-primary-main outline-none"
                    placeholder="e.g. Casting, Production"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-1">Content (Markdown)</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-neutral-bg border border-neutral-border rounded-lg px-4 py-2 text-white focus:border-primary-main focus:ring-1 focus:ring-primary-main outline-none font-mono text-sm h-96"
                  placeholder="# Hello World&#10;&#10;Write your post in Markdown..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="published"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="w-4 h-4 accent-primary-main"
                />
                <label htmlFor="published" className="text-white font-medium">Publish Post</label>
              </div>

              <div className="pt-4 border-t border-neutral-border flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={loading || !title || !content}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <Check className="w-4 h-4 mr-2 inline" />}
                  Save Post
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none bg-neutral-bg p-6 rounded-lg min-h-[400px]">
              <h1>{title || 'Untitled'}</h1>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="bg-neutral-surface border border-neutral-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-bg/50 border-b border-neutral-border uppercase text-xs tracking-wider text-neutral-textSecondary">
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-textSecondary">
                      No posts found. Create your first post!
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-1">{post.title}</div>
                        <div className="text-xs text-neutral-textSecondary truncate max-w-xs">{post.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-textSecondary">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => startEdit(post)}
                            className="p-2 text-neutral-textSecondary hover:text-white hover:bg-neutral-bg rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-neutral-textSecondary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
