import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import {
  parseShopIds,
  parseStoreScope,
  StoresService,
} from './stores.service.js';

@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  private validateBody(body: Record<string, unknown>) {
    const allowed = new Set([
      'shopIds',
      'latitude',
      'longitude',
      'radiusKm',
      'categoryIds',
    ]);
    if (Object.keys(body).some((key) => !allowed.has(key)))
      throw new BadRequestException('request field ไม่ถูกต้อง');
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  list(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.stores.list(query, authorization);
  }

  @Post('descriptions')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async descriptions(
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    await this.stores.requireCustomer(authorization);
    this.validateBody(body);
    return {
      shops: await this.stores.descriptions(
        parseStoreScope(body),
        parseShopIds(body.shopIds),
      ),
    };
  }

  @Post('batch')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async batch(
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    const user = await this.stores.requireCustomer(authorization);
    this.validateBody(body);
    return {
      stores: await this.stores.hydrate(
        parseStoreScope(body),
        parseShopIds(body.shopIds),
        user.id,
      ),
    };
  }
}
