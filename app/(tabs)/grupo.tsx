import { MemberRow } from '@/components/group/MemberRow';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { formatTime } from '@/lib/date';
import { colors, radius, space } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function GrupoScreen() {
  const { state, members, groupToday, groupStreakCount, postNote } = useAppState();
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState('');

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Grupo
      </AppText>
      <AppText variant="display" style={{ marginTop: 6 }}>
        {state.group.name}
      </AppText>
      <Ornament />
      <Card accent="none">
        <AppText variant="label" tone="amber">
          Código de invitación
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
            gap: space.md,
          }}>
          <AppText variant="title">{state.group.inviteCode}</AppText>
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
        <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
          En el mock no hay servidor: cualquiera con el código «entra» a esta mesa local.
        </AppText>
      </Card>
      <View style={{ height: space.lg }} />
      <StreakMark
        count={groupStreakCount}
        label="Racha compartida"
        hint={
          groupToday.allDone
            ? 'Hoy el grupo está completo. La racha suma.'
            : `${groupToday.done} de ${groupToday.total} leyeron hoy. Falta que terminen todos.`
        }
      />
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Quién leyó hoy
      </AppText>
      <View style={{ marginTop: 4 }}>
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            completed={groupToday.completedIds.includes(member.id)}
          />
        ))}
      </View>
      <View style={{ height: space.md }} />
      <AppText variant="label" tone="amber">
        Hilo del grupo
      </AppText>
      <View style={{ height: space.sm }} />
      {state.thread.length === 0 ? (
        <EmptyState
          kicker="Notas cortas"
          title="El hilo está en silencio."
          body="Cuando termines de leer, dejá un versículo o una línea. A veces eso basta para acompañar a alguien que hoy le cuesta abrir la Escritura."
        />
      ) : (
        <View style={{ gap: 10 }}>
          {state.thread.map((message) => {
            const author = members.find((m) => m.id === message.authorId);
            return (
              <View
                key={message.id}
                style={{
                  backgroundColor: colors.paper,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: space.md,
                }}>
                <AppText variant="label" tone="olive">
                  {author?.name ?? 'Alguien'} · {formatTime(message.createdAt)}
                </AppText>
                <AppText variant="body" style={{ marginTop: 6 }}>
                  {message.text}
                </AppText>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ height: space.md }} />
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Una nota corta o un versículo…"
        placeholderTextColor={colors.oliveSoft}
        multiline
        style={{
          minHeight: 72,
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
      <Button
        label="Dejar en el hilo"
        variant="olive"
        style={{ marginTop: 10 }}
        disabled={!note.trim()}
        onPress={() => {
          postNote(note);
          setNote('');
        }}
      />
    </Screen>
  );
}
