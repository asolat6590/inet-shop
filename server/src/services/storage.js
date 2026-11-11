import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const BUCKET_NAME = process.env.NEON_BUCKET || 'assets';

export const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Neon requires path-style addressing
});

/**
 * Upload a file/buffer to Neon Object Storage
 * @param {Object} options
 * @param {Buffer} options.buffer
 * @param {string} options.key - object path/name
 * @param {string} options.contentType
 * @param {string} [options.bucket]
 * @returns {Promise<{ key: string, url: string }>}
 */
export async function uploadToStorage({ buffer, key, contentType = 'application/octet-stream', bucket = BUCKET_NAME }) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3.send(command);

  // Endpoint format for Neon Object Storage
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, '') || '';
  const storageUrl = `${endpoint}/${bucket}/${key}`;

  return {
    key,
    bucket,
    url: storageUrl,
  };
}

/**
 * Generate a presigned GET URL for secure access
 */
export async function getStoragePresignedUrl({ key, bucket = BUCKET_NAME, expiresIn = 86400 }) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
}

/**
 * Get an object from Neon Object Storage
 */
export async function getFromStorage({ key, bucket = BUCKET_NAME }) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await s3.send(command);
}

export default {
  s3,
  uploadToStorage,
  getStoragePresignedUrl,
  getFromStorage,
};
