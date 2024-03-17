import { Controller, Get, Post, Body, Param, Delete, UseGuards, SetMetadata, Query, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbilityGuard } from '../auth/ability/ability.guard';
import { AdminResponse } from '../admins/interface/AdminResponse';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { Public } from '../auth/decorators/public.decorator';
import { diskStorage } from 'multer';
import * as fs from "fs";
import * as path from "path";
import { FilesInterceptor } from '@nestjs/platform-express';


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



@ApiTags('users')
@Controller({ version: '1', path: 'users' })
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class UserController {
  constructor(private readonly _userService: UserService) { }

  @ApiResponse({})
  @SetMetadata('permissions', ['user.view'])
  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<AdminResponse>> {
    return await this._userService.findAll(pageOptionsDto);
  }


  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @Public()
  @UseInterceptors(FilesInterceptor("files", 10, storageAdmin))
  async create(
    @UploadedFiles()
    files: Array<Express.Multer.File>,

    @Body() createUserDto: CreateUserDto
  ) {
    if (!files && files.length < 1) {
      throw new Error("File is required");
    }

    return await this._userService.create(createUserDto, files);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.view'])
  async findOne(@Param('id') id: number) {
    return this._userService.findById(+id);
  }

  @Put(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.update'])
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this._userService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.delete'])
  async remove(@Param('id') id: number) {
    return this._userService.remove(id);
  }


  @Put("/status/:id")
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.update'])
  async changeStatus(
    @Param('id') id: number
  ) {
    return this._userService.changeStatus(+id);
  }



}
