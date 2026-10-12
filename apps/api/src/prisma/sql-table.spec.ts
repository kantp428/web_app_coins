import { describe, expect, it } from 'vitest';
import { sqlTable } from './sql-table.js';

describe('schema-qualified SQL tables', () => {
  it('defaults to public and supports isolated test schemas', () => {
    expect(sqlTable('money_entries').sql).toBe('"public"."money_entries"');
    expect(sqlTable('wallets', 'coin_awards_test_123').sql).toBe(
      '"coin_awards_test_123"."wallets"',
    );
  });
  it('rejects SQL fragments as schema or table identifiers', () => {
    expect(() => sqlTable('money_entries; DROP TABLE users')).toThrow();
    expect(() => sqlTable('money_entries', 'public";--')).toThrow();
  });
});
