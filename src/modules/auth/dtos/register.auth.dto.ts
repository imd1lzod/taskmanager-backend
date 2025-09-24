import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    type: 'string',
    example: 'Lionel Messi',
    description: 'user fullName',
    required: false,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'example@yahoo.com',
    description: 'user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    example: '1234',
    description: 'user password',
  })
  @IsString()
  @MinLength(4)
  password: string;
  @ApiProperty({ enum: Role, example: Role.User, description: 'User role' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    type: 'string',
    example: '',
    description: 'user email',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
