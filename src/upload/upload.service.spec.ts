import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UploadService } from './upload.service';

// Mock AWS S3 SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
}));

describe('UploadService', () => {
  let service: UploadService;
  let mockS3Send: jest.Mock;

  beforeEach(async () => {
    const { S3Client } = require('@aws-sdk/client-s3');
    mockS3Send = jest.fn();
    
    S3Client.mockImplementation(() => ({
      send: mockS3Send,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadToMinio', () => {
    it('successfully uploads a file', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      mockS3Send.mockResolvedValue({});

      const result = await service.uploadToMinio(mockFile);

      expect(result.ok).toBe(true);
      expect(result.key).toContain('uploads/');
      expect(result.key).toContain('test.pdf');
      expect(result.url).toContain(result.key);
      expect(mockS3Send).toHaveBeenCalledTimes(1);
    });

    it('generates unique keys based on timestamp', async () => {
      const mockFile = {
        originalname: 'document.pdf',
        buffer: Buffer.from('content'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      mockS3Send.mockResolvedValue({});

      const result1 = await service.uploadToMinio(mockFile);
      
      // Wait a tiny bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result2 = await service.uploadToMinio(mockFile);

      expect(result1.key).not.toBe(result2.key);
    });

    it('throws InternalServerErrorException on AccessDenied error', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const accessDeniedError = new Error('Access Denied');
      (accessDeniedError as any).name = 'AccessDenied';
      (accessDeniedError as any).$metadata = { httpStatusCode: 403 };

      mockS3Send.mockRejectedValue(accessDeniedError);

      await expect(service.uploadToMinio(mockFile)).rejects.toThrow(InternalServerErrorException);
      await expect(service.uploadToMinio(mockFile)).rejects.toThrow(
        'Upload failed: Access denied to storage. Please check MinIO credentials and bucket permissions.'
      );
    });

    it('throws InternalServerErrorException on 403 status code', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const error = new Error('Forbidden');
      (error as any).$metadata = { httpStatusCode: 403 };

      mockS3Send.mockRejectedValue(error);

      await expect(service.uploadToMinio(mockFile)).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException on generic errors', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      mockS3Send.mockRejectedValue(new Error('Network error'));

      await expect(service.uploadToMinio(mockFile)).rejects.toThrow(InternalServerErrorException);
      await expect(service.uploadToMinio(mockFile)).rejects.toThrow('Upload failed: Network error');
    });

    it('handles file with special characters in name', async () => {
      const mockFile = {
        originalname: 'My Document (2024) - Final.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      mockS3Send.mockResolvedValue({});

      const result = await service.uploadToMinio(mockFile);

      expect(result.key).toContain('My Document (2024) - Final.pdf');
      expect(result.ok).toBe(true);
    });
  });
});
