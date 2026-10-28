import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { AuroraOrb } from '@/components/ui/AuroraOrb';
import { Button } from '@/components/ui/Button';
import { GROUP_WHAT_IT_IS } from '@/features/groups/copy';
import { space } from '@/theme';
import { View } from 'react-native';

type Props = {
  kicker?: string;
  title?: string;
  onCreate: () => void;
  onJoin: () => void;
};

export function GroupWelcome({
  kicker = 'Grupo',
  title = 'Un grupo para leer juntos',
  onCreate,
  onJoin,
}: Props) {
  return (
    <Enter delay={80}>
      <View style={{ alignItems: 'center', paddingTop: space.lg }}>
        <AuroraOrb />
        <AppText variant="label" tone="amber" style={{ marginTop: space.md }}>
          {kicker}
        </AppText>
        <AppText variant="title" style={{ textAlign: 'center', marginTop: 8 }}>
          {title}
        </AppText>
        <AppText
          variant="ui"
          tone="soft"
          style={{ textAlign: 'center', marginTop: 10, maxWidth: 300, lineHeight: 22 }}>
          {GROUP_WHAT_IT_IS}
        </AppText>
      </View>
      <Button label="Crear un grupo" variant="solid" style={{ marginTop: space.xl }} onPress={onCreate} />
      <Button label="Tengo un código" variant="ghost" style={{ marginTop: 12 }} onPress={onJoin} />
    </Enter>
  );
}
