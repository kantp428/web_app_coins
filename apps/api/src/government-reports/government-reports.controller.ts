import { Controller, Get, Header, Headers, Query } from '@nestjs/common';
import { GovernmentReportsService } from './government-reports.service.js';

@Controller('government')
export class GovernmentReportsController {
  constructor(private readonly reports: GovernmentReportsService) {}

  @Get('dashboard')
  @Header('Cache-Control', 'no-store')
  dashboard(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.reports.dashboard(query, authorization);
  }

  @Get('reports')
  @Header('Cache-Control', 'no-store')
  analysis(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.reports.analysis(query, authorization);
  }
}
