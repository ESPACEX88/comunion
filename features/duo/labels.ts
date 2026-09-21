import type { Member } from '@/lib/types';

export function partnerFirstName(member: Pick<Member, 'id' | 'name'>): string {
  if (member.id === 'pending') return 'tu dúo';
  const first = member.name.trim().split(/\s+/)[0];
  return first || 'tu dúo';
}
