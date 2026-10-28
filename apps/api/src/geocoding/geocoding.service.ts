import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function parseAddress(a: Record<string, string>) {
  const strip = (s = '') => s.replace(/^(เขต|แขวง|อำเภอ|ตำบล)\s*/, '');
  const province = a.state ?? a.province ?? a.city ?? '';
  const bangkok = province.includes('กรุงเทพ');
  const values = Object.values(a);
  return {
    line1: [a.house_number, a.road].filter(Boolean).join(' '),
    province,
    district: strip(
      bangkok
        ? (values.find((v) => v.startsWith('เขต')) ?? a.city_district)
        : (a.county ?? a.city_district ?? a.district),
    ),
    subDistrict: strip(
      bangkok
        ? (values.find((v) => v.startsWith('แขวง')) ?? a.quarter)
        : (a.suburb ?? a.village ?? a.town ?? a.hamlet),
    ),
    postcode: /^[0-9]{5}$/.test(a.postcode ?? '') ? a.postcode : '',
  };
}
@Injectable()
export class GeocodingService {
  private tail: Promise<unknown> = Promise.resolve();
  private lastStart = 0;
  private queued = 0;
  private cache = new Map<
    string,
    { expires: number; address: ReturnType<typeof parseAddress> }
  >();
  constructor(private readonly config: ConfigService) {}
  async reverse(latitude?: string, longitude?: string) {
    if (
      !latitude?.trim() ||
      !longitude?.trim() ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude)) ||
      Math.abs(Number(latitude)) > 90 ||
      Math.abs(Number(longitude)) > 180
    )
      throw new BadRequestException('พิกัดไม่ถูกต้อง');
    const lat = Number(latitude).toFixed(6),
      lon = Number(longitude).toFixed(6);
    const key = `${lat},${lon}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.address;
    if (this.queued >= 3)
      throw new ServiceUnavailableException('กำลังค้นหาที่อยู่ กรุณาลองใหม่');
    this.queued++;
    const job = this.tail.then(async () => {
      const cached = this.cache.get(key);
      if (cached && cached.expires > Date.now()) return cached.address;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 1100 - (Date.now() - this.lastStart))),
      );
      this.lastStart = Date.now();
      const url = new URL(
        this.config.get<string>('GEOCODING_REVERSE_URL') ??
          'https://nominatim.openstreetmap.org/reverse',
      );
      url.search = new URLSearchParams({
        format: 'jsonv2',
        lat,
        lon,
        addressdetails: '1',
        zoom: '18',
        'accept-language': 'th',
      }).toString();
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              this.config.get<string>('GEOCODING_USER_AGENT') ??
              'THAI-Please-ShopRegistration/1.0',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(6000),
        });
        if (!response.ok) throw new Error('provider');
        const data = (await response.json()) as {
          address?: Record<string, unknown>;
        };
        if (!data.address) throw new Error('no address');
        const normalized = parseAddress(
          Object.fromEntries(
            Object.entries(data.address).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === 'string',
            ),
          ),
        );
        if (!Object.values(normalized).some(Boolean)) throw new Error('empty');
        if (this.cache.size >= 500)
          this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(key, {
          expires: Date.now() + 86400000,
          address: normalized,
        });
        return normalized;
      } catch {
        throw new ServiceUnavailableException(
          'ค้นหาที่อยู่ไม่ได้ กรุณากรอกเองหรือลองใหม่',
        );
      }
    });
    this.tail = job.catch(() => undefined);
    try {
      return await job;
    } finally {
      this.queued--;
    }
  }
}
