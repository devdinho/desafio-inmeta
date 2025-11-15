import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty({
    example: 'Jane Doe',
    description: 'Full name of the employee',
  })
  name?: string;

  @ApiProperty({
    type: UpdateUserDto,
    example: {
      email: 'jane.doe@example.com',
      username: 'janedoe',
      password: 'newSecurePassword123',
    },
    description: 'User data for the associated user',
  })
  user: UpdateUserDto;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Hire date of the employee in YYYY-MM-DD format',
  })
  hiredAt?: Date;
}
