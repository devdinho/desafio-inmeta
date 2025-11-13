import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'HiredAt must be a valid date in the format YYYY-MM-DD',
  })
  hiredAt: Date;
}
