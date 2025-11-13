import { IsNotEmpty, IsNumber } from 'class-validator';

import { DocumentType } from '../entities/document-type.entity';
import { Employee } from '../../employee/entities/employee.entity';
export class CreateDocumentRequestDto {
  @IsNumber()
  @IsNotEmpty()
  employee: Employee;

  @IsNotEmpty()
  documentType: DocumentType;
}
