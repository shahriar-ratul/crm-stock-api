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

import { PlatformService } from './platform.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Source } from '@prisma/client';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';

@ApiTags('platforms')
@Controller({
  version: '1',
  path: 'platforms',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class PlatformController {
  constructor(private readonly _platformService: PlatformService) { }

  @Get()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Source>> {
    return await this._platformService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.create'])
  create(@Body() createDto: CreateCategoryDto) {
    return this._platformService.create(createDto);
  }


  @Get(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findOne(@Param('id') id: number) {
    return this._platformService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.update'])
  async update(@Param('id') id: number, @Body() updateDto: UpdateCategoryDto) {
    return this._platformService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.delete'])
  async remove(@Param('id') id: number) {
    return this._platformService.remove(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.active'])
  async changeStatus(@Param('id') id: number) {
    return this._platformService.changeStatus(+id);
  }
}
