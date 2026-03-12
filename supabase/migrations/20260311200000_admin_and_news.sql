-- Create the 'admins' table to manage access to the /admin dashboard
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the 'posts' table for the blog/news system
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the 'mailing_list' table for email signups
CREATE TABLE IF NOT EXISTS public.mailing_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailing_list ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS Policies
-- -----------------------------------------------------

-- Admins: Only actual admins can view the admins list
CREATE POLICY "Admins can view admins" ON public.admins
    FOR SELECT USING (auth.email() = email);

-- Posts: Everyone can see published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (published = true);

-- Posts: Only admins can view unpublished posts or modify any post
CREATE POLICY "Admins have full access to posts" ON public.posts
    FOR ALL USING (
        auth.email() IN (SELECT email FROM public.admins)
    );

-- Mailing List: Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe to mailing list" ON public.mailing_list
    FOR INSERT WITH CHECK (true);

-- Mailing List: Only admins can view the mailing list
CREATE POLICY "Admins can view mailing list" ON public.mailing_list
    FOR SELECT USING (
        auth.email() IN (SELECT email FROM public.admins)
    );
