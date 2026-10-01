import { HIGHLIGHT_SWATCHES, highlightPaint, type HighlightColorId } from '@/lib/highlights';
import { AppText } from '@/components/ui/AppText';
import { PressScale } from '@/components/motion/PressScale';
import type { BibleVerse } from '@/lib/bible/types';
import { radius, space, useTheme } from '@/theme';
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
        <AppText variant="caption" tone="soft" style={{ marginBottom: space.sm }}>
          Tocá uno o varios versículos. La barra queda abajo, fija.
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
                gap: 14,
                marginBottom: 10,
                paddingVertical: 10,
                paddingHorizontal: 10,
                marginHorizontal: -10,
                borderRadius: radius.lg,
                backgroundColor: paint ?? (selected ? colors.creamDeep : 'transparent'),
                borderWidth: selected ? 1.5 : 0,
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

/** Barra flotante fija al pie del viewport. Nunca al final del capítulo. */
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
  const countLabel =
    selectedCount === 1 ? '1 versículo' : `${selectedCount} versículos`;

  return (
    <Animated.View
      entering={FadeInUp.duration(280).springify().damping(20).stiffness(220)}
      exiting={FadeOut.duration(160)}
      testID="verse-action-bar"
      nativeID="verse-action-bar"
      style={{
        marginHorizontal: space.md,
        padding: space.md,
        borderRadius: radius.xl,
        backgroundColor: colors.paper,
        borderWidth: 1,
        borderColor: colors.line,
        gap: space.sm,
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="label" tone="amber">
          {countLabel} seleccionados
        </AppText>
        <PressScale
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Descartar"
          testID="verse-discard">
          <AppText variant="ui" tone="soft">
            Descartar
          </AppText>
        </PressScale>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <ActionChip label={copied ? 'Copiado' : 'Copiar'} onPress={onCopy} testID="verse-copy" />
        <ActionChip
          label="Resaltar"
          onPress={onTogglePalette}
          active={paletteOpen}
          testID="verse-highlight"
        />
      </View>
      {paletteOpen ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          style={{ flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
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
        </Animated.View>
      ) : null}
    </Animated.View>
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
