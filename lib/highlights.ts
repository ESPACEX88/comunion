import AsyncStorage from '@react-native-async-storage/async-storage';

export const HIGHLIGHT_SWATCHES = [
  { id: 'amber', label: 'Ámbar', paint: 'rgba(232, 196, 138, 0.62)', chip: '#E8C48A' },
  { id: 'olive', label: 'Olivo', paint: 'rgba(138, 148, 111, 0.45)', chip: '#8A946F' },
  { id: 'rose', label: 'Terracota', paint: 'rgba(166, 93, 70, 0.32)', chip: '#A65D46' },
  { id: 'gold', label: 'Oro', paint: 'rgba(196, 123, 42, 0.32)', chip: '#C47B2A' },
  { id: 'sand', label: 'Arena', paint: 'rgba(92, 83, 72, 0.2)', chip: '#5C5348' },
  { id: 'linen', label: 'Lino', paint: 'rgba(243, 222, 192, 0.85)', chip: '#F3DEC0' },
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
  const nextPassage = { ...(map[passageKey] ?? {}) };
  const key = String(verseN);
  if (!colorId || nextPassage[key] === colorId) {
    delete nextPassage[key];
  } else {
    nextPassage[key] = colorId;
  }
  const next = { ...map };
  if (Object.keys(nextPassage).length === 0) {
    delete next[passageKey];
  } else {
    next[passageKey] = nextPassage;
  }
  return next;
}
