import { HeartMural } from '@/components/duo/HeartMural';
import { CheckInCard } from '@/components/duo/CheckInCard';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { GraceCard } from '@/components/duo/GraceCard';
import { PrayerList } from '@/components/duo/PrayerList';
import { MemberRow } from '@/components/group/MemberRow';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { PRAYER_MAX } from '@/features/duo/moods';
import { partnerFirstName } from '@/features/duo/labels';
import { colors, radius, space } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function GrupoScreen() {
  const {
    state,
    members,
    groupToday,
    groupStreakCount,
    specialFriend,
    myCheckInToday,
    friendCheckInToday,
    prayerRequests,
    heartVerses,
    addPrayerRequest,
    markPrayed,
    todayGroupReading,
    todayStatus,
    isDuoActive,
    grace,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    saveDuoAnswer,
    useGraceDay,
    live,
    selfId,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const [copied, setCopied] = useState(false);
  const [prayer, setPrayer] = useState('');
  const [justPrayedId, setJustPrayedId] = useState<string | null>(null);
  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = partnerFirstName(specialFriend);
  const rest = members.filter((member) => !member.isSelf && !member.isSpecialFriend);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        Nosotros
      </AppText>
      <AppText variant="display" style={{ marginTop: 6 }}>
        Vos y {friendName}
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
        {live
          ? `Código ${state.group.inviteCode}. ${
              specialFriend.id === 'pending'
                ? 'Todavía falta que se una.'
                : `Están en un plan de a dos con ${friendName}.`
            }`
          : `Dentro de ${state.group.name}. El dúo es lo íntimo; la mesa, el marco.${
              isDuoActive ? ' Están en un plan de a dos.' : ''
            }`}
      </AppText>
      <Ornament />
      <View style={{ gap: space.sm }}>
        {myCheckInToday ? (
          <CheckInCard checkIn={myCheckInToday} member={self} />
        ) : (
          <Card accent="none">
            <AppText variant="subtitle">Hoy todavía no dejaste tu check-in.</AppText>
            <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
              Cuando termines la lectura, aparece en Hoy.
            </AppText>
          </Card>
        )}
        {friendCheckInToday ? (
          <CheckInCard checkIn={friendCheckInToday} member={specialFriend} kicker={`${friendName} hoy`} />
        ) : (
          <Card accent="none">
            <AppText variant="subtitle">
              {specialFriend.id === 'pending'
                ? 'Todavía no se unió nadie.'
                : `${friendName} todavía no dejó el check-in de hoy.`}
            </AppText>
          </Card>
        )}
      </View>
      <View style={{ height: space.lg }} />
      <StreakMark
        count={groupStreakCount}
        label="Racha compartida"
        compact
        hint={
          grace.kind === 'offer'
            ? 'Ayer se quedó. La gracia de esta semana puede sostener la racha de las dos.'
            : grace.kind === 'retomar'
              ? 'Esta semana ya usaron la gracia. Hoy, al terminar, retoman juntas en 1.'
              : groupToday.allDone
                ? `Hoy cerraron juntas. La racha suma.`
                : `${groupToday.done} de ${groupToday.total} leyeron hoy en la mesa.`
        }
      />
      <View style={{ height: space.md }} />
      <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />
      {isDuoActive && todayGroupReading.prompt ? (
        <View style={{ marginTop: space.md }}>
          <DuoQuestionCard
            question={todayGroupReading.prompt}
            unlocked={todayStatus === 'completado'}
            myAnswer={myDuoAnswerToday}
            friendAnswer={friendDuoAnswerToday}
            friendName={friendName}
            onSave={saveDuoAnswer}
          />
        </View>
      ) : null}
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Oración mutua
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 4, marginBottom: space.sm }}>
        «Estoy orando por…» y «Ora por mí por…». Un pedido corto. Un «ya oré» honesto.
      </AppText>
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
      <View style={{ height: space.md }} />
      <AppText variant="label" tone="amber">
        Ora por mí por…
      </AppText>
      <TextInput
        value={prayer}
        onChangeText={(value) => setPrayer(value.slice(0, PRAYER_MAX))}
        placeholder="Algo concreto, sin discurso."
        placeholderTextColor={colors.oliveSoft}
        maxLength={PRAYER_MAX}
        multiline
        style={{
          minHeight: 72,
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.paper,
          borderRadius: radius.md,
          padding: space.md,
          fontFamily: 'Literata_400Regular',
          fontSize: 16,
          color: colors.ink,
          textAlignVertical: 'top',
        }}
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
        {prayer.length}/{PRAYER_MAX}
      </AppText>
      <Button
        label="Dejar el pedido"
        variant="olive"
        style={{ marginTop: 10 }}
        disabled={!prayer.trim()}
        onPress={() => {
          addPrayerRequest(prayer);
          setPrayer('');
        }}
      />
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Versículos del corazón
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 4, marginBottom: space.sm }}>
        No es el hilo de la mesa. Es el mural de las dos: un versículo y por qué se quedó.
      </AppText>
      <HeartMural verses={heartVerses} members={members} selfId={selfId} />
      <View style={{ height: space.xl }} />
      <AppText variant="label" tone="soft">
        Invitación
      </AppText>
      <AppText variant="caption" tone="soft" style={{ marginTop: 6, marginBottom: space.sm }}>
        {live
          ? 'Compartí el código para que se una la otra. El dúo admite dos personas.'
          : `Código y los demás de ${state.group.name}. El dúo sigue arriba.`}
      </AppText>
      <Card accent="none">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.md,
          }}>
          <View>
            <AppText variant="label" tone="amber">
              Invitación
            </AppText>
            <AppText variant="title">{state.group.inviteCode}</AppText>
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
      </Card>
      <View style={{ marginTop: 4 }}>
          <MemberRow
            member={self}
            completed={groupToday.completedIds.includes(selfId)}
          />
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
