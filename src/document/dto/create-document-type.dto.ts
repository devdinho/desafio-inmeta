import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'CNH', description: 'Name of the document type' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Carteira Nacional de Habilitação', description: 'Description of the document type' })
  description: string;
}
