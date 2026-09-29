import { AppText } from '@/components/ui/AppText';
import type { Member } from '@/lib/types';
import { memberHues, radius, useTheme } from '@/theme';
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
  const { colors } = useTheme();
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

export function Avatar({ name, hue, size = 64 }: { name: string; hue: Member['hue']; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size > 48 ? radius.lg : size / 2,
        backgroundColor: memberHues[hue],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText variant={size > 48 ? 'title' : 'ui'} style={{ color: colors.white }}>
        {initials(name)}
      </AppText>
    </View>
  );
}
