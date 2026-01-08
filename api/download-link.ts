import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
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

    const { slug, quality = '1080p' } = req.body;
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

    // Check entitlement
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', user.id)
      .eq('film_id', film.id)
      .eq('active', true)
      .single();

    if (!entitlement) {
      return res.status(403).json({ error: 'No active entitlement for this film' });
    }

    // Determine S3 key based on quality
    const qualityMap: Record<string, string> = {
      '4k': 'masters/4k',
      '1080p': 'derivatives/web/1080p',
      '720p': 'derivatives/web/720p',
      '480p': 'derivatives/mobile/480p',
    };

    const qualityPath = qualityMap[quality] || qualityMap['1080p'];
    const s3Key = `${qualityPath}/${film.slug}.mp4`;

    // Generate presigned URL (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: process.env.VITE_S3_BUCKET!,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${film.title}-${quality}.mp4"`,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Log download for analytics
    await supabase.from('download_logs').insert({
      user_id: user.id,
      film_id: film.id,
      quality,
      downloaded_at: new Date().toISOString(),
    });

    return res.status(200).json({
      downloadUrl,
      quality,
      filename: `${film.title}-${quality}.mp4`,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating download link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
