import { describe, it, expect, vi, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GeocodingService, parseAddress } from './geocoding.controller.js';
describe('shop reverse geocoding', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it('serializes requests at least 1100ms apart across users', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(10000);
    const starts: number[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        starts.push(Date.now());
        return { ok: true, json: async () => ({ address: { state: 'Test' } }) };
      }),
    );
    const service = new GeocodingService(new ConfigService());
    const first = service.reverse('13', '100');
    const second = service.reverse('14', '100');
    await vi.runAllTimersAsync();
    await Promise.all([first, second]);
    expect(starts).toHaveLength(2);
    expect(starts[1] - starts[0]).toBeGreaterThanOrEqual(1100);
  });
  it('maps Bangkok district and subdistrict prefixes', () => {
    expect(
      parseAddress({
        state: 'กรุงเทพมหานคร',
        city_district: 'เขตปทุมวัน',
        quarter: 'แขวงลุมพินี',
        postcode: '10330',
        road: 'ถนนพระราม 4',
      }),
    ).toEqual({
      line1: 'ถนนพระราม 4',
      province: 'กรุงเทพมหานคร',
      district: 'ปทุมวัน',
      subDistrict: 'ลุมพินี',
      postcode: '10330',
    });
  });
  it('maps provincial fields and allows incomplete provider addresses', () => {
    expect(
      parseAddress({
        state: 'เชียงใหม่',
        county: 'อำเภอเมืองเชียงใหม่',
        suburb: 'ตำบลสุเทพ',
      }),
    ).toMatchObject({
      province: 'เชียงใหม่',
      district: 'เมืองเชียงใหม่',
      subDistrict: 'สุเทพ',
      postcode: '',
    });
    expect(parseAddress({})).toEqual({
      line1: '',
      province: '',
      district: '',
      subDistrict: '',
      postcode: '',
    });
  });
  it('rejects invalid coordinates without contacting provider', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const service = new GeocodingService(new ConfigService());
    await expect(service.reverse('91', '100')).rejects.toMatchObject({
      status: 400,
    });
    await expect(service.reverse('', '100')).rejects.toMatchObject({
      status: 400,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('caches normalized responses and sends only coordinates', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ address: { state: 'กรุงเทพมหานคร' } }),
    });
    vi.stubGlobal('fetch', fetcher);
    const service = new GeocodingService(new ConfigService());
    const result = await service.reverse('13.75', '100.5');
    expect(await service.reverse('13.750000', '100.500000')).toEqual(result);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0][0])).toContain('lat=13.750000');
  });
  it('returns retryable error on provider failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(
      new GeocodingService(new ConfigService()).reverse('13', '100'),
    ).rejects.toMatchObject({ status: 503 });
  });
});
