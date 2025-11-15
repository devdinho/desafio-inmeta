import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the employee',
    minLength: 3,
  })
  name: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  @ApiProperty({
    type: CreateUserDto,
    example: {
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'securePassword123',
    },
    description: 'User data for the associated user',
  })
  user: CreateUserDto;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'HiredAt must be a valid date in the format YYYY-MM-DD',
  })
  @ApiProperty({
    example: '2023-01-01',
    description: 'Hire date in YYYY-MM-DD format',
  })
  hiredAt: Date;
}
