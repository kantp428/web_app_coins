import {
  Body,
  Controller,
  Header,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Post('search')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  search(
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.recommendations.search(body, authorization);
  }
}
