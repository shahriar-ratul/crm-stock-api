import { Controller, Get, UseGuards } from '@nestjs/common';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CategoryService } from '../category/category.service';
import { RouteService } from '../route/route.service';
import { SourceService } from '../source/source.service';
import { PlatformService } from '../platform/platform.service';

@ApiTags('common')
@Controller({
  version: '1',
  path: 'common',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class StockModuleController {
  constructor(
    private readonly _categoryService: CategoryService,
    private readonly _routeService: RouteService,
    private readonly _sourceService: SourceService,
    private readonly _platformService: PlatformService,
  ) { }

  // common/all-categories
  @ApiResponse({})
  @Get('/all-categories')
  async getAllCategories() {
    return this._categoryService.getAllItems();
  }

  // common/all-routes
  @ApiResponse({})
  @Get('/all-routes')
  async getAllRoutes() {
    return this._routeService.getAllItems();
  }

  // common/all-sources
  @ApiResponse({})
  @Get('/all-sources')
  async getAllSources() {
    return this._sourceService.getAllItems();
  }

  // common/all-platforms
  @ApiResponse({})
  @Get('/all-platforms')
  async getAllPlatforms() {
    return this._platformService.getAllItems();
  }
}
