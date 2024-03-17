import { Controller, Get, Param, UseGuards, SetMetadata, Query, Put, } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbilityGuard } from '../auth/ability/ability.guard';
import { AdminResponse } from '../admins/interface/AdminResponse';
import { PageDto, PageOptionsDto } from '@/common/dto';




@ApiTags('users-verify')
@Controller({ version: '1', path: 'users-verify' })
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class UserVerifyController {
  constructor(private readonly _userService: UserService) { }

  @ApiResponse({})
  @SetMetadata('permissions', ['user.view'])
  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<AdminResponse>> {
    return await this._userService.findAllUnVerified(pageOptionsDto);
  }


  @Put('verify/:id')
  @ApiResponse({})
  @SetMetadata('permissions', ['user.update'])
  async verify(@Param('id') id: number) {
    return this._userService.verify(+id);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['admin.view'])
  async findOne(@Param('id') id: number) {
    return this._userService.findById(+id);
  }


}
