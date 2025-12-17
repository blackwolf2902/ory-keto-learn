import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SkipPermissionCheck } from './common/decorators/permission.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @SkipPermissionCheck()
  @ApiOperation({ summary: 'Health check and welcome message' })
  getHello(): { status: string; message: string; docs: string } {
    return {
      status: 'ok',
      message: '🔐 Ory Keto Learning Project',
      docs: '/api',
    };
  }
}
