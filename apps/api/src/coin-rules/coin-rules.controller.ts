import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { CoinRatesService } from './coin-rates.service.js';
import { CoinRulesService } from './coin-rules.service.js';

@Controller('government/coin-rules')
export class CoinRulesController {
  constructor(
    private readonly rules: CoinRulesService,
    private readonly rates: CoinRatesService,
  ) {}

  @Post('generate-rates')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  generate(
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.rates.generateManual(body, authorization);
  }

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
