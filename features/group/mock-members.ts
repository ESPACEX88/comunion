import { CURRENT_USER_ID } from '@/features/plans/content';
import { addDays, inclusiveDayRange } from '@/lib/date';
import type { Member } from '@/lib/types';

export const MOCK_FRIENDS: Member[] = [
  { id: 'ana', name: 'Ana Morales', hue: 'olive', isSpecialFriend: true },
  { id: 'mateo', name: 'Mateo Ruiz', hue: 'terracotta' },
  { id: 'lucia', name: 'Lucía Méndez', hue: 'charcoal' },
];

export function membersWithSelf(userName: string): Member[] {
  return [
    { id: CURRENT_USER_ID, name: userName || 'Vos', hue: 'amber', isSelf: true },
    ...MOCK_FRIENDS,
  ];
}

/**
 * En el mock, Ana, Mateo y Lucía no saltan días: leen desde tu primer día
 * (o los últimos cuatro, si todavía no hay historial) hasta hoy. El grupo
 * espera tu lectura de hoy («3 de 4 leyeron hoy»). Si vos usás gracia,
 * ellas ya tienen ayer y la racha compartida puede puentease de verdad.
 */
export function friendReadingDates(userCompletedDates: string[], today: string): string[] {
  const past = userCompletedDates.filter((day) => day <= today).sort();
  const start = past[0] ?? addDays(today, -3);
  return inclusiveDayRange(start, today);
}

export function mockFriendCompletions(dates: string[]): Record<string, string[]> {
  return Object.fromEntries(MOCK_FRIENDS.map((friend) => [friend.id, dates]));
}
