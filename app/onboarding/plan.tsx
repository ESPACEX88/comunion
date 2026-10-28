import { Redirect } from 'expo-router';

/** El plan de grupo se siembra al crear el grupo. */
export default function OnboardingPlan() {
  return <Redirect href="/onboarding/grupo" />;
}
