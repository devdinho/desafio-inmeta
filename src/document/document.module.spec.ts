import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DocumentRequestController,
  DocumentTypeController,
} from './document.controller';
import { UploadService } from '../upload/upload.service';
import {
  DocumentRequestService,
  DocumentTypeService,
} from './document.service';
import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from '../employee/entities/employee.entity';

describe('DocumentModule (shallow)', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [DocumentRequestController, DocumentTypeController],
      providers: [
        DocumentRequestService,
        DocumentTypeService,
          { provide: UploadService, useValue: { uploadToMinio: jest.fn().mockResolvedValue({ url: 'http://x' }) } },
        { provide: getRepositoryToken(DocumentRequest), useValue: {} },
        { provide: getRepositoryToken(DocumentType), useValue: {} },
        { provide: getRepositoryToken(Employee), useValue: {} },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
