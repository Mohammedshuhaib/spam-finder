import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'dev@gmail.com',
    description: 'email of user and its optional',
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'dev',
    description: 'name of user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '+918137947670',
    description: 'phone number of user',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: 'dev@123',
    description: 'Secret password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    example: '+918137947670',
    description: 'Phone number of user',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: 'dev@123',
    description: 'Secret password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateContactDto {
  @ApiProperty({
    example: 'dev@gmail.com',
    description: 'email of user and its optional',
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'dev',
    description: 'name of user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '+918137947670',
    description: 'phone number of user',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;
}

export class UpdateContactDto {
  @ApiProperty({
    example: true,
    description: 'Describe the number is spam or not',
  })
  @IsBoolean()
  @IsNotEmpty()
  is_spam: boolean;
}
