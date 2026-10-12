import { StoresController, StoresService } from './stores/stores.controller.js';
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
import {
  WalletsController,
  WalletsService,
} from './wallets/wallets.controller.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    StoresController,
    CoinRulesController,
    AppController,
    AuthController,
    GeocodingController,
    CategoriesController,
    WalletsController,
  ],
  providers: [
    StoresService,
    AppService,
    AuthService,
    GeocodingService,
    CategoriesService,
    CoinRulesService,
    WalletsService,
  ],
})
export class AppModule {}
