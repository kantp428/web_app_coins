import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoresController } from './stores/stores.controller.js';
import { StoresService } from './stores/stores.service.js';
import { SellerStoresController } from './seller-stores/seller-stores.controller.js';
import { SellerStoresService } from './seller-stores/seller-stores.service.js';
import { CoinRulesController } from './coin-rules/coin-rules.controller.js';
import { CoinRulesService } from './coin-rules/coin-rules.service.js';
import { CoinRatesService } from './coin-rules/coin-rates.service.js';
import { CategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { GeocodingController } from './geocoding/geocoding.controller.js';
import { GeocodingService } from './geocoding/geocoding.service.js';
import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WalletsController } from './wallets/wallets.controller.js';
import { WalletsService } from './wallets/wallets.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { GovernmentStoresController } from './government-stores/government-stores.controller.js';
import { GovernmentStoresService } from './government-stores/government-stores.service.js';
import { GovernmentReportsController } from './government-reports/government-reports.controller.js';
import { GovernmentReportsService } from './government-reports/government-reports.service.js';
import {
  RecommendationsController,
  RecommendationsService,
} from './recommendations/recommendations.controller.js';
import { RecommendationsSearchController } from './recommendations/recommendations-search.controller.js';
import { RecommendationsService as ShopSearchService } from './recommendations/recommendations.service.js';
import { OllamaShopSearchProvider } from './recommendations/shop-search.provider.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [
    AppController,
    AuthController,
    CategoriesController,
    CoinRulesController,
    GeocodingController,
    GovernmentReportsController,
    GovernmentStoresController,
    RecommendationsController,
    RecommendationsSearchController,
    StoresController,
    SellerStoresController,
    WalletsController,
  ],
  providers: [
    AppService,
    AuthService,
    CategoriesService,
    CoinRulesService,
    CoinRatesService,
    GeocodingService,
    GovernmentReportsService,
    GovernmentStoresService,
    RecommendationsService,
    ShopSearchService,
    OllamaShopSearchProvider,
    StoresService,
    SellerStoresService,
    WalletsService,
  ],
})
export class AppModule {}
