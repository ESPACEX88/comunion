import { createChannelHub, type BindChannel } from '@/lib/realtimeHub';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type { BindChannel };

const defaultHub = createChannelHub(() => getSupabase());

export function subscribeSharedChannel(key: string, bind: BindChannel, onChange: () => void): () => void {
  if (!isSupabaseConfigured()) return () => undefined;
  try {
    return defaultHub.subscribe(key, bind, onChange);
  } catch {
    return () => undefined;
  }
}

export function subscribeGroupLive(groupId: string, onChange: () => void): () => void {
  return subscribeSharedChannel(
    `group:${groupId}`,
    (channel, ping) =>
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_plan_completions' }, ping)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_prayers', filter: `group_id=eq.${groupId}` },
          ping,
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_prayer_marks' }, ping)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_verse_comments', filter: `group_id=eq.${groupId}` },
          ping,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_challenges', filter: `group_id=eq.${groupId}` },
          ping,
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_challenge_checkins' }, ping)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` },
          ping,
        ),
    onChange,
  );
}

export function subscribeDuoLive(
  duoId: string,
  planId: string | null | undefined,
  onChange: () => void,
): () => void {
  return subscribeSharedChannel(
    `duo:${duoId}:${planId ?? ''}`,
    (channel, ping) => {
      let next = channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'check_ins', filter: `duo_id=eq.${duoId}` },
          ping,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'prayers', filter: `duo_id=eq.${duoId}` },
          ping,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'heart_verses', filter: `duo_id=eq.${duoId}` },
          ping,
        );
      if (planId) {
        next = next
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'plan_completions', filter: `plan_id=eq.${planId}` },
            ping,
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'plan_answers', filter: `plan_id=eq.${planId}` },
            ping,
          );
      }
      return next;
    },
    onChange,
  );
}
