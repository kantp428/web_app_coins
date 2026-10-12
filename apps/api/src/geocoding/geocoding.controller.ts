import { Controller, Get, Header, Query } from '@nestjs/common';
import { GeocodingService } from './geocoding.service.js';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geo: GeocodingService) {}

  @Get('reverse')
  @Header('Cache-Control', 'no-store')
  reverse(@Query('latitude') lat?: string, @Query('longitude') lng?: string) {
    return this.geo.reverse(lat, lng);
  }
}
