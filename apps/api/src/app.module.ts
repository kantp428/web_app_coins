import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
