import { Controller, Get, Header, Headers, Query } from '@nestjs/common';
import { StoresService } from './stores.service.js';

@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.stores.list(query, authorization);
  }
}
