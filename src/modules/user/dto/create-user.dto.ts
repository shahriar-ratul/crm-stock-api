import { $Enums } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {

    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    MinLength,

} from 'class-validator';

export class CreateUserDto {

    @ApiProperty({
        type: 'string',
        example: 'user',
        description: 'user firstName',
    })
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    firstName: string;

    @ApiProperty({
        type: 'string',
        example: 'user',
        description: 'user lastName',
    })
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    lastName: string;


    @ApiProperty({
        type: 'string',
        example: 'user@user.com',
        description: 'user email',
    })
    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        type: 'string',
        example: '123456',
        description: 'user password',
    })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(255)
    password: string;

    @ApiProperty({
        type: 'string',
        example: 'phone',
        description: 'user phone',
    })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(255)
    phone: string;

    @ApiProperty({
        type: 'string',
        example: 'user',
        description: 'user username',
    })
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    username: string;


    @ApiPropertyOptional({
        type: 'string',
        example: 'telegramName',
        description: 'telegramName',
    })
    @IsOptional()
    telegramName?: string;


    // dob
    @Type(() => Date)
    @ApiProperty({
        type: 'string',
        example: '2021-08-01',
        description: "user dob"
    })
    @Transform(({ value }) => new Date(value))
    @IsNotEmpty()
    @IsDate()
    dob: Date;

    @ApiProperty({
        type: 'string',
        example: 'addressLine1',
        description: 'user addressLine1',
    })
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(255)
    addressLine1: string;

    @ApiProperty({
        type: 'string',
        example: 'addressLine2',
        description: 'user addressLine2',
    })
    @IsOptional()
    @MaxLength(255)
    addressLine2: string;


    @ApiProperty({
        type: 'string',
        example: 'city',
        description: 'user city',
    })
    @IsNotEmpty()
    @MaxLength(255)
    city: string;

    @ApiProperty({
        type: 'string',
        example: 'state',
        description: 'user state',
    })
    @IsNotEmpty()
    @MaxLength(255)
    state: string;

    @ApiProperty({
        type: 'string',
        example: 'nationality',
        description: 'user nationality',
    })
    @IsNotEmpty()
    @MaxLength(255)
    nationality: string;



    @ApiProperty({
        type: 'string',
        example: 'zip',
        description: 'user zip',
    })
    @IsNotEmpty()
    @MaxLength(255)
    zipCode: string;


    // eslint-disable-next-line @darraghor/nestjs-typed/all-properties-have-explicit-defined
    @ApiProperty({
        enum: $Enums.DocumentUploadType,
        example: $Enums.DocumentUploadType.PASSPORT,
        description: 'user documentType',
    })
    @IsEnum($Enums.DocumentUploadType, { message: 'documentType must be a valid enum value' })
    @IsNotEmpty()
    @MaxLength(255)
    readonly documentType: $Enums.DocumentUploadType;


}
