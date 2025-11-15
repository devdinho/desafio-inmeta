import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class ResponseUserDto {
  @Expose()
  @IsNotEmpty()
  @IsEmail(
    {},
    { message: 'Invalid email format, please provide a valid email address' },
  )
  email: string;

  @Expose()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @IsAlphanumeric('pt-BR', {
    message: 'Username must contain only letters and numbers',
  })
  username: string;
}
