import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  // SetMetadata,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';

import { CategoryService } from './category.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Category } from '@prisma/client';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';

@ApiTags('categories')
@Controller({
  version: '1',
  path: 'categories',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) { }

  @Get()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Category>> {
    return await this._categoryService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.create'])
  create(@Body() createDto: CreateCategoryDto) {
    return this._categoryService.create(createDto);
  }

  @Get(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findOne(@Param('id') id: number) {
    return this._categoryService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.update'])
  async update(@Param('id') id: number, @Body() updateDto: UpdateCategoryDto) {
    return this._categoryService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.delete'])
  async remove(@Param('id') id: number) {
    return this._categoryService.remove(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.active'])
  async changeStatus(@Param('id') id: number) {
    return this._categoryService.changeStatus(+id);
  }
}
