import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { DocumentType } from '../entities/document-type.entity';
import { Employee } from '../../employee/entities/employee.entity';
export class CreateDocumentRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Employee ID' })
  employee: Employee;

  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Document Type ID' })
  documentType: DocumentType | DocumentType[];
}
