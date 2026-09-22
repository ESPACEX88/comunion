import { AppText } from '@/components/ui/AppText';
import type { BibleVerse } from '@/lib/bible/types';
import { View } from 'react-native';

export function VerseList({ verses }: { verses: BibleVerse[] }) {
  return (
    <View>
      {verses.map((verse) => (
        <View key={`${verse.n}-${verse.text.slice(0, 12)}`} style={{ flexDirection: 'row', gap: 14, marginBottom: 22 }}>
          <AppText variant="caption" tone="amber" style={{ width: 22, marginTop: 6 }}>
            {verse.n}
          </AppText>
          <AppText variant="verse" style={{ flex: 1 }}>
            {verse.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}
