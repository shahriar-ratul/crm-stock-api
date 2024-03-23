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

import { SourceService } from './source.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Source } from '@prisma/client';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';

@ApiTags('sources')
@Controller({
  version: '1',
  path: 'sources',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class SourceController {
  constructor(private readonly _sourceService: SourceService) { }

  @Get()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Source>> {
    return await this._sourceService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.create'])
  create(@Body() createDto: CreateCategoryDto) {
    return this._sourceService.create(createDto);
  }


  @Get(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findOne(@Param('id') id: number) {
    return this._sourceService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.update'])
  async update(@Param('id') id: number, @Body() updateDto: UpdateCategoryDto) {
    return this._sourceService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.delete'])
  async remove(@Param('id') id: number) {
    return this._sourceService.remove(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.active'])
  async changeStatus(@Param('id') id: number) {
    return this._sourceService.changeStatus(+id);
  }
}
