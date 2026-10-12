import { Prisma } from '@prisma/client';

// SQL identifiers cannot be bound as values. Restrict and quote both parts.
export function sqlTable(table: string, schema = 'public') {
  if (![schema, table].every((value) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)))
    throw new Error('Invalid SQL identifier');
  return Prisma.raw(`"${schema}"."${table}"`);
}
