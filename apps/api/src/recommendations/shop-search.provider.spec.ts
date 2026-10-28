import { afterEach, describe, expect, it, vi } from 'vitest';
import { OllamaShopSearchProvider } from './shop-search.provider.js';

const candidates = [
  { id: '1', name: 'ร้านกาแฟ', categories: ['คาเฟ่'], distanceKm: 1 },
  { id: '2', name: 'ร้านขนม', categories: ['เบเกอรี่'], distanceKm: 2 },
];
const provider = () =>
  new OllamaShopSearchProvider({
    get: (key: string) =>
      key === 'SHOP_SEARCH_TIMEOUT_MS' ? '1000' : undefined,
  } as never);
const response = (message: object) =>
  new Response(JSON.stringify({ message }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Ollama shop search provider validation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('accepts only structured in-scope unique IDs', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response({ role: 'assistant', content: '{"shopIds":["2","1"]}' }),
        ),
    );
    await expect(
      provider().rank('กาแฟ', candidates, async () => []),
    ).resolves.toEqual(['2', '1']);
  });

  it.each(['{"shopIds":["1","1"]}', '{"shopIds":["999"]}', 'not-json'])(
    'rejects invalid model output %s',
    async (content) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(response({ role: 'assistant', content })),
      );
      await expect(
        provider().rank('กาแฟ', candidates, async () => []),
      ).rejects.toThrow();
    },
  );

  it('rejects a description tool request outside current candidates before reading DB', async () => {
    const read = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        response({
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              function: {
                name: 'get_shop_descriptions',
                arguments: { shopIds: ['999'] },
              },
            },
          ],
        }),
      ),
    );
    await expect(provider().rank('กาแฟ', candidates, read)).rejects.toThrow(
      'tool scope violation',
    );
    expect(read).not.toHaveBeenCalled();
  });
});
