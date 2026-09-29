import { HIGHLIGHT_SWATCHES, highlightPaint, type HighlightColorId } from '@/lib/highlights';
import { AppText } from '@/components/ui/AppText';
import { PressScale } from '@/components/motion/PressScale';
import type { BibleVerse } from '@/lib/bible/types';
import { radius, space, useTheme } from '@/theme';
import { Pressable, View } from 'react-native';

type Props = {
  verses: BibleVerse[];
  selectedN: number | null;
  colorsByVerse: Record<string, HighlightColorId>;
  paletteOpen: boolean;
  onSelect: (verse: BibleVerse) => void;
  onCopy: () => void;
  onTogglePalette: () => void;
  onPickColor: (colorId: HighlightColorId) => void;
};

export function VerseList({
  verses,
  selectedN,
  colorsByVerse,
  paletteOpen,
  onSelect,
  onCopy,
  onTogglePalette,
  onPickColor,
}: Props) {
  const { colors } = useTheme();
  const interactive = Boolean(onSelect);

  return (
    <View>
      {verses.map((verse) => {
        const selected = selectedN === verse.n;
        const paint = highlightPaint(colorsByVerse[String(verse.n)]);
        return (
          <Pressable
            key={`${verse.n}-${verse.text.slice(0, 12)}`}
            onPress={() => onSelect(verse)}
            onLongPress={() => onSelect(verse)}
            delayLongPress={280}
            disabled={!interactive}
            accessibilityRole="button"
            accessibilityLabel={`Versículo ${verse.n}`}>
            <View
              style={{
                flexDirection: 'row',
                gap: 14,
                marginBottom: 10,
                paddingVertical: 10,
                paddingHorizontal: 10,
                marginHorizontal: -10,
                borderRadius: radius.md,
                backgroundColor: paint ?? (selected ? colors.creamDeep : 'transparent'),
                borderWidth: selected ? 1 : 0,
                borderColor: colors.amberSoft,
              }}>
              <AppText variant="caption" tone="amber" style={{ width: 22, marginTop: 6 }}>
                {verse.n}
              </AppText>
              <AppText variant="verse" style={{ flex: 1 }}>
                {verse.text}
              </AppText>
            </View>
          </Pressable>
        );
      })}
      {selectedN != null ? (
        <View
          style={{
            marginTop: space.sm,
            marginBottom: space.md,
            padding: space.md,
            borderRadius: radius.lg,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: colors.line,
            gap: space.sm,
          }}>
          <AppText variant="label" tone="amber">
            Versículo {selectedN}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ActionChip label="Copiar" onPress={onCopy} testID="verse-copy" />
            <ActionChip label="Resaltar" onPress={onTogglePalette} active={paletteOpen} testID="verse-highlight" />
          </View>
          {paletteOpen ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              {HIGHLIGHT_SWATCHES.map((swatch) => (
                <PressScale
                  key={swatch.id}
                  testID={`highlight-color-${swatch.id}`}
                  onPress={() => onPickColor(swatch.id)}
                  accessibilityRole="button"
                  accessibilityLabel={swatch.label}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: swatch.chip,
                      borderWidth: 1,
                      borderColor: colors.charcoal,
                    }}
                  />
                </PressScale>
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <AppText variant="caption" tone="soft" style={{ marginTop: 4, marginBottom: space.sm }}>
          Tocá un versículo para copiarlo o resaltarlo.
        </AppText>
      )}
    </View>
  );
}

function ActionChip({
  label,
  onPress,
  active,
  testID,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityRole="button" testID={testID}>
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? colors.amber : colors.line,
          backgroundColor: active ? colors.creamDeep : 'transparent',
        }}>
        <AppText variant="ui" tone={active ? 'amber' : 'ink'}>
          {label}
        </AppText>
      </View>
    </PressScale>
  );
}
