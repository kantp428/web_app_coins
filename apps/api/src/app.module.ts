import { StoresController } from './stores/stores.controller.js';
import { StoresService } from './stores/stores.service.js';
import { CoinRulesController } from './coin-rules/coin-rules.controller.js';
import { CoinRulesService } from './coin-rules/coin-rules.service.js';
import { CoinRatesService } from './coin-rules/coin-rates.service.js';
import { CategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { GeocodingController } from './geocoding/geocoding.controller.js';
import { GeocodingService } from './geocoding/geocoding.service.js';
import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WalletsController } from './wallets/wallets.controller.js';
import { WalletsService } from './wallets/wallets.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { GovernmentStoresController } from './government-stores/government-stores.controller.js';
import { GovernmentStoresService } from './government-stores/government-stores.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [
    StoresController,
    CoinRulesController,
    AppController,
    AuthController,
    GeocodingController,
    CategoriesController,
    WalletsController,
    GovernmentStoresController,
  ],
  providers: [
    StoresService,
    AppService,
    AuthService,
    GeocodingService,
    CategoriesService,
    CoinRulesService,
    CoinRatesService,
    WalletsService,
    GovernmentStoresService,
  ],
})
export class AppModule {}
