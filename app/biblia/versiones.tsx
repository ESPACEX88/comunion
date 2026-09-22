import { BibleWarm } from '@/components/bible/BibleWarm';
import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useBible } from '@/features/bible/BibleProvider';
import { friendlyBibleName, friendlyBibleShort } from '@/lib/bible/pickBible';
import type { BibleSummary } from '@/lib/bible/types';
import { radius, space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

function EditionRow({
  edition,
  active,
  disabled,
  onPress,
}: {
  edition: BibleSummary;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        marginBottom: space.sm,
        paddingVertical: space.md,
        paddingHorizontal: space.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? colors.amber : colors.line,
        backgroundColor: active ? colors.paper : 'transparent',
        opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md }}>
        <AppText variant="subtitle" style={{ flex: 1 }}>
          {friendlyBibleName(edition)}
        </AppText>
        <AppText variant="caption" tone={active ? 'amber' : 'soft'}>
          {active ? 'Esta' : friendlyBibleShort(edition)}
        </AppText>
      </View>
      {edition.abbreviation ? (
        <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
          {edition.abbreviationLocal || edition.abbreviation}
        </AppText>
      ) : null}
    </Pressable>
  );
}

export default function BibliaVersionesScreen() {
  const { missingKey, ready, bible, editions, error, switching, selectEdition, ensureReady } = useBible();

  const choose = async (edition: BibleSummary) => {
    if (edition.id === bible?.id) {
      router.back();
      return;
    }
    await selectEdition(edition);
    router.back();
  };

  return (
    <Screen>
      <BackLink label="Biblia" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Edición
      </AppText>
      <AppText variant="display" style={{ marginTop: 8 }}>
        En qué español
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Si no elegís, se abre una Reina Valera 1909 (o la española libre que haya). Cada versión guarda sus capítulos aparte.
      </AppText>

      {missingKey ? (
        <View style={{ marginTop: space.xl }}>
          <MissingBibleKey />
        </View>
      ) : !ready ? (
        <BibleWarm title="Mirando las ediciones…" body="Solo las que tu clave de API.Bible puede leer." />
      ) : error && editions.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="Ediciones"
            title={error}
            body="Sin red no puedo listar. La que ya usabas sigue en este teléfono."
            actionLabel="Reintentar"
            onAction={() => void ensureReady()}
          />
        </View>
      ) : editions.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="Ediciones"
            title="No hay Biblias en español en esta cuenta."
            body="En el dashboard de API.Bible, autorizá una edición española (RVR1909 o dominio público)."
          />
        </View>
      ) : (
        <View style={{ marginTop: space.xl }}>
          {switching ? (
            <AppText variant="ui" tone="soft" style={{ marginBottom: space.md }}>
              Cambiando de edición. Los libros de esta versión se abren en un momento.
            </AppText>
          ) : null}
          {editions.map((edition) => (
            <EditionRow
              key={edition.id}
              edition={edition}
              active={edition.id === bible?.id}
              disabled={switching}
              onPress={() => void choose(edition)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
