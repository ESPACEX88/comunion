import { CheckInCard } from '@/components/duo/CheckInCard';
import { CheckInComposer } from '@/components/duo/CheckInComposer';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { space } from '@/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function CheckInScreen() {
  const { members, myCheckInToday, saveCheckIn, hasDuo } = useAppState();
  const self = members.find((member) => member.isSelf) ?? members[0];

  return (
    <Screen>
      <BackLink label="Hoy" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Check-in
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Cómo te encontró hoy
      </AppText>
      <Ornament />
      {myCheckInToday ? (
        <View style={{ marginTop: space.md }}>
          <CheckInCard checkIn={myCheckInToday} member={self} kicker="Hoy" />
        </View>
      ) : (
        <View style={{ marginTop: space.md }}>
          <CheckInComposer
            submitLabel="Dejar mi check-in"
            hint={hasDuo ? 'Una línea alcanza. Tu dúo también la ve.' : 'Una línea alcanza. Es para vos.'}
            onSave={async (mood, note) => {
              await saveCheckIn(mood, note);
              router.back();
            }}
          />
        </View>
      )}
    </Screen>
  );
}
