import type { BibleVerse } from './types';

type JsonNode = {
  type?: string;
  name?: string;
  text?: string;
  attrs?: { number?: string; sid?: string; style?: string };
  items?: JsonNode[];
};

function pushText(verses: BibleVerse[], n: number, chunk: string) {
  const text = chunk.replace(/\s+/g, ' ').trim();
  if (!text) return;
  const last = verses[verses.length - 1];
  if (last && last.n === n) {
    last.text = `${last.text} ${text}`.trim();
    return;
  }
  verses.push({ n, text });
}

function walkJson(node: unknown, verses: BibleVerse[], current: { n: number }) {
  if (node == null) return;
  if (typeof node === 'string') {
    pushText(verses, current.n || 1, node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => walkJson(item, verses, current));
    return;
  }
  if (typeof node !== 'object') return;
  const item = node as JsonNode;
  const number = item.attrs?.number ? Number.parseInt(item.attrs.number, 10) : NaN;
  const sid = item.attrs?.sid;
  const sidVerse = sid ? Number.parseInt(sid.split('.').pop() ?? '', 10) : NaN;
  if (item.name === 'verse' || (item.type === 'tag' && item.attrs?.style === 'v')) {
    if (Number.isFinite(number)) current.n = number;
    else if (Number.isFinite(sidVerse)) current.n = sidVerse;
  }
  if (item.type === 'text' && item.text) {
    pushText(verses, current.n || 1, item.text);
  }
  if (item.items) walkJson(item.items, verses, current);
}

export function parseJsonVerses(content: unknown): BibleVerse[] {
  const verses: BibleVerse[] = [];
  walkJson(content, verses, { n: 0 });
  return verses.filter((verse) => verse.text.length > 0);
}

export function parseHtmlVerses(html: string): BibleVerse[] {
  const withBreaks = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  const marker = /<span[^>]*(?:data-number=["'](\d+)["']|class=["'][^"']*\bv\b[^"']*["'])[^>]*>\s*(\d+[a-z]?)?\s*<\/span>/gi;
  const verses: BibleVerse[] = [];
  let lastIndex = 0;
  let current = 0;
  let match: RegExpExecArray | null;
  const matches: { index: number; end: number; n: number }[] = [];
  while ((match = marker.exec(withBreaks))) {
    const n = Number.parseInt(match[1] || match[2] || '', 10);
    if (!Number.isFinite(n)) continue;
    matches.push({ index: match.index, end: match.index + match[0].length, n });
  }
  if (matches.length === 0) {
    return parseTextVerses(stripTags(withBreaks));
  }
  matches.forEach((item, i) => {
    const from = item.end;
    const to = matches[i + 1]?.index ?? withBreaks.length;
    const text = stripTags(withBreaks.slice(from, to));
    pushText(verses, item.n, text);
    current = item.n;
    lastIndex = to;
  });
  if (lastIndex === 0 && current === 0) {
    return parseTextVerses(stripTags(withBreaks));
  }
  return verses.filter((verse) => verse.text.length > 0);
}

export function parseTextVerses(text: string): BibleVerse[] {
  const clean = text.replace(/\r/g, '').replace(/¶/g, ' ').trim();
  if (!clean) return [];
  const re = /(?:^|\s)(\d+)[.\s]+/g;
  const marks: { index: number; n: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(clean))) {
    marks.push({ index: match.index + (match[0].startsWith(' ') ? 1 : 0), n: Number(match[1]) });
  }
  if (marks.length === 0) {
    return [{ n: 1, text: clean.replace(/\s+/g, ' ').trim() }];
  }
  const verses: BibleVerse[] = [];
  marks.forEach((mark, i) => {
    const start = mark.index + String(mark.n).length;
    const end = marks[i + 1]?.index ?? clean.length;
    const body = clean.slice(start, end).replace(/^[.\s]+/, '');
    pushText(verses, mark.n, body);
  });
  return verses.filter((verse) => verse.text.length > 0);
}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function versesFromContent(content: unknown): BibleVerse[] {
  if (content == null) return [];
  if (typeof content === 'string') {
    const html = /<[a-z][\s\S]*>/i.test(content) ? parseHtmlVerses(content) : parseTextVerses(content);
    return html.length > 0 ? html : parseTextVerses(stripTags(content));
  }
  return parseJsonVerses(content);
}

export function sliceVerses(verses: BibleVerse[], start?: number, end?: number): BibleVerse[] {
  if (!start) return verses;
  const to = end ?? start;
  return verses.filter((verse) => verse.n >= start && verse.n <= to);
}
