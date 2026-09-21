import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import type { HeartVerse, Member } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  verses: HeartVerse[];
  members: Member[];
  selfId: string;
};

export function HeartMural({ verses, members, selfId }: Props) {
  const { colors } = useTheme();
  if (verses.length === 0) {
    return (
      <EmptyState
        kicker="Versículos del corazón"
        title="El mural todavía está en blanco."
        body="Cuando un versículo se te quede pegado —porque te acordó de ella, o de lo que hablaron— guardalo aquí. No es un chat: es una pared chiquita entre las dos."
      />
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {verses.map((verse) => {
        const author = members.find((member) => member.id === verse.authorId);
        const mine = verse.authorId === selfId;
        return (
          <View
            key={verse.id}
            style={{
              backgroundColor: colors.paper,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.line,
              borderLeftWidth: 3,
              borderLeftColor: mine ? colors.amber : colors.olive,
              padding: space.lg,
            }}>
            <AppText variant="label" tone={mine ? 'amber' : 'olive'}>
              {mine ? 'Vos' : (author?.name.split(' ')[0] ?? 'Ella')}
            </AppText>
            <AppText variant="verse" italic style={{ marginTop: 8 }}>
              «{verse.text}»
            </AppText>
            <AppText variant="caption" tone="amber" style={{ marginTop: 6 }}>
              {verse.reference}
            </AppText>
            {verse.note ? (
              <AppText variant="body" tone="soft" style={{ marginTop: space.sm }}>
                {verse.note}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
