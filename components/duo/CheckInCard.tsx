import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { moodLabel } from '@/features/duo/moods';
import type { CheckIn, Member } from '@/lib/types';
import { colors, memberHues, space } from '@/theme';
import { View } from 'react-native';

type Props = {
  checkIn: CheckIn;
  member: Member;
  kicker?: string;
};

export function CheckInCard({ checkIn, member, kicker }: Props) {
  const initial = member.name.trim().charAt(0).toUpperCase() || '·';
  return (
    <Card accent={member.isSelf ? 'amber' : 'olive'}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: memberHues[member.hue],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AppText variant="ui" style={{ color: colors.white }}>
            {initial}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label" tone={member.isSelf ? 'amber' : 'olive'}>
            {kicker ?? (member.isSelf ? 'Tu check-in' : `${member.name.split(' ')[0]} hoy`)}
          </AppText>
          <AppText variant="subtitle" style={{ marginTop: 2 }}>
            {moodLabel(checkIn.mood)}
          </AppText>
        </View>
      </View>
      {checkIn.note ? (
        <AppText variant="body" italic tone="soft" style={{ marginTop: space.sm }}>
          «{checkIn.note}»
        </AppText>
      ) : (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.sm }}>
          Sin palabras hoy. El ánimo basta.
        </AppText>
      )}
    </Card>
  );
}
