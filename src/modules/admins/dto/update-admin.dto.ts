import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
export class UpdateAdminDto {
  @ApiProperty({
    type: 'string',
    example: 'admin@admin.com',
    description: 'admin email',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    type: 'string',
    example: '123456',
    description: 'admin password',
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @ApiProperty({
    type: 'string',
    example: 'phone',
    description: 'admin phone',
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(255)
  phone: string;

  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin username',
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin name',
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'true',
    description: 'admin isActive',
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    type: 'array',
    example: 'roles',
    description: 'admin roles',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  roles: number[];
}
