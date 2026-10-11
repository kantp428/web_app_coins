import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('auth/register')
  @Header('Cache-Control', 'no-store')
  register(@Body() body: unknown) {
    return this.auth.register(body);
  }
  @Post('auth/login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  login(@Body() body: unknown) {
    return this.auth.login(body);
  }
  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Headers('authorization') authorization?: string) {
    return this.auth.me(authorization);
  }
}
