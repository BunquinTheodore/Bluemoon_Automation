import crypto from 'crypto';

export function getCloudinaryTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Generates the Cloudinary API signature for a set of parameters.
 * Cloudinary signs the alphabetically sorted `key=value` pairs joined by `&`,
 * followed by the API secret, using SHA-1.
 */
export function generateCloudinarySignature(
  publicIds: string[],
  apiSecret: string,
  timestamp: number = getCloudinaryTimestamp()
): string {
  const params: Record<string, string> = {
    public_ids: publicIds.join(','),
    timestamp: String(timestamp),
  };
  const paramsToSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');
}
