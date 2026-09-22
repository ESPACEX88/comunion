import { AppText } from '@/components/ui/AppText';
import { friendlyBibleName, friendlyBibleShort } from '@/lib/bible/pickBible';
import type { SelectedBible } from '@/lib/bible/types';
import { radius, space, useTheme } from '@/theme';
import { Pressable, View } from 'react-native';

type Props = {
  bible: SelectedBible | null;
  onPress: () => void;
};

export function VersionCard({ bible, onPress }: Props) {
  const { colors } = useTheme();
  const name = bible ? friendlyBibleName(bible) : 'Todavía no hay edición';
  const short = bible ? friendlyBibleShort(bible) : '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        marginTop: space.lg,
        paddingVertical: space.md,
        paddingHorizontal: space.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.paper,
        opacity: pressed ? 0.82 : 1,
      })}>
      <AppText variant="label" tone="amber">
        Versión
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
        <AppText variant="subtitle" style={{ flex: 1, paddingRight: space.sm }}>
          {name}
        </AppText>
        <AppText variant="ui" tone="amber">
          Cambiar
        </AppText>
      </View>
      <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
        {short ? `${short} · ` : ''}
        Lo que abras de esta edición queda en el teléfono. No se mezcla con otra versión.
      </AppText>
    </Pressable>
  );
}
