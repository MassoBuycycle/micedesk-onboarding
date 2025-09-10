/**
 * AWS S3 integration utilities.
 *
 * Provides:
 * - Multer middleware for direct S3 uploads (private ACL)
 * - List, signed URL generation, delete, and move operations
 *
 * Env vars:
 * - AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
 */
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import crypto from 'crypto';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key-id',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-access-key'
  }
});

// S3 bucket name
const bucket = process.env.AWS_S3_BUCKET || 'micedesk-hotel-cms';

// Generate a random filename to prevent overwriting
const generateFileName = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// File filter for checking allowed file types
const fileFilter = (req, file, cb) => {
  // fileType will be set by fileTypeController middleware
  const fileType = req.fileType;
  
  if (!fileType) {
    return cb(new Error('File type not specified'), false);
  }
  
  const extension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (fileType.allowed_extensions && fileType.allowed_extensions.includes(extension)) {
    return cb(null, true);
  }
  
  cb(new Error(`File type not allowed. Allowed types: ${fileType.allowed_extensions.join(', ')}`), false);
};

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucket,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const { entityType, entityId, category, fileTypeCode } = req.params;
      
      // Key format: hotels/{hotelId}/{category}/{fileType}/{filename}
      const key = `${entityType}/${entityId}/${category}/${fileTypeCode}/${generateFileName(file.originalname)}`;
      
      cb(null, key);
    }
  }),
  limits: {
    fileSize: (req) => req.fileType ? req.fileType.max_size : 5242880 // Default 5MB if not specified
  },
  fileFilter: fileFilter
});

// Create upload middleware for a specific route
export const uploadMiddleware = upload.single('file');

// List files from a specific path
export const listFiles = async (prefix) => {
  const params = {
    Bucket: bucket,
    Prefix: prefix
  };

  try {
    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    return data.Contents || [];
  } catch (error) {
    throw error;
  }
};

// Generate a pre-signed URL for file download
export const getSignedUrl = async (key, expiresIn = 3600) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    const command = new GetObjectCommand(params);
    return await awsGetSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw error;
  }
};

// Delete a file from S3
export const deleteFile = async (key) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    const command = new DeleteObjectCommand(params);
    return await s3Client.send(command);
  } catch (error) {
    throw error;
  }
};

// Move (rename) a file within the same bucket by copying it to the new key and deleting the original
export const moveFile = async (sourceKey, destinationKey) => {
  try {
    // Copy the object to the new location
    const copyParams = {
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destinationKey,
      ACL: 'private'
    };

    const copyCommand = new CopyObjectCommand(copyParams);
    await s3Client.send(copyCommand);

    // Delete the original object after successful copy
    await deleteFile(sourceKey);

    return true;
  } catch (error) {
    throw error;
  }
};

export default {
  uploadMiddleware,
  listFiles,
  getSignedUrl,
  deleteFile,
  moveFile
}; 