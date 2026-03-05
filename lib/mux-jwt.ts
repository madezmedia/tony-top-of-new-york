import jwt from 'jsonwebtoken';

export interface MuxSigningOptions {
  signingKeyId: string;
  privateKeyBase64: string;
  restrictionId?: string;
}

const MIN_EXPIRY_SECONDS = 4 * 60 * 60; // 4 hours
const THUMBNAIL_STORYBOARD_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

function getPrivateKey(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf8');
}

function computeExpiry(episodeDurationSeconds: number): number {
  const durationExpiry = episodeDurationSeconds + 300; // +5 min buffer
  return Math.floor(Date.now() / 1000) + Math.max(MIN_EXPIRY_SECONDS, durationExpiry);
}

export function generateVideoToken(
  playbackId: string,
  episodeDurationSeconds: number,
  options: MuxSigningOptions
): string {
  const claims: Record<string, unknown> = {
    sub: playbackId,
    aud: 'v',
    kid: options.signingKeyId,
    exp: computeExpiry(episodeDurationSeconds),
  };

  if (options.restrictionId) {
    claims.playback_restriction_id = options.restrictionId;
  }

  return jwt.sign(claims, getPrivateKey(options.privateKeyBase64), {
    algorithm: 'RS256',
    noTimestamp: true,
  });
}

export function generateThumbnailToken(
  playbackId: string,
  options: MuxSigningOptions
): string {
  const claims: Record<string, unknown> = {
    sub: playbackId,
    aud: 't',
    kid: options.signingKeyId,
    exp: Math.floor(Date.now() / 1000) + THUMBNAIL_STORYBOARD_EXPIRY_SECONDS,
  };

  if (options.restrictionId) {
    claims.playback_restriction_id = options.restrictionId;
  }

  return jwt.sign(claims, getPrivateKey(options.privateKeyBase64), {
    algorithm: 'RS256',
    noTimestamp: true,
  });
}

export function generateStoryboardToken(
  playbackId: string,
  options: MuxSigningOptions
): string {
  const claims: Record<string, unknown> = {
    sub: playbackId,
    aud: 's',
    kid: options.signingKeyId,
    exp: Math.floor(Date.now() / 1000) + THUMBNAIL_STORYBOARD_EXPIRY_SECONDS,
  };

  if (options.restrictionId) {
    claims.playback_restriction_id = options.restrictionId;
  }

  return jwt.sign(claims, getPrivateKey(options.privateKeyBase64), {
    algorithm: 'RS256',
    noTimestamp: true,
  });
}
