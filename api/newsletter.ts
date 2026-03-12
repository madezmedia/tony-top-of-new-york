import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Vercel / Next.js API Route for submitting emails to the Mailing List and triggering Resend
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, source } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    // 1. Add to Supabase mailing_list table
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase Environment Variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from('mailing_list')
      .insert([{ email, subscribed: true }]);

    // We can conditionally ignore duplicate errors if they are already on the list
    if (dbError && dbError.code !== '23505') { 
       console.error('Supabase Error:', dbError);
       throw new Error('Failed to save email to database.');
    }

    // 2. Trigger Welcome Email via Resend (Optional - requires RESEND_API_KEY)
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error: emailError } = await resend.emails.send({
        from: 'T.O.N.Y. <noreply@topofnewyork.com>',
        to: email,
        subject: 'Welcome to the inner circle.',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #020B13; color: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #E61025; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">T.O.N.Y. - Top of New York</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #a3a3a3;">You are officially on the list.</p>
            <p style="font-size: 16px; line-height: 1.6; color: #a3a3a3;">You will be the first to know about new episodes, behind-the-scenes exclusive footage, and upcoming events.</p>
            <hr style="border-color: #333; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666;">If you didn't mean to sign up, simply reply to this email to be removed.</p>
          </div>
        `
      });

      if (emailError) {
         console.warn("Failed to send Resend email, but database saved:", emailError);
      }
    }

    return res.status(200).json({ success: true, message: 'Subscribed' });
  } catch (error: any) {
    console.error('Newsletter Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
