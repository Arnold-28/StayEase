// AWS S3 File Upload Service
import AWS from 'aws-sdk';
import { config } from '../utils/config.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

export interface UploadSignedUrlParams {
  key: string;
  contentType: string;
  expiresIn?: number;
}

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
}

export const uploadPropertyImage = async (
  file: UploadedFile,
  propertyId: string
): Promise<{ url: string; key: string }> => {
  const fileKey = `${config.aws.s3.prefix}${propertyId}/${uuidv4()}`;

  const params = {
    Bucket: config.aws.s3.bucket,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const,
    Metadata: {
      'property-id': propertyId,
      'uploaded-at': new Date().toISOString(),
    },
  };

  try {
    const result = await s3.upload(params).promise();
    logger.info(`File uploaded: ${fileKey}`);
    return {
      url: result.Location,
      key: fileKey,
    };
  } catch (error) {
    logger.error(`S3 upload failed: ${error}`);
    throw new Error('File upload failed');
  }
};

export const getSignedUrl = async (params: UploadSignedUrlParams): Promise<string> => {
  try {
    const signedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: config.aws.s3.bucket,
      Key: params.key,
      ContentType: params.contentType,
      Expires: params.expiresIn || 3600,
    });
    return signedUrl;
  } catch (error) {
    logger.error(`Failed to generate signed URL: ${error}`);
    throw new Error('Failed to generate upload URL');
  }
};

export const deleteFile = async (key: string): Promise<void> => {
  try {
    await s3.deleteObject({
      Bucket: config.aws.s3.bucket,
      Key: key,
    }).promise();
    logger.info(`File deleted: ${key}`);
  } catch (error) {
    logger.error(`S3 delete failed: ${error}`);
    throw new Error('File deletion failed');
  }
};

export const generateBulkDeleteParams = (keys: string[]) => {
  return {
    Bucket: config.aws.s3.bucket,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  };
};

export const bulkDeleteFiles = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;

  try {
    const params = generateBulkDeleteParams(keys);
    await s3.deleteObjects(params as any).promise();
    logger.info(`Bulk deleted ${keys.length} files`);
  } catch (error) {
    logger.error(`S3 bulk delete failed: ${error}`);
    throw new Error('Bulk deletion failed');
  }
};
