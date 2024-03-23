import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  // email
  @ApiProperty({
    type: 'string',
    example: 'admin@admin.com',
    description: 'admin email',
  })
  @IsEmail()
  @MaxLength(100)
  @IsNotEmpty()
  email: string;

  // password
  @ApiProperty({
    type: 'string',
    example: '123456',
    description: 'admin password',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  // contactNo
  @ApiProperty({
    type: 'string',
    example: 'phone',
    description: 'admin contactNo',
  })
  @IsNotEmpty()
  contactNo: string;


  // username
  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin username',
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  // fullName
  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin fullName',
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  fullName: string;


  @ApiProperty({
    type: 'string',
    example: 'true',
    description: 'admin isActive',
  })
  @IsNotEmpty()
  // @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : false))
  isActive: boolean;

  @ApiProperty({
    type: 'array',
    example: 'roles',
    description: 'admin roles',
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least 1 role is required',
  })
  @Transform(({ value }) => (value ? JSON.parse(value) : []))
  roles: number[];


  // dob
  @ApiProperty({
    type: 'string',
    example: '2022-12-12',
    description: 'admin dob',
  })
  @Transform(({ value }) => (value ? JSON.parse(value) : null))
  @IsOptional()
  dob: Date;

  // joining date
  @ApiProperty({
    type: 'string',
    example: '2022-12-12',
    description: 'admin joining date',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? JSON.parse(value) : null))
  joinedDate: Date;

  // referrerId
  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'admin referrerId',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? JSON.parse(value) : null))
  referrerId: number;

  // relationship
  @ApiProperty({
    type: 'string',
    example: 'relationship',
    description: 'admin relationship',
  })
  @IsOptional()
  relationship: string;


  // country
  @ApiProperty({
    type: 'string',
    example: 'country',
    description: 'admin country',
  })
  @IsOptional()
  country: string;


  // city
  @ApiProperty({
    type: 'string',
    example: 'city',
    description: 'admin city',
  })
  @IsOptional()
  city: string;


  // address
  @ApiProperty({
    type: 'string',
    example: 'address',
    description: 'admin address',
  })
  @IsOptional()
  address: string;


  // postcode
  @ApiProperty({
    type: 'string',
    example: 'postcode',
    description: 'admin postcode',
  })
  @IsOptional()
  @IsNotEmpty()
  postCode: string;




  // platform json
  @ApiProperty({
    type: 'array',
    example: 'platform',
    description: 'admin platform json',
    isArray: true,
  })
  @IsOptional()
  platforms: Prisma.JsonArray;

}


