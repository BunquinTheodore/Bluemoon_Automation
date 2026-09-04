// Cloudinary configuration and upload utilities
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtzxxwzpj';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bluemoon_unsigned';

interface CloudinaryUploadResponse {
  url: string;
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  createdAt: string;
}

/**
 * Upload an image file to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder name in Cloudinary (e.g., 'tasks', 'financial-reports')
 * @returns Promise with upload result containing the image URL
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    if (folder) {
      formData.append('folder', folder);
    }

    formData.append('tags', 'bluemoon,automation');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      let message = `Failed to upload image (HTTP ${response.status})`;
      try {
        const errorData = (await response.json()) as { error?: { message?: string } };
        if (errorData.error?.message) message = errorData.error.message;
      } catch {
        // Non-JSON error body; keep the generic message
      }
      throw new Error(message);
    }

    const data = (await response.json()) as CloudinaryUploadResponse;
    if (!data.secure_url || !data.public_id) {
      throw new Error('Cloudinary returned an incomplete upload response');
    }

    return {
      url: data.url,
      publicId: data.public_id,
      secureUrl: data.secure_url,
      format: data.format,
      width: data.width,
      height: data.height,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  folder?: string
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Get optimized image URL with transformations
 * @param publicId - The Cloudinary public ID of the image
 * @param options - Transformation options (width, height, quality, etc.)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string {
  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}

/**
 * Convert Base64 data URL to File object
 * Needed for QRScanScreen which captures photos as Base64
 * @param dataUrl - Base64 data URL string
 * @param filename - Desired filename for the File object
 * @returns File object
 */
export function base64ToFile(dataUrl: string, filename: string): File {
  const [header, payload] = dataUrl.split(',');
  if (!payload) {
    throw new Error('Invalid data URL');
  }
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(payload);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file || file.size === 0) {
    return { valid: false, error: 'The selected file is empty' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please use JPEG, PNG, or WebP format' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum 10MB allowed' };
  }

  return { valid: true };
}
