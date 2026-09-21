import { AppText } from '@/components/ui/AppText';
import { MOODS } from '@/features/duo/moods';
import type { MoodId } from '@/lib/types';
import { colors, radius } from '@/theme';
import { Pressable, View } from 'react-native';

type Props = {
  value: MoodId | null;
  onChange: (mood: MoodId) => void;
};

export function MoodChips({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {MOODS.map((mood) => {
        const active = value === mood.id;
        return (
          <Pressable
            key={mood.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={mood.label}
            onPress={() => onChange(mood.id)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: active ? colors.amber : colors.line,
              backgroundColor: active ? colors.charcoal : colors.paper,
            }}>
            <AppText variant="ui" style={{ color: active ? colors.amberSoft : colors.charcoal }}>
              {mood.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
