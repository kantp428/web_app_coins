import {
  CoinRulesController,
  CoinRulesService,
} from './coin-rules/coin-rules.controller.js';
import {
  CategoriesController,
  CategoriesService,
} from './categories/categories.controller.js';
import {
  GeocodingController,
  GeocodingService,
} from './geocoding/geocoding.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    CoinRulesController,
    AppController,
    AuthController,
    GeocodingController,
    CategoriesController,
  ],
  providers: [
    AppService,
    AuthService,
    GeocodingService,
    CategoriesService,
    CoinRulesService,
  ],
})
export class AppModule {}
