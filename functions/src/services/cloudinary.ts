import fetch from 'node-fetch';

/**
 * Cloudinary Admin API service for photo deletion.
 * Credentials are read from CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
 */

interface CloudinaryDeleteResult {
  deleted: Record<string, string>;
  deleted_counts?: {
    [key: string]: {
      original: number;
      derived: number;
    };
  };
  partial?: boolean;
}

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/dtzxxwzpj/image/upload/v1234567890/folder/image.jpg
 * Returns: folder/image
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split('/');

    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex + 1 >= pathParts.length) {
      return null;
    }

    // Skip the optional version segment (v1234567890) and take the rest
    let rest = pathParts.slice(uploadIndex + 1);
    if (rest.length > 0 && /^v\d+$/.test(rest[0])) {
      rest = rest.slice(1);
    }
    if (rest.length === 0) {
      return null;
    }

    const publicId = decodeURIComponent(rest.join('/')).replace(/\.[^/.]+$/, '');
    return publicId || null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', cloudinaryUrl, error);
    return null;
  }
}

/**
 * Delete photos from Cloudinary using the Admin API (HTTP Basic auth with API key/secret).
 */
export async function deleteFromCloudinary(publicIds: string[]): Promise<DeleteResult> {
  try {
    if (publicIds.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured in environment variables');
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    // Cloudinary allows batch deletion of up to 100 resources at once
    const batchSize = 100;
    let totalDeleted = 0;

    for (let i = 0; i < publicIds.length; i += batchSize) {
      const batch = publicIds.slice(i, i + batchSize);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image/upload`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({ public_ids: batch }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary API error: ${response.status} - ${errorText}`);
      }

      const result = (await response.json()) as CloudinaryDeleteResult;
      const deletedInBatch = Object.values(result.deleted || {}).filter(
        (status) => status === 'deleted'
      ).length;
      totalDeleted += deletedInBatch;

      console.log(`Deleted ${deletedInBatch} photos from Cloudinary (batch ${Math.floor(i / batchSize) + 1})`);
    }

    return { success: true, deletedCount: totalDeleted };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      deletedCount: 0,
      error: errorMessage(error, 'Failed to delete photos from Cloudinary'),
    };
  }
}

/**
 * Delete photos from Cloudinary using URLs.
 * Extracts public_ids from URLs and calls deleteFromCloudinary.
 */
export async function deletePhotosByUrls(photoUrls: string[]): Promise<DeleteResult> {
  try {
    const publicIds: string[] = [];

    for (const url of photoUrls) {
      const publicId = extractPublicId(url);
      if (publicId) {
        publicIds.push(publicId);
      } else {
        console.warn('Could not extract public_id from URL:', url);
      }
    }

    if (publicIds.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    return await deleteFromCloudinary(publicIds);
  } catch (error) {
    console.error('Error deleting photos by URLs:', error);
    return {
      success: false,
      deletedCount: 0,
      error: errorMessage(error, 'Failed to delete photos'),
    };
  }
}
