import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { env } from '../config/env';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mp3', 'audio/wav', 'application/pdf'] as const;

const ALLOWED_MAGIC_BYTES: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
  'image/webp': ['52494646'],
  'audio/webm': ['1a45dfa3'],
  'application/pdf': ['25504446'],
};

function checkMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = ALLOWED_MAGIC_BYTES[mimeType];
  if (!signatures) return true;
  return signatures.some(sig => buffer.toString('hex', 0, sig.length / 2).toLowerCase() === sig.toLowerCase());
}

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed: readonly string[] = ALLOWED_MIME_TYPES;
    if (!allowed.includes(file.mimetype as any)) {
      cb(new Error('File type not supported'));
      return;
    }
    cb(null, true);
  },
});

export async function validateFileBuffer(buffer: Buffer, mimeType: string): Promise<boolean> {
  return checkMagicBytes(buffer, mimeType);
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resourceType?: 'image' | 'raw' | 'video'; mimeType?: string } = {}
) {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    return { url: '', publicId: '', mock: true };
  }
  if (options.mimeType) {
    const valid = await validateFileBuffer(buffer, options.mimeType);
    if (!valid) {
      throw new Error('File content does not match declared type');
    }
  }
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'studysnap',
        resource_type: options.resourceType || 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result!.secure_url, publicId: result!.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  if (!env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
}
