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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AdminsService } from './admins.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { diskStorage } from 'multer';
import * as fs from "fs";
import * as path from "path";
import { FilesInterceptor } from '@nestjs/platform-express';
import { Admin } from '@prisma/client';


export const storageAdmin = {
  storage: diskStorage({
    destination: "./public/uploads/admins",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension: string = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${extension}`;
      // const filename: string = `${uniqueSuffix}${extension}`;
      cb(null, filename);
    },
  }),
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deleteFile = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};


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
  ): Promise<PageDto<Admin>> {
    return await this._adminsService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @SetMetadata('permissions', ['admin.create'])
  @UseInterceptors(FilesInterceptor("files", 10, storageAdmin))
  async create(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() createAdminDto: CreateAdminDto
  ) {

    if (!files && files.length < 1) {
      throw new Error("File is required");
    }

    return this._adminsService.create(createAdminDto, files);
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
