import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { moodLabel } from '@/features/duo/moods';
import { formatLongDate } from '@/lib/date';
import { space } from '@/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function DiarioScreen() {
  const { journalEntries } = useAppState();

  return (
    <Screen>
      <BackLink label="Volver" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Diario
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Solo entre vos y Él
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Esto no aparece en Nosotros. Ni en el mural. Ni en el check-in del dúo.
      </AppText>
      <Button
        label="Escribir una entrada"
        style={{ marginTop: space.xl }}
        onPress={() => router.push('/diario/nueva')}
      />
      {journalEntries.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="En blanco"
            title="Todavía no hay páginas."
            body="Una fecha, un cuerpo. El título y el ánimo son opcionales."
          />
        </View>
      ) : (
        <View style={{ marginTop: space.xl, gap: space.lg }}>
          {journalEntries.map((entry) => (
            <View key={entry.id}>
              <AppText variant="label" tone="amber">
                {formatLongDate(entry.date)}
                {entry.mood ? ` · ${moodLabel(entry.mood)}` : ''}
              </AppText>
              {entry.title ? (
                <AppText variant="subtitle" style={{ marginTop: 6 }}>
                  {entry.title}
                </AppText>
              ) : null}
              <AppText variant="body" tone="soft" style={{ marginTop: 6 }}>
                {entry.body}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
