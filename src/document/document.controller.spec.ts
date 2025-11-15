import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentRequestController } from './document.controller';
import { UploadService } from '../upload/upload.service';
import { DocumentRequestService } from './document.service';
import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from '../employee/entities/employee.entity';

describe('DocumentRequestController', () => {
  let controller: DocumentRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentRequestController],
      providers: [
        DocumentRequestService,
        { provide: UploadService, useValue: { uploadToMinio: jest.fn().mockResolvedValue({ url: 'http://x' }) } },
        { provide: getRepositoryToken(DocumentRequest), useValue: {} },
        { provide: getRepositoryToken(DocumentType), useValue: {} },
        { provide: getRepositoryToken(Employee), useValue: {} },
      ],
    }).compile();

    controller = module.get<DocumentRequestController>(
      DocumentRequestController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
