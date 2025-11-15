import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

import { Expose } from 'class-transformer';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;
export class UpdateUserDto {
  @Expose()
  id: number;

  @IsNotEmpty()
  @IsEmail(
    {},
    { message: 'Invalid email format, please provide a valid email address' },
  )
  @Expose()
  email: string;

  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @IsAlphanumeric('pt-BR', {
    message: 'Username must contain only letters and numbers',
  })
  @Expose()
  username: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(passwordRegEx, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @Expose()
  password: string;
}
