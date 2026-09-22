import { VerseOfDayCard } from '@/components/bible/VerseOfDayCard';
import { Enter } from '@/components/motion/Enter';
import { HubEntry } from '@/components/group/HubEntry';
import { MemberRow } from '@/components/group/MemberRow';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { partnerFirstName } from '@/features/duo/labels';
import { sharedVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { space } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
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
    todayStatus,
    openReading,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const [copied, setCopied] = useState(false);
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
          <AppText variant="label" tone="olive">
            Nosotros
          </AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            Todavía no hay dúo
          </AppText>
        </Enter>
        <Ornament />
        <AppText variant="body" tone="soft">
          Hoy ya es tu espacio. Cuando quieras leer con alguien, creá el dúo o uníte con un código.
        </AppText>
        <View style={{ height: space.xl }} />
        <Button label="Crear o unirme a un dúo" onPress={() => router.push('/onboarding/grupo')} />
        <Button
          label="Volver a Hoy"
          variant="ghost"
          style={{ marginTop: 10 }}
          onPress={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Enter>
        <AppText variant="label" tone="olive">
          Nosotros
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
      <View style={{ marginTop: space.xl }}>
        <HubEntry
          kicker="Lectura de a dos"
          title={todayGroupReading.reference}
          hint={
            todayStatus === 'completado'
              ? `Hoy ya leyeron ${todayGroupReading.title.toLowerCase()}.`
              : `${groupPlan.title} · día ${todayGroupReading.dayNumber} de ${groupPlan.days.length}`
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
      </View>
      <View style={{ marginTop: space.xl }}>
        <AppText variant="label" tone="soft">
          Invitación
        </AppText>
        <View
          style={{
            marginTop: space.md,
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
      </View>
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
    </Screen>
  );
}
