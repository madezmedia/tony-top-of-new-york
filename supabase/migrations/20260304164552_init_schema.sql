-- Create the 'films' table to hold your video catalog
CREATE TABLE IF NOT EXISTS public.films (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    mux_playback_id TEXT NOT NULL,
    trailer_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the 'entitlements' table to track user purchases
CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT false,
    square_payment_id TEXT UNIQUE,
    purchased_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, film_id)
);

-- Create the 'pending_orders' table to link Square checkout to webhooks
CREATE TABLE IF NOT EXISTS public.pending_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
    square_order_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Films are viewable by everyone
CREATE POLICY "Films are viewable by everyone" ON public.films
    FOR SELECT USING (true);

-- Entitlements are viewable by the user who owns them
CREATE POLICY "Users can view their own entitlements" ON public.entitlements
    FOR SELECT USING (auth.uid() = user_id);
