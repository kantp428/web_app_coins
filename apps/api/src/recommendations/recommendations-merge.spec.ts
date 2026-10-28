import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { AppModule } from '../app.module.js';
import {
  RecommendationsController,
  RecommendationsService,
} from './recommendations.controller.js';
import { RecommendationsSearchController } from './recommendations-search.controller.js';
import { RecommendationsService as ShopSearchService } from './recommendations.service.js';

describe('merged recommendation routes', () => {
  it('registers both flows once with distinct service injection tokens', () => {
    const controllers = Reflect.getMetadata(
      'controllers',
      AppModule,
    ) as unknown[];
    const providers = Reflect.getMetadata('providers', AppModule) as unknown[];
    expect(new Set(controllers).size).toBe(controllers.length);
    expect(new Set(providers).size).toBe(providers.length);
    expect(controllers).toEqual(
      expect.arrayContaining([
        RecommendationsController,
        RecommendationsSearchController,
      ]),
    );
    expect(providers).toEqual(
      expect.arrayContaining([RecommendationsService, ShopSearchService]),
    );
    expect(
      Reflect.getMetadata('design:paramtypes', RecommendationsController),
    ).toEqual([RecommendationsService]);
    expect(
      Reflect.getMetadata('design:paramtypes', RecommendationsSearchController),
    ).toEqual([ShopSearchService]);
  });

  it('preserves context and candidates paths', () => {
    for (const [controller, methods] of [
      [RecommendationsController, ['context', 'candidates']],
    ] as const) {
      expect(Reflect.getMetadata('path', controller)).toBe('recommendations');
      for (const method of methods) {
        expect(
          Reflect.getMetadata(
            'path',
            (controller.prototype as unknown as Record<string, object>)[method],
          ),
        ).toBe(method);
      }
    }
  });

  it('keeps the reserved search method unavailable as an HTTP route', () => {
    const method = Object.getOwnPropertyDescriptor(
      RecommendationsSearchController.prototype,
      'search',
    )?.value as object;
    expect(method).toBeTypeOf('function');
    expect(Reflect.getMetadata('method', method)).toBeUndefined();
    expect(Reflect.getMetadata('path', method)).toBeUndefined();
  });

  it('forwards Explore search body and actor token to the search service', async () => {
    const result = { shopIds: ['1'], source: 'fallback' };
    const search = vi.fn().mockResolvedValue(result);
    const controller = new RecommendationsSearchController({
      search,
    } as unknown as ShopSearchService);
    const body = { query: 'coffee', latitude: 13, longitude: 100, radiusKm: 5 };
    await expect(controller.search(body, 'Bearer test')).resolves.toEqual(
      result,
    );
    expect(search).toHaveBeenCalledWith(body, 'Bearer test');
  });
});
