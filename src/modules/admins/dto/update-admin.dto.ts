
import { ApiProperty } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
export class UpdateAdminDto extends CreateAdminDto {


    // password
    @ApiProperty({
        type: 'string',
        example: '123456',
        description: 'admin password',
    })
    // @IsNotEmpty()
    @IsOptional()
    @MinLength(6)
    @MaxLength(255)
    password: string;
}
