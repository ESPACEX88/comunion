import AsyncStorage from '@react-native-async-storage/async-storage';

export const HIGHLIGHT_SWATCHES = [
  { id: 'amber', label: 'Ámbar', paint: 'rgba(250, 204, 21, 0.35)', chip: '#FACC15' },
  { id: 'olive', label: 'Olivo', paint: 'rgba(74, 222, 128, 0.28)', chip: '#4ADE80' },
  { id: 'rose', label: 'Rosa', paint: 'rgba(244, 114, 182, 0.28)', chip: '#F472B6' },
  { id: 'gold', label: 'Oro', paint: 'rgba(251, 146, 60, 0.32)', chip: '#FB923C' },
  { id: 'sand', label: 'Cielo', paint: 'rgba(34, 211, 238, 0.28)', chip: '#22D3EE' },
  { id: 'linen', label: 'Lila', paint: 'rgba(167, 139, 250, 0.32)', chip: '#A78BFA' },
] as const;

export type HighlightColorId = (typeof HIGHLIGHT_SWATCHES)[number]['id'];

/** passageKey → verse number → color */
export type HighlightMap = Record<string, Record<string, HighlightColorId>>;

const PREFIX = '@comunion/highlights/v1';

function storageKey(userId: string, bibleId: string): string {
  return `${PREFIX}/${userId || 'local'}/${bibleId || 'plan'}`;
}

export function highlightPaint(colorId: HighlightColorId | undefined): string | undefined {
  if (!colorId) return undefined;
  return HIGHLIGHT_SWATCHES.find((item) => item.id === colorId)?.paint;
}

export async function loadHighlights(userId: string, bibleId: string): Promise<HighlightMap> {
  const raw = await AsyncStorage.getItem(storageKey(userId, bibleId));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as HighlightMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveHighlights(
  userId: string,
  bibleId: string,
  map: HighlightMap,
): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId, bibleId), JSON.stringify(map));
}

export function setVerseHighlight(
  map: HighlightMap,
  passageKey: string,
  verseN: number,
  colorId: HighlightColorId | null,
): HighlightMap {
  return applyVerseHighlights(map, passageKey, [verseN], colorId, 'toggle');
}

/** Aplica (o quita) un color a varios versículos del mismo pasaje. */
export function applyVerseHighlights(
  map: HighlightMap,
  passageKey: string,
  verseNs: number[],
  colorId: HighlightColorId | null,
  mode: 'set' | 'toggle' = 'set',
): HighlightMap {
  const nextPassage = { ...(map[passageKey] ?? {}) };
  const allHave =
    colorId != null &&
    verseNs.length > 0 &&
    verseNs.every((n) => nextPassage[String(n)] === colorId);

  for (const verseN of verseNs) {
    const key = String(verseN);
    if (!colorId) {
      delete nextPassage[key];
      continue;
    }
    if (mode === 'toggle' && nextPassage[key] === colorId) {
      delete nextPassage[key];
    } else if (mode === 'set' && allHave) {
      delete nextPassage[key];
    } else {
      nextPassage[key] = colorId;
    }
  }

  const next = { ...map };
  if (Object.keys(nextPassage).length === 0) {
    delete next[passageKey];
  } else {
    next[passageKey] = nextPassage;
  }
  return next;
}
