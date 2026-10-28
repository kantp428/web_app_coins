import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { GovernmentStoresService } from './government-stores.service.js';

@Controller('government/stores')
export class GovernmentStoresController {
  constructor(private readonly stores: GovernmentStoresService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.stores.list(query, authorization);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  detail(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.stores.detail(id, authorization);
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.stores.update(id, body, authorization);
  }
}
