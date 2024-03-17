import { Controller, Get, UseGuards, SetMetadata, Query, } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbilityGuard } from '../auth/ability/ability.guard';
import { AdminResponse } from '../admins/interface/AdminResponse';
import { PageDto, PageOptionsDto } from '@/common/dto';




@ApiTags('wallets')
@Controller({ version: '1', path: 'wallets' })
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class WalletController {
  constructor(private readonly _userService: UserService) { }

  @ApiResponse({})
  @SetMetadata('permissions', ['user.view'])
  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<AdminResponse>> {
    return await this._userService.findAllWallet(pageOptionsDto);
  }


}
