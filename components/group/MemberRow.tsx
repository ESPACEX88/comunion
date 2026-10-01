import { AppText } from '@/components/ui/AppText';
import type { Member } from '@/lib/types';
import { memberHues, useTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
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
  const letter = (
    <AppText variant={size > 48 ? 'title' : 'ui'} style={{ color: '#FFFCF6' }}>
      {initials(name) || '·'}
    </AppText>
  );
  if (size > 48) {
    return (
      <LinearGradient
        colors={['#F97316', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {letter}
      </LinearGradient>
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: memberHues[hue],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {letter}
    </View>
  );
}
