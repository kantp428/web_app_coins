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
import { SellerStoresService } from './seller-stores.service.js';

@Controller('seller/stores')
export class SellerStoresController {
  constructor(private readonly stores: SellerStoresService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  list(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') auth?: string,
  ) {
    return this.stores.list(query, auth);
  }
  @Patch(':id/location')
  @Header('Cache-Control', 'no-store')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('authorization') auth?: string,
  ) {
    return this.stores.updateLocation(id, body, auth);
  }
}
