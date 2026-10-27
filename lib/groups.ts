import {
  GROUP_CHALLENGES,
  challengeById,
  rotatingChallenge,
  type GroupColorId,
} from '@/features/groups/challenges';
import { PSALMS_PLAN } from '@/features/plans/content';
import { todayKey, weekStartMonday } from '@/lib/date';
import { getSupabase } from '@/lib/supabase';

export function groupInviteMessage(name: string, code: string) {
  return `Te invito al grupo «${name}» en Comunión. Código: ${code}\nAbrí la app → Grupo → Tengo un código.`;
}

function explain(error: { message: string } | null, fallback: string) {
  return error?.message ?? fallback;
}

async function currentUserId() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error('No hay sesión.');
  return data.user.id;
}

export type GroupSummary = {
  id: string;
  name: string;
  emoji: string;
  color: GroupColorId;
  inviteCode: string;
  role: 'owner' | 'member';
  memberCount: number;
};

export type GroupMember = {
  userId: string;
  role: 'owner' | 'member';
  name: string;
  joinedAt: string;
};

export type GroupPrayer = {
  id: string;
  authorId: string;
  body: string;
  anonymous: boolean;
  answered: boolean;
  createdAt: string;
  prayedBy: string[];
};

export type GroupComment = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  dayKey: string;
};

export type GroupChallenge = {
  id: string;
  weekStart: string;
  key: string;
  title: string;
  body: string;
  target: number;
  checkins: Record<string, number>;
};

export type GroupBundle = {
  group: GroupSummary;
  members: GroupMember[];
  plan: { id: string; title: string; startsOn: string; days: number } | null;
  completions: { userId: string; dayNumber: number; completedOn: string }[];
  prayers: GroupPrayer[];
  comments: GroupComment[];
  challenge: GroupChallenge | null;
};

export async function createGroup(name: string, emoji: string, color: GroupColorId) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('create_group', {
    p_name: name,
    p_emoji: emoji,
    p_color: color,
  });
  if (error || !data) throw new Error(explain(error, 'No se pudo crear el grupo.'));
  await ensureGroupPsalmsPlan(data.id);
  try {
    await ensureWeekChallenge(data.id);
  } catch {
    // El owner lo elige al abrir el grupo.
  }
  return data;
}

export async function joinGroup(code: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('join_group', { p_code: code.trim().toUpperCase() });
  if (error || !data) throw new Error(explain(error, 'No se pudo unir al grupo.'));
  return data;
}

export async function leaveGroup(groupId: string) {
  const { error } = await getSupabase().rpc('leave_group', { p_group_id: groupId });
  if (error) throw new Error(explain(error, 'No se pudo salir del grupo.'));
}

export async function removeGroupMember(groupId: string, userId: string) {
  const { error } = await getSupabase().rpc('remove_group_member', {
    p_group_id: groupId,
    p_user_id: userId,
  });
  if (error) throw new Error(explain(error, 'No se pudo sacar a esa persona.'));
}

export async function rotateGroupCode(groupId: string): Promise<string> {
  const { data, error } = await getSupabase().rpc('rotate_group_code', { p_group_id: groupId });
  if (error || !data) throw new Error(explain(error, 'No se pudo renovar el código.'));
  return data;
}

export async function ensureGroupPsalmsPlan(groupId: string): Promise<string> {
  const supabase = getSupabase();
  const { data: existing, error: existingError } = await supabase
    .from('group_plans')
    .select('id')
    .eq('group_id', groupId)
    .eq('is_active', true)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) return existing.id;

  const { data: plan, error: planError } = await supabase
    .from('group_plans')
    .insert({
      group_id: groupId,
      title: 'Salmos en grupo',
      description: PSALMS_PLAN.description,
      days: PSALMS_PLAN.days.length,
      starts_on: todayKey(),
      is_active: true,
    })
    .select('id')
    .single();
  if (planError || !plan) {
    const { data: raced } = await supabase
      .from('group_plans')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .maybeSingle();
    if (raced) return raced.id;
    throw new Error(explain(planError, 'No se pudo crear el plan del grupo.'));
  }

  const { error: daysError } = await supabase.from('group_plan_days').insert(
    PSALMS_PLAN.days.map((day) => ({
      plan_id: plan.id,
      day_number: day.dayNumber,
      scripture_ref: day.reference,
      prompt: day.prompt ?? null,
    })),
  );
  if (daysError) throw new Error(daysError.message);
  return plan.id;
}

