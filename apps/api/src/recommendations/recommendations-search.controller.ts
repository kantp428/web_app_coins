import { Body, Controller, Header, Headers, HttpCode } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';

@Controller('recommendations')
export class RecommendationsSearchController {
  constructor(private readonly recommendations: RecommendationsService) {}

  // Not in use yet. Restore this decorator when Explore search is enabled.
  // @Post('search')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  search(
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.recommendations.search(body, authorization);
  }
}
