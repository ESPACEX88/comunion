import { CheckInCard } from '@/components/duo/CheckInCard';
import { CheckInComposer } from '@/components/duo/CheckInComposer';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { GraceCard } from '@/components/duo/GraceCard';
import { ReadingCard } from '@/components/reading/ReadingCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { partnerFirstName } from '@/features/duo/labels';
import { formatLongDate, greeting } from '@/lib/date';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function HoyScreen() {
  const {
    state,
    today,
    soloStreak,
    personalTodayStatus,
    todayPersonalReading,
    personalPlan,
    todayStatus,
    todayGroupReading,
    groupPlan,
    groupToday,
    groupStreakCount,
    openReading,
    openPersonalReading,
    ensureSoloPlan,
    myCheckInToday,
    friendCheckInToday,
    specialFriend,
    saveCheckIn,
    members,
    isDuoActive,
    grace,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    saveDuoAnswer,
    useGraceDay,
    hasDuo,
    live,
    syncError,
    journalEntries,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { colors } = useTheme();

  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = partnerFirstName(specialFriend);
  const lastJournal = journalEntries[0] ?? null;

  const personalCta =
    !personalPlan || !todayPersonalReading
      ? 'Empezar Salmos en solitario'
      : personalTodayStatus === 'completado'
        ? 'Volver al pasaje'
        : personalTodayStatus === 'en_curso'
          ? 'Seguí tu lectura'
          : 'Empezá tu lectura';

  const duoCta =
    todayStatus === 'completado'
      ? 'Volver al pasaje'
      : todayStatus === 'en_curso'
        ? 'Seguí la lectura'
        : 'Empezá la lectura';

  const soloLine =
    personalTodayStatus === 'completado'
      ? `${soloStreak === 1 ? '1 día seguido' : `${soloStreak} días seguidos`}. Hoy ya está contado.`
      : soloStreak === 0
        ? 'Tu racha empieza cuando termines el pasaje.'
        : `${soloStreak} días seguidos. El día cuenta al terminar.`;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        {greeting()}
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        {state.userName.split(' ')[0] || 'Vos'}
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
        {formatLongDate(today)}
        {hasDuo ? ' · tu momento, y después juntas' : ' · tu espacio'}
      </AppText>
      {syncError ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {syncError}
        </AppText>
      ) : null}

      <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
        Tu momento
      </AppText>

      {personalPlan && todayPersonalReading ? (
        <View style={{ marginTop: space.md }}>
          <ReadingCard
            plan={personalPlan}
            day={todayPersonalReading}
            cta={personalCta}
            kicker="Plan personal"
            onPress={() => {
              openPersonalReading();
              router.push({ pathname: '/lectura', params: { plan: 'personal' } });
            }}
            onReferencePress={() =>
              router.push({ pathname: '/biblia/leer', params: { ref: todayPersonalReading.reference } })
            }
          />
        </View>
      ) : (
        <Card style={{ marginTop: space.md }}>
          <AppText variant="subtitle">Salmos en solitario</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            Siete días para vos. El dúo no hace falta para empezar.
          </AppText>
          <View style={{ height: space.md }} />
          <Button
            label="Empezar Salmos en solitario"
            onPress={async () => {
              await ensureSoloPlan();
              openPersonalReading();
              router.push({ pathname: '/lectura', params: { plan: 'personal' } });
            }}
          />
        </Card>
      )}

      <View
        style={{
          marginTop: space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}>
        <AppText variant="ui" tone="soft" style={{ flex: 1 }}>
          {soloLine}
        </AppText>
        {personalPlan ? <StatusBadge status={personalTodayStatus} /> : null}
      </View>

      <View style={{ marginTop: space.xl }}>
        <AppText variant="label" tone="amber">
          Tu check-in
        </AppText>
        <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
          {hasDuo
            ? 'Es tuyo. Si hay dúo, ella también lo ve en Hoy juntos.'
            : 'Solo vos lo ves. Si un día hay dúo, podés compartir el de ese día.'}
        </AppText>
        {myCheckInToday ? (
          <View style={{ marginTop: space.md }}>
            <CheckInCard checkIn={myCheckInToday} member={self} kicker="Solo tuyo" />
          </View>
        ) : (
          <View style={{ marginTop: space.md }}>
            <CheckInComposer
              submitLabel="Dejar mi check-in"
              hint={hasDuo ? 'Una línea alcanza. Tu dúo también la ve.' : 'Una línea alcanza. Es para vos.'}
              onSave={saveCheckIn}
            />
          </View>
        )}
      </View>

      <Pressable onPress={() => router.push('/diario')} style={{ marginTop: space.xl }}>
        <AppText variant="label" tone="olive">
          Diario
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          {lastJournal
            ? lastJournal.title || lastJournal.body.slice(0, 72)
            : 'Escribí lo que no va al dúo. Queda solo entre vos y Él.'}
        </AppText>
      </Pressable>

      <Pressable onPress={() => router.push('/biblia')} style={{ marginTop: space.xl }}>
        <AppText variant="label" tone="olive">
          Biblia
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          Leer la Biblia. Libros, capítulos y el texto completo.
        </AppText>
      </Pressable>

      {hasDuo ? (
        <View style={{ marginTop: space.xxl }}>
          <AppText variant="label" tone="olive">
            Juntos
          </AppText>
          {live && specialFriend.id === 'pending' ? (
            <Card accent="olive" style={{ marginTop: space.md }}>
              <AppText variant="label" tone="olive">
                Esperando a tu dúo
              </AppText>
              <AppText variant="subtitle" style={{ marginTop: 8 }}>
                Código {state.group.inviteCode}
              </AppText>
              <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
                Compartilo. Mientras, tu momento de hoy ya cuenta.
              </AppText>
            </Card>
          ) : (
            <View style={{ marginTop: space.md }}>
              <ReadingCard
                plan={groupPlan}
                day={todayGroupReading}
                cta={duoCta}
                kicker="De a dos"
                onPress={() => {
                  openReading();
                  router.push({ pathname: '/lectura', params: { plan: 'group' } });
                }}
                onReferencePress={() =>
                  router.push({ pathname: '/biblia/leer', params: { ref: todayGroupReading.reference } })
                }
              />
            </View>
          )}

          <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />

          {friendCheckInToday ? (
            <View style={{ marginTop: space.lg }}>
              <CheckInCard
                checkIn={friendCheckInToday}
                member={specialFriend}
                kicker={`${friendName} hoy`}
              />
            </View>
          ) : null}

          {isDuoActive && todayGroupReading.prompt && todayStatus === 'completado' && !myDuoAnswerToday ? (
            <View style={{ marginTop: space.xl }}>
              <DuoQuestionCard
                question={todayGroupReading.prompt}
                unlocked
                myAnswer={myDuoAnswerToday}
                friendAnswer={friendDuoAnswerToday}
                friendName={friendName}
                onSave={saveDuoAnswer}
              />
            </View>
          ) : null}

          <Pressable onPress={() => router.push('/(tabs)/grupo')} style={{ marginTop: space.xl }}>
            <AppText variant="label" tone="olive">
              Nosotros
            </AppText>
            <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
              {groupToday.allDone
                ? `Hoy leyeron juntas · racha ${groupStreakCount}`
                : `${groupToday.done} de ${groupToday.total} leyeron hoy. Oración y mural con ${friendName}.`}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}
