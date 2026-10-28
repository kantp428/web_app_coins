import { describe, expect, it } from 'vitest';
import {
  listStatus,
  reviewInput,
  shopId,
} from './government-stores.service.js';

describe('government store approval validation', () => {
  it('accepts supported list filters and IDs', () => {
    expect(listStatus({})).toBeNull();
    expect(listStatus({ status: 'ALL' })).toBeNull();
    expect(listStatus({ status: 'PENDING' })).toBe('PENDING');
    expect(shopId('9007199254740993')).toBe(9007199254740993n);
  });

  it('rejects invalid filters and IDs', () => {
    expect(() => listStatus({ status: 'UNKNOWN' })).toThrow();
    expect(() => listStatus({ status: ['PENDING'] })).toThrow();
    expect(() => listStatus({ page: '1' })).toThrow();
    expect(() => shopId('0')).toThrow();
    expect(() => shopId('1.5')).toThrow();
  });

  it('validates approval and suspension reason', () => {
    expect(reviewInput({ status: 'APPROVED' })).toEqual({
      status: 'APPROVED',
    });
    expect(
      reviewInput({ status: 'SUSPENDED', reason: '  เอกสารไม่ครบ  ' }),
    ).toEqual({ status: 'SUSPENDED', reason: 'เอกสารไม่ครบ' });
    expect(() => reviewInput({ status: 'SUSPENDED' })).toThrow();
    expect(() => reviewInput({ status: 'PENDING' })).toThrow();
    expect(() => reviewInput({ status: 'APPROVED', extra: true })).toThrow();
  });
});
