import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PressScale } from '@/components/motion/PressScale';
import { WEEKDAY_SUN_LABELS, weekDaysSunday } from '@/lib/date';
import { radius, space, useTheme } from '@/theme';
import { Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  streak: number;
  today: string;
  completedDays: string[];
  onContinue: () => void;
  onClose: () => void;
};

export function StreakModal({ visible, streak, today, completedDays, onContinue, onClose }: Props) {
  const { colors } = useTheme();
  const done = new Set(completedDays);
  const days = weekDaysSunday(today);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(160)}
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: space.lg,
        }}>
        <Animated.View
          entering={FadeInDown.duration(380).springify().damping(18).stiffness(200)}
          exiting={FadeOut.duration(140)}
          style={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: colors.paper,
            borderRadius: radius.lg,
            paddingHorizontal: space.lg,
            paddingTop: space.lg,
            paddingBottom: space.xl,
          }}>
          <PressScale
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            style={{ alignSelf: 'flex-end' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText variant="ui" tone="soft">
                ×
              </AppText>
            </View>
          </PressScale>

          <View style={{ alignItems: 'center', marginTop: space.sm }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.streakBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: colors.amber,
                  transform: [{ rotate: '45deg' }],
                  marginBottom: 6,
                }}
              />
              <AppText variant="caption" style={{ color: colors.amberSoft, letterSpacing: 0 }}>
                racha
              </AppText>
            </View>
            <AppText variant="numeral" style={{ marginTop: space.md, color: colors.ink }}>
              {streak}
            </AppText>
            <AppText variant="title" style={{ marginTop: 4, textAlign: 'center' }}>
              {streak === 1 ? '¡Un día seguido!' : '¡Racha de días!'}
            </AppText>
            <AppText variant="ui" tone="soft" style={{ marginTop: 8, textAlign: 'center' }}>
              Hoy cuenta. Podés seguir o cerrar cuando quieras.
            </AppText>
          </View>

          <View
            style={{
              marginTop: space.xl,
              padding: space.md,
              borderRadius: radius.lg,
              backgroundColor: colors.creamDeep,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            {days.map((day, index) => {
              const checked = done.has(day);
              const isToday = day === today;
              return (
                <View key={day} style={{ alignItems: 'center', width: 36 }}>
                  <AppText variant="caption" tone={isToday ? 'amber' : 'soft'}>
                    {WEEKDAY_SUN_LABELS[index]}
                  </AppText>
                  <View
                    style={{
                      marginTop: 8,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 1.5,
                      borderColor: checked ? colors.amber : colors.line,
                      backgroundColor: checked ? colors.amber : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {checked ? (
                      <AppText variant="caption" style={{ color: colors.white, fontSize: 11 }}>
                        ✓
                      </AppText>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <Button label="Continuar" style={{ marginTop: space.xl }} onPress={onContinue} />
          <Pressable onPress={onClose} hitSlop={8} style={{ marginTop: 12, alignItems: 'center' }}>
            <AppText variant="ui" tone="soft">
              Cerrar
            </AppText>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
