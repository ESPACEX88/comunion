import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Member, PrayerRequest } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  requests: PrayerRequest[];
  members: Member[];
  friendName: string;
  selfId: string;
  onPray: (id: string) => void;
  justPrayedId: string | null;
};

export function PrayerList({ requests, members, friendName, selfId, onPray, justPrayedId }: Props) {
  const { colors } = useTheme();
  if (requests.length === 0) {
    return (
      <EmptyState
        kicker="Oración mutua"
        title="Todavía no hay pedidos."
        body="Cuando algo pese, dejalo aquí. No hace falta que sea largo: un nombre, una frase."
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {requests.map((request) => {
        const author = members.find((member) => member.id === request.authorId);
        const mine = request.authorId === selfId;
        const prayed = request.prayedBy.includes(selfId);
        const isFriend = !mine;
        const thanks = justPrayedId === request.id;
        return (
          <Card key={request.id} accent={mine ? 'amber' : 'olive'}>
            <AppText variant="label" tone={mine ? 'amber' : 'olive'}>
              {mine ? 'Ora por mí por…' : `${author?.name.split(' ')[0] ?? friendName} pide`}
            </AppText>
            <AppText variant="body" style={{ marginTop: 8 }}>
              {request.text}
            </AppText>
            {thanks ? (
              <View
                style={{
                  marginTop: space.md,
                  padding: space.sm,
                  backgroundColor: colors.creamDeep,
                  borderRadius: radius.sm,
                }}>
                <AppText variant="ui" tone="olive">
                  Gracias. Hoy oraste por {friendName}. El pedido no quedó solo.
                </AppText>
              </View>
            ) : null}
            {isFriend && !mine ? (
              <Button
                label={prayed ? 'Hoy oraste' : 'Ya oré por ti'}
                variant={prayed ? 'ghost' : 'olive'}
                disabled={prayed}
                style={{ marginTop: space.md }}
                onPress={() => onPray(request.id)}
              />
            ) : (
              <AppText variant="caption" tone="soft" style={{ marginTop: space.sm }}>
                {mine
                  ? 'Ella va a ver este pedido en su mesa.'
                  : 'Este pedido es de la mesa, no del dúo.'}
              </AppText>
            )}
          </Card>
        );
      })}
    </View>
  );
}
