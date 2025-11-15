import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  DocumentRequestService,
  DocumentTypeService,
} from './document.service';
import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from '../employee/entities/employee.entity';

describe('DocumentRequestService (unit)', () => {
  let service: DocumentRequestService;
  let mockDocReqRepo: any;
  let mockDocTypeRepo: any;
  let mockEmployeeRepo: any;

  beforeEach(async () => {
    mockDocReqRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    mockDocTypeRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    mockEmployeeRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRequestService,
        { provide: getRepositoryToken(DocumentRequest), useValue: mockDocReqRepo },
        { provide: getRepositoryToken(DocumentType), useValue: mockDocTypeRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
      ],
    }).compile();

    service = module.get<DocumentRequestService>(DocumentRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a document request when employee and type exist', async () => {
      const employee = { id: 1, name: 'E' } as any;
      const docType = { id: 2, name: 'T' } as any;

      mockEmployeeRepo.findOne = jest.fn().mockResolvedValue(employee);
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue(docType);
      mockDocReqRepo.findOne = jest.fn().mockResolvedValue(null);
      mockDocReqRepo.save = jest.fn().mockResolvedValue({ id: 5, employee, documentType: docType });

      const dto = { employee: 1, documentType: 2 } as any;
      const res = await service.create(dto);

      expect(mockEmployeeRepo.findOne).toHaveBeenCalled();
      expect(mockDocTypeRepo.findOne).toHaveBeenCalled();
      expect(mockDocReqRepo.save).toHaveBeenCalled();
      expect(Array.isArray(res)).toBe(true);
    });

    it('throws NotFoundException when employee missing', async () => {
      mockEmployeeRepo.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.create({ employee: 99, documentType: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when document type missing', async () => {
      mockEmployeeRepo.findOne = jest.fn().mockResolvedValue({ id: 1, name: 'E' });
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.create({ employee: 1, documentType: 999 } as any)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when request already exists', async () => {
      const employee = { id: 1, name: 'E' } as any;
      mockEmployeeRepo.findOne = jest.fn().mockResolvedValue(employee);
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue({ id: 2, name: 'T' });
      mockDocReqRepo.findOne = jest.fn().mockResolvedValue({ id: 10, documentType: { name: 'T' } });

      await expect(service.create({ employee: 1, documentType: 2 } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns all requests', async () => {
      const items = [{ id: 1 }];
      mockDocReqRepo.find = jest.fn().mockResolvedValue(items);
      const res = await service.findAll();
      expect(res).toBe(items);
      expect(mockDocReqRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne / update / remove', () => {
    it('findOne returns item when exists', async () => {
      const item = { id: 3 };
      mockDocReqRepo.findOneBy = jest.fn().mockResolvedValue(item);
      const res = await service.findOne(3);
      expect(res).toEqual(item);
    });

    it('findOne throws when missing', async () => {
      mockDocReqRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.findOne(9)).rejects.toThrow(Error);
    });

    it('update saves changes when exists', async () => {
      const existing = { id: 4, approved: false } as any;
      mockDocReqRepo.findOneBy = jest.fn().mockResolvedValue(existing);
      mockDocReqRepo.save = jest.fn().mockResolvedValue({ ...existing, approved: true });

      const res = await service.update(4, { approved: true } as any);
      expect(mockDocReqRepo.findOneBy).toHaveBeenCalledWith({ id: 4 });
      expect(mockDocReqRepo.save).toHaveBeenCalled();
      expect(res.approved).toBe(true);
    });

    it('update throws when missing', async () => {
      mockDocReqRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.update(7, { approved: true } as any)).rejects.toThrow(Error);
    });

    it('remove deletes when exists', async () => {
      mockDocReqRepo.findOneBy = jest.fn().mockResolvedValue({ id: 8 } as any);
      mockDocReqRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });
      const res = await service.remove(8);
      expect(mockDocReqRepo.findOneBy).toHaveBeenCalledWith({ id: 8 });
      expect(mockDocReqRepo.delete).toHaveBeenCalledWith(8);
      expect(res).toHaveProperty('affected');
    });

    it('remove throws when missing', async () => {
      mockDocReqRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.remove(11)).rejects.toThrow(Error);
    });
  });
});

describe('DocumentTypeService (unit)', () => {
  let service: DocumentTypeService;
  let mockDocTypeRepo: any;

  beforeEach(async () => {
    mockDocTypeRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTypeService,
        { provide: getRepositoryToken(DocumentType), useValue: mockDocTypeRepo },
      ],
    }).compile();

    service = module.get<DocumentTypeService>(DocumentTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createType', () => {
    it('creates when name is unique', async () => {
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue(null);
      mockDocTypeRepo.create = jest.fn().mockReturnValue({ name: 'X' });
      mockDocTypeRepo.save = jest.fn().mockResolvedValue({ id: 2, name: 'X' });

      const res = await service.createType({ name: 'X' } as any);
      expect(mockDocTypeRepo.findOne).toHaveBeenCalled();
      expect(mockDocTypeRepo.save).toHaveBeenCalled();
      expect(res).toHaveProperty('id', 2);
    });

    it('throws ConflictException when name exists', async () => {
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue({ id: 1, name: 'X' });
      await expect(service.createType({ name: 'X' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllTypes / findOneType / updateType', () => {
    it('findAllTypes returns array', async () => {
      const arr = [{ id: 1 }];
      mockDocTypeRepo.find = jest.fn().mockResolvedValue(arr);
      const res = await service.findAllTypes();
      expect(res).toBe(arr);
    });

    it('findOneType returns when found', async () => {
      mockDocTypeRepo.findOneBy = jest.fn().mockResolvedValue({ id: 5 });
      const res = await service.findOneType(5);
      expect(res).toEqual({ id: 5 });
    });

    it('findOneType throws when missing', async () => {
      mockDocTypeRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.findOneType(9)).rejects.toThrow(Error);
    });

    it('updateType saves changes', async () => {
      const existing = { id: 6, name: 'A', description: null } as any;
      mockDocTypeRepo.findOneBy = jest.fn().mockResolvedValue(existing);
      mockDocTypeRepo.save = jest.fn().mockResolvedValue({ ...existing, name: 'B' });
      const res = await service.updateType(6, { name: 'B' } as any);
      expect(mockDocTypeRepo.save).toHaveBeenCalled();
      expect(res.name).toBe('B');
    });

    it('updateType throws when missing', async () => {
      mockDocTypeRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.updateType(7, { name: 'Z' } as any)).rejects.toThrow(Error);
    });
  });

  describe('removeType', () => {
    it('deletes when exists', async () => {
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue({ id: 3 });
      mockDocTypeRepo.delete = jest.fn().mockResolvedValue(undefined);
      const res = await service.removeType(3);
      expect(mockDocTypeRepo.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(res).toHaveProperty('status', 204);
    });

    it("throws ConflictException when FK error (code 23503)", async () => {
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue({ id: 4 });
      mockDocTypeRepo.delete = jest.fn().mockRejectedValue({ code: '23503' });
      await expect(service.removeType(4)).rejects.toThrow(ConflictException);
    });

    it('throws InternalServerErrorException for other errors', async () => {
      mockDocTypeRepo.findOne = jest.fn().mockResolvedValue({ id: 7 });
      mockDocTypeRepo.delete = jest.fn().mockRejectedValue(new Error('boom'));
      await expect(service.removeType(7)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
