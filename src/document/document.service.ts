import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { CreateDocumentRequestDto } from './dto/create-document-request.dto';
import { UpdateDocumentRequestDto } from './dto/update-document-request.dto';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class DocumentRequestService {
  @InjectRepository(DocumentRequest)
  private readonly documentRequestRepository: Repository<DocumentRequest>;

  @InjectRepository(DocumentType)
  private readonly documentTypeRepository: Repository<DocumentType>;

  @InjectRepository(Employee)
  private readonly employeeRepository: Repository<Employee>;

  async create(
    createDocumentRequestDto: CreateDocumentRequestDto,
  ): Promise<DocumentRequest[]> {
    const { employee, documentType } = createDocumentRequestDto;

    const employeeId = typeof employee === 'object' ? employee.id : employee;

    const employeeEntity = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employeeEntity) {
      throw new NotFoundException('Employee not found');
    }

    const documentTypeIds = Array.isArray(documentType)
      ? documentType.map((dt) => (typeof dt === 'object' ? dt.id : dt))
      : [typeof documentType === 'object' ? documentType.id : documentType];

    const createdRequests: DocumentRequest[] = [];

    for (const typeId of documentTypeIds) {
      const docType = await this.documentTypeRepository.findOne({
        where: { id: typeId },
      });

      if (!docType) {
        throw new NotFoundException(`DocumentType ${typeId} not found`);
      }

      const exists = await this.documentRequestRepository.findOne({
        where: {
          employee: { id: employeeId },
          documentType: { id: typeId },
        },
      });

      if (exists) {
        throw new ConflictException(
          `A document request for employee ${employeeEntity.name} and document type ${exists.documentType.name} already exists.`,
        );
      }

      const request = new DocumentRequest();
      request.employee = employeeEntity;
      request.documentType = docType;

      const saved = await this.documentRequestRepository.save(request);
      createdRequests.push(saved);
    }

    return createdRequests;
  }

  findAll(): Promise<DocumentRequest[]> {
    return this.documentRequestRepository.find();
  }

  async findOne(id: number): Promise<DocumentRequest | null> {
    const documentRequest = await this.documentRequestRepository.findOneBy({
      id,
    });
    if (!documentRequest) throw new NotFoundException('Document Request not found');
    return documentRequest;
  }

  async update(
    id: number,
    updateDocumentRequestDto: UpdateDocumentRequestDto,
  ): Promise<DocumentRequest> {
    const documentRequest = await this.documentRequestRepository.findOneBy({
      id,
    });
    if (!documentRequest) throw new NotFoundException('Document Request not found');
    documentRequest.approved =
      updateDocumentRequestDto.approved ?? documentRequest.approved;

    documentRequest.approvedBy =
      updateDocumentRequestDto.approvedBy ?? documentRequest.approvedBy;

    if (updateDocumentRequestDto.approved && !documentRequest.approvedAt) {
      documentRequest.approvedAt = new Date();
    }

    documentRequest.documentUrl =
      updateDocumentRequestDto.documentUrl ?? documentRequest.documentUrl;

    if ('uploadedBy' in updateDocumentRequestDto && updateDocumentRequestDto.uploadedBy) {
      documentRequest.uploadedBy = updateDocumentRequestDto.uploadedBy as any;
    }

    if (
      'uploadedAt' in updateDocumentRequestDto &&
      typeof updateDocumentRequestDto.uploadedAt === 'string'
    ) {
      documentRequest.uploadedAt = new Date(updateDocumentRequestDto.uploadedAt);
    }

    return await this.documentRequestRepository.save(documentRequest);
  }

  async remove(id: number): Promise<DeleteResult> {
    const documentRequest = await this.documentRequestRepository.findOneBy({
      id,
    });
    if (!documentRequest) throw new NotFoundException('Document Request not found');
    documentRequest.id = id;
    return await this.documentRequestRepository.delete(documentRequest.id);
  }
}

@Injectable()
export class DocumentTypeService {
  @InjectRepository(DocumentType)
  private readonly documentTypeRepository: Repository<DocumentType>;

  async createType(
    createDocumentTypeDto: CreateDocumentTypeDto,
  ): Promise<DocumentType> {
    const existingType = await this.documentTypeRepository.findOne({
      where: { name: createDocumentTypeDto.name },
    });
    if (existingType) {
      throw new ConflictException(
        'A document type with this name already exists.',
      );
    }

    const documentType = this.documentTypeRepository.create({
      name: createDocumentTypeDto.name,
      description: createDocumentTypeDto.description ?? null,
    });

    return await this.documentTypeRepository.save(documentType);
  }

  findAllTypes(): Promise<DocumentType[]> {
    return this.documentTypeRepository.find();
  }

  async findOneType(id: number): Promise<DocumentType | null> {
    const documentType = await this.documentTypeRepository.findOneBy({ id });
    if (!documentType) throw new NotFoundException('Document Type not found');
    return documentType;
  }

  async updateType(
    id: number,
    updateDocumentTypeDto: UpdateDocumentTypeDto,
  ): Promise<DocumentType> {
    const documentType = await this.documentTypeRepository.findOneBy({ id });
    if (!documentType) throw new NotFoundException('Document Type not found');
    documentType.name = updateDocumentTypeDto.name ?? documentType.name;
    documentType.description =
      updateDocumentTypeDto.description ?? documentType.description;
    return await this.documentTypeRepository.save(documentType);
  }

  async removeType(id: number) {
    const documentType = await this.documentTypeRepository.findOne({
      where: { id },
    });

    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    try {
      await this.documentTypeRepository.delete(id);

      return {
        detail: 'Document Type deleted successfully',
        status: 204,
      };
    } catch (error: unknown) {
      const err = error as { code?: string } | null;
      if (err && err.code === '23503') {
        throw new ConflictException(
          "Can't delete: there are requests linked to this document type.",
        );
      }
      throw new InternalServerErrorException('Error deleting document type.');
    }
  }
}
