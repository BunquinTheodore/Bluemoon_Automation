import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db, getErrorMessage, isAuthorizedCronRequest } from '../lib/firebase-admin';

const CLOUDINARY_BATCH_LIMIT = 100;
const RETENTION_MS = 24 * 60 * 60 * 1000;

async function deleteFromCloudinary(
  publicIds: string[],
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  for (let i = 0; i < publicIds.length; i += CLOUDINARY_BATCH_LIMIT) {
    const batch = publicIds.slice(i, i + CLOUDINARY_BATCH_LIMIT);
    const params = new URLSearchParams();
    batch.forEach((id) => params.append('public_ids[]', id));

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${params.toString()}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Basic ${basicAuth}` },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudinary deletion failed (${response.status}): ${text}`);
    }
    results.push((await response.json()) as Record<string, unknown>);
  }

  return results;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!isAuthorizedCronRequest(req.headers.authorization)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const cutoffDate = new Date(Date.now() - RETENTION_MS);

    // Note: a Firestore `!=` filter excludes documents where the field is
    // missing, and submissions are created without a `deleted` field, so the
    // "not deleted" filter is applied in memory.
    const snapshot = await db
      .collection('taskSubmissions')
      .where('timestamp', '<', cutoffDate)
      .get();

    const docsToClean = snapshot.docs.filter((doc: QueryDocumentSnapshot) => doc.data().deleted !== true);

    if (docsToClean.length === 0) {
      return res.status(200).json({ success: true, message: 'No old photos to delete', deletedCount: 0 });
    }

    const publicIds = docsToClean
      .map((doc: QueryDocumentSnapshot) => doc.data().photoPath as unknown)
      .filter((path: unknown): path is string => typeof path === 'string' && path.length > 0);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    const cloudinaryResults =
      publicIds.length > 0 ? await deleteFromCloudinary(publicIds, cloudName, apiKey, apiSecret) : [];

    // Soft delete in Firestore (batches are limited to 500 writes)
    for (let i = 0; i < docsToClean.length; i += 500) {
      const batch = db.batch();
      docsToClean.slice(i, i + 500).forEach((doc: QueryDocumentSnapshot) => {
        batch.update(doc.ref, {
          deleted: true,
          deletedAt: new Date(),
          photoUrl: null,
          photoPath: null,
        });
      });
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      message: 'Old photos deleted successfully',
      deletedCount: publicIds.length,
      markedDeleted: docsToClean.length,
      cloudinaryResponse: cloudinaryResults,
    });
  } catch (error) {
    console.error('Error cleaning up old photos:', error);
    return res.status(500).json({
      success: false,
      error: getErrorMessage(error, 'Failed to cleanup old photos'),
    });
  }
}
