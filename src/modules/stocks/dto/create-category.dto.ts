import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: 'string',
    example: 'Category name',
    description: 'The name of the Category',
  })
  @IsNotEmpty()
  name: string;

}
