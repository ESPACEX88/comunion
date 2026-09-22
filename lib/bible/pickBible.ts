import type { BibleSummary } from './types';

function blob(bible: BibleSummary): string {
  return [bible.name, bible.nameLocal, bible.abbreviation, bible.abbreviationLocal, bible.description, bible.copyright]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function isSpanish(bible: BibleSummary): boolean {
  const id = bible.language?.id?.toLowerCase() ?? '';
  const name = `${bible.language?.name ?? ''} ${bible.language?.nameLocal ?? ''}`.toLowerCase();
  return id === 'spa' || id === 'es' || name.includes('spanish') || name.includes('español');
}

export function scoreSpanishBible(bible: BibleSummary): number {
  const text = blob(bible);
  let score = 0;
  if (isSpanish(bible)) score += 50;
  if (text.includes('reina') && text.includes('valera')) score += 40;
  if (text.includes('1909')) score += 35;
  if (/\brv1909\b|\brvr1909\b|\bsparv/.test(text)) score += 20;
  if (text.includes('public domain') || text.includes('dominio público') || text.includes('dominio publico')) {
    score += 18;
  }
  if (/\bfree\b/.test(text) || text.includes('open')) score += 8;
  if (text.includes('1960') || text.includes('1995') || text.includes('2011')) score -= 8;
  return score;
}

export function pickPreferredSpanishBible(bibles: BibleSummary[]): BibleSummary | null {
  const ranked = [...bibles].sort((a, b) => scoreSpanishBible(b) - scoreSpanishBible(a));
  const best = ranked[0];
  if (!best || scoreSpanishBible(best) < 40) {
    return ranked.find((bible) => isSpanish(bible)) ?? best ?? null;
  }
  return best;
}
