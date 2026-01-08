import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client, Environment } from 'square';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Square client
const squareClient = new Client({
  environment:
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);

    // Verify user session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    // Look up film
    const { data: film, error: filmError } = await supabase
      .from('films')
      .select('*')
      .eq('slug', slug)
      .single();

    if (filmError || !film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Check if user already has entitlement
    const { data: existingEntitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', user.id)
      .eq('film_id', film.id)
      .eq('active', true)
      .single();

    if (existingEntitlement) {
      return res.status(400).json({ error: 'You already own this film' });
    }

    // Create Square payment link
    const { paymentsApi } = squareClient;
    const idempotencyKey = randomUUID();

    const response = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey,
      quickPay: {
        name: `T.O.N.Y. - ${film.title}`,
        priceMoney: {
          amount: BigInt(film.price_cents),
          currency: 'USD',
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
      prePopulatedData: {
        buyerEmail: user.email ?? undefined,
      },
      checkoutOptions: {
        redirectUrl: `${process.env.VITE_APP_URL}/watch/${slug}?success=1`,
        askForShippingAddress: false,
      },
      paymentNote: `Purchase: T.O.N.Y. - ${film.title}`,
      // Store user and film IDs in order reference for webhook
      description: JSON.stringify({
        userId: user.id,
        filmId: film.id,
        userEmail: user.email,
      }),
    });

    const checkoutUrl = response.result.paymentLink?.url;
    if (!checkoutUrl) {
      console.error('Square error:', response.result);
      return res.status(500).json({ error: 'Failed to create checkout session' });
    }

    // Store pending order in database for webhook reconciliation
    await supabase.from('pending_orders').insert({
      user_id: user.id,
      film_id: film.id,
      square_payment_link_id: response.result.paymentLink?.id,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({
      checkoutUrl,
      orderId: response.result.paymentLink?.orderId,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
