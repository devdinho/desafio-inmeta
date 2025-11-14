import { IsNotEmpty, IsString, Matches, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUserDto } from '../../user/dto/response-user.dto';

export class ResponseEmployeeDto {

  @Expose()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the employee',
    minLength: 3,
  })
  name: string;

  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ResponseUserDto)
  @ApiProperty({
    type: ResponseUserDto,
    example: {
      email: 'john.doe@example.com',
      password: 'securePassword123',
      username: 'johndoe',
    },
    description: 'User data for the associated user',
  })
  user: ResponseUserDto;

  @Expose()
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
