import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SQUARE_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;

function verifySquareSignature(
  rawBody: string,
  signature: string | null,
  notificationUrl: string
): boolean {
  if (!signature) return false;

  // Square signature verification
  // See: https://developer.squareup.com/docs/webhooks/step3validate
  const stringToSign = notificationUrl + rawBody;
  const hmac = crypto
    .createHmac('sha256', SQUARE_SIGNATURE_KEY)
    .update(stringToSign)
    .digest('base64');

  return hmac === signature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = req.headers['x-square-hmacsha256-signature'] as string | null;

    // Construct the notification URL
    const notificationUrl = `${process.env.VITE_APP_URL}/api/square-webhook`;

    // Verify signature (skip in development for testing)
    if (process.env.NODE_ENV === 'production') {
      if (!verifySquareSignature(rawBody, signature, notificationUrl)) {
        console.error('Invalid Square webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event.type;

    console.log('Received Square webhook:', eventType);

    // Handle payment completion events
    if (eventType === 'payment.completed' || eventType === 'payment.updated') {
      const payment = event.data?.object?.payment;

      if (!payment) {
        console.error('No payment object in event');
        return res.status(400).json({ error: 'Invalid event data' });
      }

      // Only process completed payments
      if (payment.status !== 'COMPLETED') {
        console.log('Payment not completed, status:', payment.status);
        return res.status(200).json({ received: true, status: 'ignored' });
      }

      // Try to get user and film info from order note/description
      let userId: string | null = null;
      let filmId: string | null = null;

      // Check if we stored the info in pending_orders
      if (payment.order_id) {
        const { data: pendingOrder } = await supabase
          .from('pending_orders')
          .select('user_id, film_id')
          .eq('square_order_id', payment.order_id)
          .single();

        if (pendingOrder) {
          userId = pendingOrder.user_id;
          filmId = pendingOrder.film_id;
        }
      }

      // Fallback: Try to parse from payment note if available
      if (!userId && payment.note) {
        try {
          const noteData = JSON.parse(payment.note);
          userId = noteData.userId;
          filmId = noteData.filmId;
        } catch (e) {
          // Note is not JSON
        }
      }

      if (!userId || !filmId) {
        console.error('Could not determine user or film for payment:', payment.id);
        return res.status(200).json({ received: true, status: 'missing_metadata' });
      }

      // Create or update entitlement
      const { error: entitlementError } = await supabase
        .from('entitlements')
        .upsert(
          {
            user_id: userId,
            film_id: filmId,
            active: true,
            purchased_at: new Date().toISOString(),
            square_payment_id: payment.id,
          },
          {
            onConflict: 'user_id,film_id',
          }
        );

      if (entitlementError) {
        console.error('Error creating entitlement:', entitlementError);
        return res.status(500).json({ error: 'Failed to create entitlement' });
      }

      // Clean up pending order
      await supabase
        .from('pending_orders')
        .delete()
        .match({ user_id: userId, film_id: filmId });

      console.log(`Entitlement created for user ${userId} on film ${filmId}`);

      return res.status(200).json({
        received: true,
        status: 'entitlement_created',
        userId,
        filmId,
      });
    }

    // For other event types, just acknowledge receipt
    return res.status(200).json({ received: true, eventType });
  } catch (error) {
    console.error('Error processing Square webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Vercel config to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
