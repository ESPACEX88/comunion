import { VerseOfDayCard } from '@/components/bible/VerseOfDayCard';
import { Enter } from '@/components/motion/Enter';
import { HubEntry } from '@/components/group/HubEntry';
import { MemberRow } from '@/components/group/MemberRow';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { AuroraOrb } from '@/components/ui/AuroraOrb';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { confirmLeaveDuo } from '@/features/duo/leaveConfirm';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { partnerFirstName } from '@/features/duo/labels';
import { sharedVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { planCaption } from '@/features/plans/content';
import { space, useTheme } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function GrupoScreen() {
  const {
    state,
    members,
    groupToday,
    groupStreakCount,
    specialFriend,
    prayerRequests,
    heartVerses,
    myCheckInToday,
    friendCheckInToday,
    live,
    hasDuo,
    selfId,
    today,
    todayGroupReading,
    groupPlan,
    groupProgress,
    todayStatus,
    openReading,
    leaveDuo,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { setPreference } = useTheme();
  const params = useLocalSearchParams<{ shot?: string }>();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (params.shot === 'aurora') setPreference('dark');
  }, [params.shot, setPreference]);
  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = partnerFirstName(specialFriend);
  const sharedRef = sharedVerseOfDayRef(today);
  const rest = members.filter((member) => !member.isSelf && !member.isSpecialFriend);
  const openPrayers = prayerRequests.filter((item) => item.prayedBy.length === 0).length;
  const checkInHint =
    myCheckInToday && friendCheckInToday
      ? 'Las dos ya dejaron cómo las encontró el texto.'
      : myCheckInToday
        ? `${friendName} todavía no dejó el suyo.`
        : 'Cuando terminen el pasaje, el ánimo queda aquí.';

  if (!hasDuo) {
    return (
      <Screen refreshing={refreshing} onRefresh={onRefresh}>
        <Enter>
          <AppText variant="label" tone="amber">
            Dúo
          </AppText>
        </Enter>
        <View style={{ alignItems: 'center', paddingTop: space.xl }}>
          <AuroraOrb />
          <AppText variant="title" style={{ textAlign: 'center' }}>
            Todavía no hay dúo
          </AppText>
          <AppText variant="ui" tone="soft" style={{ textAlign: 'center', marginTop: 8, maxWidth: 280 }}>
            Hoy ya es tu espacio. Cuando quieras leer con alguien, creá el dúo o uníte con un código.
          </AppText>
        </View>
        <View style={{ height: space.lg }} />
        <Button label="Crear o unirme a un dúo" variant="solid" onPress={() => router.push('/onboarding/grupo')} />
        <Button
          label="Tengo un código →"
          variant="inline"
          style={{ marginTop: 14 }}
          onPress={() => router.push('/onboarding/grupo')}
        />
        <Button
          label="Amigos"
          variant="ghost"
          style={{ marginTop: 10 }}
          onPress={() => router.push('/amigos')}
        />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Enter>
        <AppText variant="label" tone="olive">
          Dúo
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          Vos y {friendName}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
          {live
            ? specialFriend.id === 'pending'
              ? `Código ${state.group.inviteCode}. Todavía falta que se una.`
              : `${state.group.name} · un plan de a dos.`
            : `${state.group.name}. El dúo es lo íntimo.`}
        </AppText>
      </Enter>
      <Ornament />
      <Enter delay={90} style={{ marginBottom: space.xl }}>
        <VerseOfDayCard reference={sharedRef} kicker="Versículo de los dos" compact />
      </Enter>
      <StreakMark
        count={groupStreakCount}
        label="Racha compartida"
        compact
        hint={
          groupToday.allDone
            ? 'Hoy cerraron juntas. La racha suma.'
            : `${groupToday.done} de ${groupToday.total} leyeron hoy.`
        }
      />
      <SettingsCard title="De a dos" style={{ marginTop: space.xl }}>
        <HubEntry
          kicker="Lectura de a dos"
          title={todayGroupReading.reference}
          hint={
            todayStatus === 'completado'
              ? `Hoy ya leyeron ${todayGroupReading.title.toLowerCase()}.`
              : `${groupPlan.title} · ${planCaption(groupProgress)}`
          }
          onPress={() => {
            openReading();
            router.push({ pathname: '/lectura', params: { plan: 'group' } });
          }}
        />
        <HubEntry
          kicker="Oración"
          title="Pedidos de las dos"
          hint={
            prayerRequests.length === 0
              ? 'Todavía no hay pedidos. Un nombre, una frase.'
              : openPrayers === 0
                ? `${prayerRequests.length} ${prayerRequests.length === 1 ? 'pedido' : 'pedidos'}. Ya oraron por los de hoy.`
                : `${openPrayers} ${openPrayers === 1 ? 'pedido' : 'pedidos'} esperando un «ya oré».`
          }
          onPress={() => router.push('/nosotros/oracion')}
        />
        <HubEntry
          kicker="Mural del corazón"
          title="Versículos que se quedaron"
          hint={
            heartVerses.length === 0
              ? 'El mural está en blanco. Un versículo y por qué se pegó.'
              : `${heartVerses.length} ${heartVerses.length === 1 ? 'pieza' : 'piezas'} en la pared chiquita.`
          }
          onPress={() => router.push('/nosotros/mural')}
        />
        <HubEntry
          kicker="Hoy juntos"
          title="Check-ins y la pregunta"
          hint={checkInHint}
          onPress={() => router.push('/nosotros/checkins')}
        />
        <HubEntry
          kicker="Amigos"
          title="Tu red, más ancha"
          hint="El dúo es de a dos. Los amigos se suman con un código."
          onPress={() => router.push('/amigos')}
          last
        />
      </SettingsCard>
      <SettingsCard title="Invitación" style={{ marginTop: space.xl }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.md,
          }}>
          <View>
            <AppText variant="title">{state.group.inviteCode}</AppText>
            <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
              {live ? 'Para que se una la otra. El dúo admite dos.' : 'Código de esta mesa.'}
            </AppText>
          </View>
          <Button
            label={copied ? 'Copiado' : 'Copiar'}
            variant="ghost"
            onPress={async () => {
              await Clipboard.setStringAsync(state.group.inviteCode);
              setCopied(true);
            }}
            style={{ paddingVertical: 8, paddingHorizontal: 14 }}
          />
        </View>
      </SettingsCard>
      <View style={{ marginTop: space.lg }}>
        <MemberRow member={self} completed={groupToday.completedIds.includes(selfId)} />
        {specialFriend.id !== 'pending' ? (
          <MemberRow
            member={specialFriend}
            completed={groupToday.completedIds.includes(specialFriend.id)}
          />
        ) : null}
        {!live
          ? rest.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                completed={groupToday.completedIds.includes(member.id)}
              />
            ))
          : null}
      </View>
      <Button
        label="Salir del dúo"
        variant="ghost"
        testID="leave-duo"
        style={{ marginTop: space.xl }}
        onPress={() => confirmLeaveDuo(() => void leaveDuo())}
      />
    </Screen>
  );
}
