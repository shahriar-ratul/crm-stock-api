import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    type: 'string',
    example: 'category name',
    description: 'The name of the category',
  })
  @IsNotEmpty()
  name: string;

}
