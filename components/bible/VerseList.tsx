import { HIGHLIGHT_SWATCHES, highlightPaint, type HighlightColorId } from '@/lib/highlights';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressScale } from '@/components/motion/PressScale';
import type { BibleVerse } from '@/lib/bible/types';
import { space, useTheme } from '@/theme';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';

type ListProps = {
  verses: BibleVerse[];
  selectedNs: number[];
  colorsByVerse: Record<string, HighlightColorId>;
  onSelect: (verse: BibleVerse) => void;
};

export function VerseList({ verses, selectedNs, colorsByVerse, onSelect }: ListProps) {
  const { colors } = useTheme();
  const selectedSet = new Set(selectedNs);

  return (
    <View>
      {selectedNs.length === 0 ? (
        <AppText variant="caption" tone="soft" style={{ marginBottom: space.md, letterSpacing: 0 }}>
          Seleccioná varios · barra fija abajo
        </AppText>
      ) : null}
      {verses.map((verse) => {
        const selected = selectedSet.has(verse.n);
        const paint = highlightPaint(colorsByVerse[String(verse.n)]);
        return (
          <Pressable
            key={`${verse.n}-${verse.text.slice(0, 12)}`}
            testID={`verse-${verse.n}`}
            nativeID={`verse-${verse.n}`}
            onPress={() => onSelect(verse)}
            onLongPress={() => onSelect(verse)}
            delayLongPress={280}
            accessibilityRole="button"
            accessibilityLabel={`Versículo ${verse.n}`}
            accessibilityState={{ selected }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                marginBottom: 12,
                paddingVertical: selected ? 12 : 4,
                paddingHorizontal: selected ? 12 : 0,
                borderRadius: 18,
                backgroundColor: paint ?? (selected ? 'rgba(251, 191, 36, 0.12)' : 'transparent'),
                borderWidth: selected ? 1.5 : 0,
                borderColor: 'rgba(251, 191, 36, 0.5)',
              }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppText variant="caption" style={{ color: colors.amber, letterSpacing: 0, fontWeight: '700' }}>
                  {verse.n}
                </AppText>
              </View>
              <AppText variant="verse" style={{ flex: 1, color: selected ? colors.ink : colors.charcoalSoft }}>
                {verse.text}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

type BarProps = {
  selectedCount: number;
  paletteOpen: boolean;
  copied?: boolean;
  onCopy: () => void;
  onTogglePalette: () => void;
  onPickColor: (colorId: HighlightColorId) => void;
  onClose: () => void;
};

export function VerseActionBar({
  selectedCount,
  paletteOpen,
  copied,
  onCopy,
  onTogglePalette,
  onPickColor,
  onClose,
}: BarProps) {
  const { colors } = useTheme();
  const countLabel = selectedCount === 1 ? '1 seleccionado' : `${selectedCount} seleccionados`;

  return (
    <Animated.View
      entering={FadeInUp.duration(280).springify().damping(20).stiffness(220)}
      exiting={FadeOut.duration(160)}
      testID="verse-action-bar"
      nativeID="verse-action-bar"
      style={{
        marginHorizontal: 16,
        padding: 14,
        borderRadius: 24,
        backgroundColor: colors.creamDeep,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 16 },
        elevation: 16,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <AppText variant="caption" tone="amber" style={{ letterSpacing: 0.4 }}>
          {countLabel}
        </AppText>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View>
            <Button label={copied ? 'Copiado' : 'Copiar'} variant="ghost" compact onPress={onCopy} testID="verse-copy" />
          </View>
          <View>
            <Button
              label="Resaltar"
              compact
              onPress={onTogglePalette}
              testID="verse-highlight"
            />
          </View>
        </View>
      </View>
      <PressScale onPress={onClose} testID="verse-discard" accessibilityRole="button">
        <AppText variant="caption" tone="soft" style={{ letterSpacing: 0 }}>
          Descartar
        </AppText>
      </PressScale>
      {(paletteOpen || selectedCount > 0) ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {HIGHLIGHT_SWATCHES.map((swatch) => (
            <PressScale
              key={swatch.id}
              testID={`highlight-color-${swatch.id}`}
              onPress={() => onPickColor(swatch.id)}
              accessibilityRole="button"
              accessibilityLabel={swatch.label}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: swatch.chip,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              />
            </PressScale>
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
