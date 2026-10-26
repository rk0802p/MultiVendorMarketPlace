import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { config } from '../../config/environment.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadService {
  /**
   * Initialize S3 client if valid AWS credentials exist
   */
  static getS3Client() {
    if (config.aws.accessKeyId && config.aws.secretAccessKey && config.aws.accessKeyId !== 'your_aws_access_key_id') {
      return new S3Client({
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });
    }
    return null;
  }

  /**
   * Generate S3 presigned URL for direct image upload
   */
  static async generatePresignedUrl({ fileName, fileType, vendorId }) {
    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      const error = new Error(`Unsupported image type "${fileType}". Allowed formats: JPEG, PNG, WEBP.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 2. Generate secure key path: uploads/vendors/<vendorId>/<timestamp>-<random>.<ext>
    const ext = fileName.split('.').pop() || 'jpg';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const key = `uploads/vendors/${vendorId}/${Date.now()}-${randomHex}.${ext}`;

    const s3Client = this.getS3Client();

    if (s3Client) {
      const command = new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      const fileUrl = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;

      return {
        uploadUrl,
        fileUrl,
        key,
        expiresIn: 300,
        maxSizeBytes: MAX_FILE_SIZE_BYTES,
      };
    }

    // Fallback / Simulated mode for local development and test environments
    const mockUploadUrl = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&mock_signature=true`;
    const mockFileUrl = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;

    return {
      uploadUrl: mockUploadUrl,
      fileUrl: mockFileUrl,
      key,
      expiresIn: 300,
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
      mode: 'simulated_or_local',
    };
  }
}
