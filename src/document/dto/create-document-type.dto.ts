import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
