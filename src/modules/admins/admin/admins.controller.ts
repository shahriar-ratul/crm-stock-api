import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Query,
  Put,
} from '@nestjs/common';
import { AdminsService } from './admins.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { AdminResponse } from '../interface/AdminResponse';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('admins')
@Controller({ version: '1', path: 'admins' })
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class AdminsController {
  constructor(private readonly _adminsService: AdminsService) {}

  @Get()
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.view'])
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<AdminResponse>> {
    return await this._adminsService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @SetMetadata('permissions', ['admin.create'])
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this._adminsService.create(createAdminDto);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.view'])
  async findOne(@Param('id') id: number) {
    return this._adminsService.findById(+id);
  }

  @Put(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.update'])
  async update(
    @Param('id') id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this._adminsService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.delete'])
  async remove(@Param('id') id: number) {
    return this._adminsService.remove(id);
  }

  @Put('/status/:id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.active'])
  async changeStatus(@Param('id') id: number) {
    return this._adminsService.changeStatus(+id);
  }
}
