import { AppText } from '@/components/ui/AppText';
import { space } from '@/theme';
import { View } from 'react-native';

export function BibleWarm({ title, body }: { title: string; body?: string }) {
  return (
    <View style={{ marginTop: space.xl, paddingVertical: space.md }}>
      <AppText variant="subtitle">{title}</AppText>
      {body ? (
        <AppText variant="body" tone="soft" style={{ marginTop: 10 }}>
          {body}
        </AppText>
      ) : null}
    </View>
  );
}
