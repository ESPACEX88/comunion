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

