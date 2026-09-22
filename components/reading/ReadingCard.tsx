import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { isDuoPlan } from '@/features/plans/content';
import type { Plan, PlanDay } from '@/lib/types';
import { space } from '@/theme';
import { Pressable, View } from 'react-native';

type Props = {
  plan: Plan;
  day: PlanDay;
  cta: string;
  kicker?: string;
  onPress: () => void;
  onReferencePress?: () => void;
};

export function ReadingCard({ plan, day, cta, kicker, onPress, onReferencePress }: Props) {
  return (
    <Card>
      <AppText variant="label" tone="amber">
        {kicker ?? (isDuoPlan(plan) ? 'Plan de a dos' : 'Lectura de hoy')} · {plan.title}
      </AppText>
      <View style={{ height: space.sm }} />
      <AppText variant="title">{day.title}</AppText>
      {onReferencePress ? (
        <Pressable onPress={onReferencePress} hitSlop={8} style={{ marginTop: 4 }}>
          <AppText variant="ui" tone="amber">
            {day.reference} · Día {day.dayNumber} de {plan.days.length}
          </AppText>
        </Pressable>
      ) : (
        <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
          {day.reference} · Día {day.dayNumber} de {plan.days.length}
        </AppText>
      )}
      <View style={{ marginVertical: space.md }}>
        <ProgressBar value={day.dayNumber} total={plan.days.length} />
      </View>
      <AppText variant="body" italic tone="soft">
        {day.teaser}
      </AppText>
      <View style={{ height: space.md }} />
      <Button label={cta} onPress={onPress} />
    </Card>
  );
}
