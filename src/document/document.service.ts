import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { CreateDocumentRequestDto } from './dto/create-document-request.dto';
import { UpdateDocumentRequestDto } from './dto/update-document-request.dto';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class DocumentRequestService {
  @InjectRepository(DocumentRequest)
  private readonly documentRequestRepository: Repository<DocumentRequest>;

  @InjectRepository(Employee)
  private readonly employeeRepository: Repository<Employee>;

  async create(
    createDocumentRequestDto: CreateDocumentRequestDto,
  ): Promise<DocumentRequest> {
    const documentRequest: DocumentRequest = new DocumentRequest();
    documentRequest.employee = createDocumentRequestDto.employee;
    documentRequest.documentType = createDocumentRequestDto.documentType;

    return await this.documentRequestRepository.save(documentRequest);
  }

  findAll(): Promise<DocumentRequest[]> {
    return this.documentRequestRepository.find();
  }

  async findOne(id: number): Promise<DocumentRequest | null> {
    const documentRequest = await this.documentRequestRepository.findOneBy({
      id,
    });
    if (!documentRequest) throw new Error('Document Request not found');
    return documentRequest;
  }

  async update(
    id: number,
    updateDocumentRequestDto: UpdateDocumentRequestDto,
  ): Promise<DocumentRequest> {
    const documentRequest = await this.documentRequestRepository.findOneBy({
      id,
    });
    if (!documentRequest) throw new Error('Document Request not found');
    documentRequest.approved =
      updateDocumentRequestDto.approved ?? documentRequest.approved;

    documentRequest.approvedBy =
      updateDocumentRequestDto.approvedBy ?? documentRequest.approvedBy;

    if (updateDocumentRequestDto.approved && !documentRequest.approvedAt) {
      documentRequest.approvedAt = new Date();
    }
    
    documentRequest.documentUrl =
      updateDocumentRequestDto.documentUrl ?? documentRequest.documentUrl;

    return await this.documentRequestRepository.save(documentRequest);
  }

  async remove(id: number): Promise<DeleteResult> {
    const documentRequest = await this.documentRequestRepository.findOneBy({
      id,
    });
    if (!documentRequest) throw new Error('Document Request not found');
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
    if (!documentType) throw new Error('Document Type not found');
    return documentType;
  }

  async updateType(
    id: number,
    updateDocumentTypeDto: UpdateDocumentTypeDto,
  ): Promise<DocumentType> {
    const documentType = await this.documentTypeRepository.findOneBy({ id });
    if (!documentType) throw new Error('Document Type not found');
    documentType.name = updateDocumentTypeDto.name ?? documentType.name;
    documentType.description =
      updateDocumentTypeDto.description ?? documentType.description;
    return await this.documentTypeRepository.save(documentType);
  }

  async removeType(id: number): Promise<DeleteResult> {
    const documentType = await this.documentTypeRepository.findOneBy({ id });
    if (!documentType) throw new Error('Document Type not found');
    documentType.id = id;
    return await this.documentTypeRepository.delete(documentType.id);
  }
}
