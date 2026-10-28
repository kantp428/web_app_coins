import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WalletsService } from './wallets.service.js';

@Controller()
export class WalletsController {
  constructor(private readonly wallets: WalletsService) {}

  @Get('quests/me')
  @Header('Cache-Control', 'no-store')
  quest(
    @Query('month') month: unknown,
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.mainQuest(month, auth);
  }

  @Post('quests/me/claim')
  @Header('Cache-Control', 'no-store')
  claim(@Headers('authorization') auth?: string) {
    return this.wallets.claimQuest(auth);
  }

  @Get('wallets/me')
  @Header('Cache-Control', 'no-store')
  summary(@Headers('authorization') auth?: string) {
    return this.wallets.summary(auth);
  }

  @Post('wallets/top-up')
  topUp(
    @Body() body: unknown,
    @Headers('idempotency-key') idempotencyKey?: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.topUp(body, idempotencyKey, auth);
  }

  @Post('wallets/help/reset')
  reset(@Headers('authorization') auth?: string) {
    return this.wallets.resetHelp(auth);
  }

  @Post('wallets/help/reset-daily')
  resetDaily(@Headers('authorization') auth?: string) {
    return this.wallets.resetDailyHelp(auth);
  }

  @Get('wallets/history')
  @Header('Cache-Control', 'no-store')
  history(@Headers('authorization') auth?: string) {
    return this.wallets.history(auth);
  }

  @Post('seller/payment-requests')
  create(@Body() body: unknown, @Headers('authorization') auth?: string) {
    return this.wallets.createPaymentRequest(body, auth);
  }

  @Get('seller/payment-requests')
  @Header('Cache-Control', 'no-store')
  list(@Headers('authorization') auth?: string) {
    return this.wallets.sellerPaymentRequests(auth);
  }

  @Post('seller/payment-requests/:id/cancel')
  cancel(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.wallets.cancelPaymentRequest(id, auth);
  }

  @Get('payment-requests/:id')
  @Header('Cache-Control', 'no-store')
  request(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.wallets.paymentRequest(id, auth);
  }

  @Post('payment-requests/:id/pay')
  pay(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.wallets.pay(id, auth);
  }
}
