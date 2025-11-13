import { PartialType } from '@nestjs/swagger';
import { CreateDocumentRequestDto } from './create-document-request.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Employee } from '../../employee/entities/employee.entity';
export class UpdateDocumentRequestDto extends PartialType(
  CreateDocumentRequestDto,
) {
  @IsBoolean()
  approved?: boolean;

  @IsNumber()
  approvedBy?: Employee;

  @IsString()
  approvedAt?: Date;

  @IsString()
  documentUrl?: string;
}
