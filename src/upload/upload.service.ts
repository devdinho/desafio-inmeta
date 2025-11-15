import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY as string,
      secretAccessKey: process.env.MINIO_SECRET_KEY as string,
    },
  });

  async uploadToMinio(file: Express.Multer.File) {
    const bucket = process.env.MINIO_BUCKET as string;
    const key = `uploads/${Date.now()}-${file.originalname}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        ok: true,
        key,
        url: `${process.env.MINIO_PUBLIC_URL}/${bucket}/${key}`,
      };
    } catch (error: any) {
      if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
        throw new InternalServerErrorException(
          'Upload failed: Access denied to storage. Please check MinIO credentials and bucket permissions.'
        );
      }
      
      throw new InternalServerErrorException(
        `Upload failed: ${error.message || 'Unknown error'}`
      );
    }
  }
}