export async function listMyGroups(): Promise<GroupSummary[]> {
  const supabase = getSupabase();
  const userId = await currentUserId();
  const { data: memberships, error } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', userId);
  if (error) throw new Error(explain(error, 'No se pudieron cargar tus grupos.'));
  if (!memberships?.length) return [];

  const ids = memberships.map((row) => row.group_id);
  const [{ data: groups, error: groupError }, { data: counts, error: countError }] = await Promise.all([
    supabase.from('groups').select('id, name, emoji, color, invite_code').in('id', ids),
    supabase.from('group_members').select('group_id').in('group_id', ids),
  ]);
  if (groupError) throw new Error(groupError.message);
  if (countError) throw new Error(countError.message);

  const countBy = new Map<string, number>();
  for (const row of counts ?? []) {
    countBy.set(row.group_id, (countBy.get(row.group_id) ?? 0) + 1);
  }
  const roleBy = new Map(memberships.map((row) => [row.group_id, row.role]));

  return (groups ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color as GroupColorId,
    inviteCode: row.invite_code,
    role: (roleBy.get(row.id) === 'owner' ? 'owner' : 'member') as 'owner' | 'member',
    memberCount: countBy.get(row.id) ?? 0,
  }));
}

export async function loadGroupBundle(groupId: string): Promise<GroupBundle | null> {
  const supabase = getSupabase();
  const weekStart = weekStartMonday(todayKey());
  const today = todayKey();

  const [groupRes, membersRes, planRes, prayersRes, commentsRes, challengeRes] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).maybeSingle(),
    supabase.from('group_members').select('user_id, role, joined_at').eq('group_id', groupId),
    supabase.from('group_plans').select('*').eq('group_id', groupId).eq('is_active', true).maybeSingle(),
    supabase.from('group_prayers').select('*').eq('group_id', groupId).order('created_at', { ascending: false }).limit(80),
    supabase
      .from('group_verse_comments')
      .select('*')
      .eq('group_id', groupId)
      .eq('day_key', today)
      .order('created_at', { ascending: true }),
    supabase.from('group_challenges').select('*').eq('group_id', groupId).eq('week_start', weekStart).maybeSingle(),
  ]);

  if (groupRes.error) throw new Error(groupRes.error.message);
  if (!groupRes.data) return null;
  if (membersRes.error) throw new Error(membersRes.error.message);

  const memberRows = membersRes.data ?? [];
  const userIds = memberRows.map((row) => row.user_id);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);
  if (profileError) throw new Error(profileError.message);
  const nameById = new Map((profiles ?? []).map((row) => [row.id, row.display_name]));

  const selfId = await currentUserId();
  const selfRole = memberRows.find((row) => row.user_id === selfId)?.role === 'owner' ? 'owner' : 'member';

  let completions: GroupBundle['completions'] = [];
  if (planRes.data) {
    const { data: completionRows, error: completionError } = await supabase
      .from('group_plan_completions')
      .select('user_id, day_number, completed_on')
      .eq('plan_id', planRes.data.id);
    if (completionError) throw new Error(completionError.message);
    completions = (completionRows ?? []).map((row) => ({
      userId: row.user_id,
      dayNumber: row.day_number,
      completedOn: row.completed_on,
    }));
  }

  const prayerIds = (prayersRes.data ?? []).map((row) => row.id);
  let marks: { prayer_id: string; user_id: string }[] = [];
  if (prayerIds.length) {
    const { data: markRows, error: markError } = await supabase
      .from('group_prayer_marks')
      .select('prayer_id, user_id')
      .in('prayer_id', prayerIds);
    if (markError) throw new Error(markError.message);
    marks = markRows ?? [];
  }
  const marksByPrayer = new Map<string, string[]>();
  for (const mark of marks) {
    const list = marksByPrayer.get(mark.prayer_id) ?? [];
    list.push(mark.user_id);
    marksByPrayer.set(mark.prayer_id, list);
  }

  let challenge: GroupChallenge | null = null;
  if (challengeRes.data) {
    const { data: checkins, error: checkinError } = await supabase
      .from('group_challenge_checkins')
      .select('user_id, progress')
      .eq('challenge_id', challengeRes.data.id);
    if (checkinError) throw new Error(checkinError.message);
    const progress: Record<string, number> = {};
    for (const row of checkins ?? []) progress[row.user_id] = row.progress;
    challenge = {
      id: challengeRes.data.id,
      weekStart: challengeRes.data.week_start,
      key: challengeRes.data.challenge_key,
      title: challengeRes.data.title,
      body: challengeRes.data.body,
      target: challengeRes.data.target,
      checkins: progress,
    };
  }

  return {
    group: {
      id: groupRes.data.id,
      name: groupRes.data.name,
      emoji: groupRes.data.emoji,
      color: groupRes.data.color as GroupColorId,
      inviteCode: groupRes.data.invite_code,
      role: selfRole,
      memberCount: memberRows.length,
    },
    members: memberRows.map((row) => ({
      userId: row.user_id,
      role: row.role === 'owner' ? 'owner' : 'member',
      name: nameById.get(row.user_id) || 'Alguien',
      joinedAt: row.joined_at,
    })),
    plan: planRes.data
      ? {
          id: planRes.data.id,
          title: planRes.data.title,
          startsOn: planRes.data.starts_on,
          days: planRes.data.days,
        }
      : null,
    completions,
    prayers: (prayersRes.data ?? []).map((row) => ({
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      anonymous: row.is_anonymous,
      answered: row.is_answered,
      createdAt: row.created_at,
      prayedBy: marksByPrayer.get(row.id) ?? [],
    })),
    comments: (commentsRes.data ?? []).map((row) => ({
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      createdAt: row.created_at,
      dayKey: row.day_key,
    })),
    challenge,
  };
}

