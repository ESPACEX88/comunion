import { CURRENT_USER_ID } from '@/features/plans/content';
import type { Member } from '@/lib/types';

export const MOCK_FRIENDS: Member[] = [
  { id: 'ana', name: 'Ana Morales', hue: 'olive' },
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
 * En el mock, las amigas ya terminaron HOY y también los días que vos
 * ya tenés completos. Así el grupo espera tu lectura de hoy
 * («3 de 4 leyeron hoy») y la racha compartida puede crecer con la tuya.
 */
export function mockFriendCompletions(dates: string[]): Record<string, string[]> {
  return Object.fromEntries(MOCK_FRIENDS.map((friend) => [friend.id, dates]));
}
