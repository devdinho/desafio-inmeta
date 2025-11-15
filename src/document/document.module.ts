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
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';

import { DocumentRequest } from './entities/document-request.entity';
import { DocumentType } from './entities/document-type.entity';
import { Employee } from '../employee/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentRequest, DocumentType, Employee]),
    UploadModule,
    AuthModule,
  ],
  controllers: [DocumentRequestController, DocumentTypeController],
  providers: [DocumentRequestService, DocumentTypeService],
  exports: [DocumentRequestService, DocumentTypeService],
})
export class DocumentModule {}
