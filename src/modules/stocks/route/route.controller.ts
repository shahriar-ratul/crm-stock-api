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

import { RouteService } from './route.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';

@ApiTags('routes')
@Controller({
  version: '1',
  path: 'routes',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class RouteController {
  constructor(private readonly _routeService: RouteService) { }

  @Get()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Role>> {
    return await this._routeService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.create'])
  create(@Body() createDto: CreateCategoryDto) {
    return this._routeService.create(createDto);
  }


  @Get(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.view'])
  async findOne(@Param('id') id: number) {
    return this._routeService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.update'])
  async update(@Param('id') id: number, @Body() updateDto: UpdateCategoryDto) {
    return this._routeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.delete'])
  async remove(@Param('id') id: number) {
    return this._routeService.remove(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  // @SetMetadata('permissions', ['role.active'])
  async changeStatus(@Param('id') id: number) {
    return this._routeService.changeStatus(+id);
  }
}
