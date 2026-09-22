import { normalizeBookKey } from './parseRef';
import type { BibleBook } from './types';

export function bookMatchesQuery(book: BibleBook, query: string): boolean {
  const needle = normalizeBookKey(query);
  if (!needle) return true;
  const fields = [book.name, book.nameLong ?? '', book.abbreviation, book.id];
  return fields.some((field) => normalizeBookKey(field).includes(needle));
}
