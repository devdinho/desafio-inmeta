import { Module } from '@nestjs/common';
import {
  DocumentRequestService,
  DocumentTypeService,
} from './document.service';
import {
  DocumentRequestController,
  DocumentTypeController,
} from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentRequest, DocumentType, Employee]),
  ],
  controllers: [DocumentRequestController, DocumentTypeController],
  providers: [DocumentRequestService, DocumentTypeService],
})
export class DocumentModule {}
