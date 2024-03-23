import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { StockModuleController } from './list/stock-module.controller';
import { CategoryService } from './category/category.service';
import { RouteService } from './route/route.service';
import { SourceService } from './source/source.service';
import { CategoryController } from './category/category.controller';
import { SourceController } from './source/source.controller';
import { RouteController } from './route/route.controller';
import { PlatformController } from './platform/platform.controller';
import { PlatformService } from './platform/platform.service';

@Module({
  controllers: [StocksController, StockModuleController, CategoryController, SourceController, RouteController, PlatformController],
  providers: [StocksService, CategoryService, RouteService, SourceService, PlatformService],
})
export class StocksModule { }
