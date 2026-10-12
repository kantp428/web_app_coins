import { Body, Controller, Get, Header, Headers, Post } from '@nestjs/common';
import { CoinRulesService } from './coin-rules.service.js';

@Controller('government/coin-rules')
export class CoinRulesController {
  constructor(private readonly rules: CoinRulesService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Headers('authorization') authorization?: string) {
    return this.rules.list(authorization);
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  create(
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.rules.create(body, authorization);
  }
}
