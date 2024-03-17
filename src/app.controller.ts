import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './modules/auth/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get Hello Successful',
  })
  @Public()
  @ApiResponse({})
  getHello(): string {
    return this.appService.getHello();
  }
}
