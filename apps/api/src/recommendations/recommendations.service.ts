import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { OllamaShopSearchProvider } from './shop-search.provider.js';
import {
  parseStoreScope,
  type StoreCandidate,
  StoresService,
} from '../stores/stores.service.js';

export function fallbackRank(
  query: string,
  candidates: StoreCandidate[],
): string[] {
  const normalize = (value: string) =>
    value.normalize('NFKC').toLocaleLowerCase('th');
  const tokens = [
    ...new Set(
      normalize(query)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((token) => token.length > 1),
    ),
  ];
  if (tokens.length === 0) return [];
  return candidates
    .map((candidate) => {
      const name = normalize(candidate.name),
        categories = normalize(candidate.categories.join(' ')),
        description = normalize(candidate.description ?? '');
      const matches = tokens.filter(
        (token) =>
          name.includes(token) ||
          categories.includes(token) ||
          description.includes(token),
      ).length;
      const exact = tokens.some(
        (token) =>
          name === token ||
          candidate.categories.some(
            (category) => normalize(category) === token,
          ),
      )
        ? 1
        : 0;
      return { candidate, matches, exact };
    })
    .filter((item) => item.matches > 0)
    .sort((a, b) => {
      const score =
        b.matches / tokens.length - a.matches / tokens.length ||
        b.exact - a.exact ||
        a.candidate.distanceKm - b.candidate.distanceKm;
      if (score !== 0) return score;
      return BigInt(a.candidate.id) < BigInt(b.candidate.id)
        ? -1
        : BigInt(a.candidate.id) > BigInt(b.candidate.id)
          ? 1
          : 0;
    })
    .map((item) => item.candidate.id);
}

@Injectable()
export class RecommendationsService {
  private readonly requests = new Map<string, number[]>();
  constructor(
    private readonly stores: StoresService,
    private readonly provider: OllamaShopSearchProvider,
  ) {}

  private limit(userId: string) {
    const now = Date.now(),
      recent = (this.requests.get(userId) ?? []).filter(
        (time) => now - time < 60_000,
      );
    if (recent.length >= 20)
      throw new HttpException(
        'ค้นหาด้วย AI บ่อยเกินไป กรุณารอสักครู่',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    recent.push(now);
    this.requests.set(userId, recent);
  }

  async search(body: Record<string, unknown>, authorization?: string) {
    const user = await this.stores.requireCustomer(authorization);
    const allowedKeys = new Set([
      'query',
      'latitude',
      'longitude',
      'radiusKm',
      'categoryIds',
    ]);
    if (
      Object.keys(body).some((key) => !allowedKeys.has(key)) ||
      typeof body.query !== 'string' ||
      body.query.trim().length > 500
    )
      throw new BadRequestException('คำค้นหาไม่ถูกต้อง (ไม่เกิน 500 ตัวอักษร)');
    const query = body.query.trim(),
      scope = parseStoreScope(body);
    if (!query) return { shopIds: [], source: 'discovery' as const };
    this.limit(user.id);
    const candidates = await this.stores.candidates(scope);
    if (candidates.length === 0) return { shopIds: [], source: 'llm' as const };
    const fallback = async () => {
      const descriptions = await this.stores.descriptions(
        scope,
        candidates.map((candidate) => candidate.id),
      );
      const descriptionsById = new Map(
        descriptions.map((item) => [item.id, item.description]),
      );
      return {
        shopIds: fallbackRank(
          query,
          candidates.map((candidate) => ({
            ...candidate,
            description: descriptionsById.get(candidate.id) ?? null,
          })),
        ),
        source: 'fallback' as const,
      };
    };
    if (candidates.length > 500) return fallback();
    try {
      const batches = Array.from(
        { length: Math.ceil(candidates.length / 50) },
        (_, index) => candidates.slice(index * 50, index * 50 + 50),
      );
      const ranked: string[] = [];
      for (const batch of batches) {
        const ids = await this.provider.rank(query, batch, (shopIds) =>
          this.stores.descriptions(scope, shopIds),
        );
        ranked.push(...ids);
      }
      const unique = [...new Set(ranked)];
      if (batches.length > 1 && unique.length > 1) {
        const byId = new Map(
          candidates.map((candidate) => [candidate.id, candidate]),
        );
        return {
          shopIds: await this.provider.rank(
            query,
            unique.map((id) => byId.get(id)!),
            (shopIds) => this.stores.descriptions(scope, shopIds),
          ),
          source: 'llm' as const,
        };
      }
      return { shopIds: unique, source: 'llm' as const };
    } catch {
      return fallback();
    }
  }
}