export async function markGroupReading(planId: string, dayNumber: number) {
  const userId = await currentUserId();
  const { error } = await getSupabase().from('group_plan_completions').insert({
    plan_id: planId,
    user_id: userId,
    day_number: dayNumber,
    completed_on: todayKey(),
  });
  if (error && !error.message.toLowerCase().includes('duplicate')) {
    throw new Error(explain(error, 'No se pudo marcar la lectura.'));
  }
}

export async function postGroupPrayer(groupId: string, body: string, anonymous: boolean) {
  const userId = await currentUserId();
  const { error } = await getSupabase().from('group_prayers').insert({
    group_id: groupId,
    author_id: userId,
    body: body.trim(),
    is_anonymous: anonymous,
  });
  if (error) throw new Error(explain(error, 'No se pudo publicar.'));
}

export async function togglePrayerMark(prayerId: string, prayed: boolean) {
  const userId = await currentUserId();
  const supabase = getSupabase();
  if (prayed) {
    const { error } = await supabase.from('group_prayer_marks').delete().eq('prayer_id', prayerId).eq('user_id', userId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from('group_prayer_marks').insert({ prayer_id: prayerId, user_id: userId });
  if (error) throw new Error(explain(error, 'No se pudo marcar.'));
}

export async function setPrayerAnswered(prayerId: string, answered: boolean) {
  const { error } = await getSupabase().from('group_prayers').update({ is_answered: answered }).eq('id', prayerId);
  if (error) throw new Error(error.message);
}

export async function deleteGroupPrayer(prayerId: string) {
  const { error } = await getSupabase().from('group_prayers').delete().eq('id', prayerId);
  if (error) throw new Error(error.message);
}

export async function postVerseComment(groupId: string, body: string) {
  const userId = await currentUserId();
  const { error } = await getSupabase().from('group_verse_comments').insert({
    group_id: groupId,
    day_key: todayKey(),
    author_id: userId,
    body: body.trim(),
  });
  if (error) throw new Error(explain(error, 'No se pudo comentar.'));
}

export async function deleteVerseComment(commentId: string) {
  const { error } = await getSupabase().from('group_verse_comments').delete().eq('id', commentId);
  if (error) throw new Error(error.message);
}

export async function ensureWeekChallenge(groupId: string) {
  const weekStart = weekStartMonday(todayKey());
  const supabase = getSupabase();
  const { data: existing, error } = await supabase
    .from('group_challenges')
    .select('id')
    .eq('group_id', groupId)
    .eq('week_start', weekStart)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (existing) return;
  await setWeekChallenge(groupId, rotatingChallenge(weekStart).id);
}

export async function setWeekChallenge(groupId: string, challengeKey: string) {
  const userId = await currentUserId();
  const def = challengeById(challengeKey);
  const weekStart = weekStartMonday(todayKey());
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('group_challenges')
    .select('id')
    .eq('group_id', groupId)
    .eq('week_start', weekStart)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('group_challenges')
      .update({
        challenge_key: def.id,
        title: def.title,
        body: def.body,
        target: def.target,
      })
      .eq('id', existing.id);
    if (error) throw new Error(explain(error, 'No se pudo cambiar el reto.'));
    return;
  }
  const { error } = await supabase.from('group_challenges').insert({
    group_id: groupId,
    week_start: weekStart,
    challenge_key: def.id,
    title: def.title,
    body: def.body,
    target: def.target,
    created_by: userId,
  });
  if (error) throw new Error(explain(error, 'No se pudo guardar el reto.'));
}

export async function upsertChallengeProgress(challengeId: string, progress: number) {
  const userId = await currentUserId();
  const { error } = await getSupabase().from('group_challenge_checkins').upsert({
    challenge_id: challengeId,
    user_id: userId,
    progress,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(explain(error, 'No se pudo marcar el reto.'));
}

export { GROUP_CHALLENGES };
