import { PrayerList } from '@/components/duo/PrayerList';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { partnerFirstName } from '@/features/duo/labels';
import { PRAYER_MAX } from '@/features/duo/moods';
import { space } from '@/theme';
import { useState } from 'react';
import { View } from 'react-native';

export default function OracionScreen() {
  const { prayerRequests, addPrayerRequest, markPrayed, members, specialFriend, selfId } =
    useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const [prayer, setPrayer] = useState('');
  const [justPrayedId, setJustPrayedId] = useState<string | null>(null);
  const friendName = partnerFirstName(specialFriend);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <BackLink label="Nosotros" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Oración
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Ora por mí por…
      </AppText>
      <AppText variant="body" tone="soft" style={{ marginTop: space.sm }}>
        Un pedido corto. Un «ya oré» honesto. No hace falta discurso.
      </AppText>
      <Ornament />
      <PrayerList
        requests={prayerRequests}
        members={members}
        friendName={friendName}
        selfId={selfId}
        justPrayedId={justPrayedId}
        onPray={(id) => {
          markPrayed(id);
          setJustPrayedId(id);
        }}
      />
      <View style={{ height: space.xl }} />
      <AppText variant="label" tone="amber">
        Dejar un pedido
      </AppText>
      <Field
        value={prayer}
        onChangeText={(value) => setPrayer(value.slice(0, PRAYER_MAX))}
        placeholder="Algo concreto, sin discurso."
        maxLength={PRAYER_MAX}
        multiline
        tall
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
        {prayer.length}/{PRAYER_MAX}
      </AppText>
      <Button
        label="Dejar el pedido"
        variant="olive"
        style={{ marginTop: space.md }}
        disabled={!prayer.trim()}
        onPress={() => {
          addPrayerRequest(prayer);
          setPrayer('');
        }}
      />
    </Screen>
  );
}
