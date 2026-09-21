import { AppText } from '@/components/ui/AppText';
import type { Member } from '@/lib/types';
import { colors, memberHues, radius } from '@/theme';
import { View } from 'react-native';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

type Props = {
  member: Member;
  completed: boolean;
};

export function MemberRow({ member, completed }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: memberHues[member.hue],
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText variant="ui" style={{ color: colors.white }}>
          {initials(member.name)}
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="ui">
          {member.name}
          {member.isSelf ? ' · vos' : ''}
        </AppText>
        <AppText variant="caption" tone={completed ? 'olive' : 'soft'}>
          {completed ? 'Leyó hoy' : 'Todavía no termina'}
        </AppText>
      </View>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: completed ? colors.olive : colors.line,
        }}
      />
    </View>
  );
}

export function Avatar({ name, hue }: { name: string; hue: Member['hue'] }) {
  return (
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: radius.lg,
        backgroundColor: memberHues[hue],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText variant="title" style={{ color: colors.white }}>
        {initials(name)}
      </AppText>
    </View>
  );
}
