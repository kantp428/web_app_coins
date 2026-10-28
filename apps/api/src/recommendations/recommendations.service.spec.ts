import { describe, expect, it } from 'vitest';
import { fallbackRank } from './recommendations.service.js';

describe('shop search fallback', () => {
  const candidates = [
    {
      id: '2',
      name: 'กาแฟริมทาง',
      categories: ['คาเฟ่'],
      distanceKm: 2,
      description: null,
    },
    {
      id: '1',
      name: 'ขนมบ้านเรา',
      categories: ['เบเกอรี่'],
      distanceKm: 1,
      description: 'เค้กและกาแฟ',
    },
    {
      id: '3',
      name: 'ร้านซ่อม',
      categories: ['บริการ'],
      distanceKm: 0.5,
      description: null,
    },
  ];
  it('uses real lexical evidence and deterministic distance ordering', () => {
    expect(fallbackRank('กาแฟ', candidates)).toEqual(['1', '2']);
    expect(fallbackRank('อาหารญี่ปุ่น', candidates)).toEqual([]);
  });
});
