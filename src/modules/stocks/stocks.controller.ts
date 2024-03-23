import { Controller, Get, Post, Body, Param, Delete, SetMetadata, UseInterceptors, UploadedFiles, UseGuards, Query, Put, Request } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

import { diskStorage } from 'multer';
import * as fs from "fs";
import * as path from "path";
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbilityGuard } from '../auth/ability/ability.guard';
import { PageDto, PageOptionsDto } from '@/common/dto';
import { Stock } from '@prisma/client';

export const storage = {
  storage: diskStorage({
    destination: "./public/uploads/stocks",
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

@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
@Controller({ path: 'stocks', version: '1' })
export class StocksController {
  constructor(private readonly _stocksService: StocksService) { }


  @Get()
  @ApiResponse({})
  @SetMetadata('permissions', ['stock.view'])
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Stock>> {
    return await this._stocksService.findAll(pageOptionsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._stocksService.findOne(+id);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  // @SetMetadata('permissions', ['stock.create'])
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'files',
        maxCount: 100,

      },
      {
        name: 'image',
        maxCount: 1
      },
    ], storage),
  )

  async create(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    image: Express.Multer.File,
    @Body() createDto: CreateStockDto,
    @Request() req: any
  ) {

    const user = req.user.id;

    console.log(user);

    if (!files && files.length < 1) {
      throw new Error("File is required");
    }

    return this._stocksService.create(createDto, files, image, user);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this._stocksService.update(+id, updateStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._stocksService.remove(+id);
  }


  @Put('/status/:id')
  @ApiResponse({})
  @SetMetadata('permissions', ['stock.active'])
  async changeStatus(@Param('id') id: number) {
    return this._stocksService.changeStatus(+id);
  }
}
