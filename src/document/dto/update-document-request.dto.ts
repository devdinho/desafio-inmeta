import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateDocumentRequestDto } from './create-document-request.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Employee } from '../../employee/entities/employee.entity';
export class UpdateDocumentRequestDto extends PartialType(
  CreateDocumentRequestDto,
) {
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Approval status' })
  approved?: boolean;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID of the employee who approved' })
  approvedBy?: Employee;

  @IsString()
  @ApiProperty({
    example: '2024-04-27T12:34:56Z',
    description: 'Approval date and time',
  })
  approvedAt?: string;

  @IsString()
  @ApiProperty({
    example: 'http://example.com/document.pdf',
    description: 'URL of the document',
  })
  documentUrl?: string;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID of the employee who uploaded' })
  uploadedBy?: Employee;

  @IsString()
  @ApiProperty({
    example: '2024-04-27T12:34:56Z',
    description: 'Upload date and time',
  })
  uploadedAt?: string;
}
