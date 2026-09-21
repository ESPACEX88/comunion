import { PSALMS_PLAN } from '@/features/plans/content';
import { todayKey } from '@/lib/date';
import { getSupabase } from '@/lib/supabase';
import type { MoodId } from '@/lib/types';

export type RemoteMember = {
  userId: string;
  role: string;
  displayName: string;
};

export type RemoteCompletion = {
  userId: string;
  dayNumber: number;
  completedOn: string;
  usedGrace: boolean;
};

export type RemoteAnswer = {
  userId: string;
  dayNumber: number;
  answer: string;
};

export type RemoteCheckIn = {
  id: string;
  userId: string;
  mood: string;
  note: string;
  checkedOn: string;
};

export type RemotePrayer = {
  id: string;
  authorId: string;
  body: string;
  forPartner: boolean;
  isAnswered: boolean;
  createdAt: string;
};

export type RemoteHeart = {
  id: string;
  authorId: string;
  reference: string;
  text: string;
  note: string;
  createdAt: string;
};

export type DuoBundle = {
  duo: { id: string; name: string; inviteCode: string; createdBy: string };
  members: RemoteMember[];
  plan: {
    id: string;
    title: string;
    startsOn: string;
    days: number;
    description: string | null;
  } | null;
  planDays: { dayNumber: number; scriptureRef: string; prompt: string | null }[];
  completions: RemoteCompletion[];
  answers: RemoteAnswer[];
  checkIns: RemoteCheckIn[];
  prayers: RemotePrayer[];
  heartVerses: RemoteHeart[];
};

function explain(error: { message: string } | null, fallback: string) {
  return error?.message ?? fallback;
}

export async function createDuo(name: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('create_duo', { p_name: name });
  if (error || !data) throw new Error(explain(error, 'No se pudo crear el dúo.'));
  await ensurePsalmsPlan(data.id);
  return data;
}

export async function joinDuo(code: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('join_duo', { p_code: code });
  if (error || !data) throw new Error(explain(error, 'No se pudo unir al dúo.'));
  await ensurePsalmsPlan(data.id);
  return data;
}

export async function ensurePsalmsPlan(duoId: string): Promise<string> {
  const supabase = getSupabase();
  const { data: existing, error: existingError } = await supabase
    .from('plans')
    .select('id')
    .eq('duo_id', duoId)
    .eq('is_active', true)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) return existing.id;

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert({
      duo_id: duoId,
      title: PSALMS_PLAN.title,
      description: PSALMS_PLAN.description,
      days: PSALMS_PLAN.days.length,
      starts_on: todayKey(),
      grace_days_per_week: 1,
      is_active: true,
    })
    .select('id')
    .single();
  if (planError || !plan) throw new Error(explain(planError, 'No se pudo crear el plan.'));

  const { error: daysError } = await supabase.from('plan_days').insert(
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

export async function loadDuoBundle(userId: string): Promise<DuoBundle | null> {
  const supabase = getSupabase();
  const { data: membership, error: memError } = await supabase
    .from('duo_members')
    .select('duo_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (memError) throw new Error(memError.message);
  if (!membership) return null;

  const duoId = membership.duo_id;

  const [duoRes, membersRes, planRes, checkInsRes, prayersRes, heartRes] = await Promise.all([
    supabase.from('duos').select('*').eq('id', duoId).single(),
    supabase.from('duo_members').select('user_id, role').eq('duo_id', duoId),
    supabase.from('plans').select('*').eq('duo_id', duoId).eq('is_active', true).maybeSingle(),
    supabase.from('check_ins').select('*').eq('duo_id', duoId).order('checked_on', { ascending: false }),
    supabase.from('prayers').select('*').eq('duo_id', duoId).order('created_at', { ascending: false }),
    supabase.from('heart_verses').select('*').eq('duo_id', duoId).order('created_at', { ascending: false }),
  ]);

  if (duoRes.error || !duoRes.data) throw new Error(explain(duoRes.error, 'No se encontró el dúo.'));
  if (membersRes.error) throw new Error(membersRes.error.message);

  const userIds = (membersRes.data ?? []).map((row) => row.user_id);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);
  if (profileError) throw new Error(profileError.message);

  const nameById = new Map((profiles ?? []).map((row) => [row.id, row.display_name]));
  const members: RemoteMember[] = (membersRes.data ?? []).map((row) => ({
    userId: row.user_id,
    role: row.role,
    displayName: nameById.get(row.user_id) ?? 'Amiga',
  }));

  let planDays: DuoBundle['planDays'] = [];
  let completions: RemoteCompletion[] = [];
  let answers: RemoteAnswer[] = [];
  let plan: DuoBundle['plan'] = null;

  if (planRes.error) throw new Error(planRes.error.message);
  if (planRes.data) {
    plan = {
      id: planRes.data.id,
      title: planRes.data.title,
      startsOn: planRes.data.starts_on,
      days: planRes.data.days,
      description: planRes.data.description,
    };
    const [daysRes, completionsRes, answersRes] = await Promise.all([
      supabase.from('plan_days').select('*').eq('plan_id', plan.id).order('day_number'),
      supabase.from('plan_completions').select('*').eq('plan_id', plan.id),
      supabase.from('plan_answers').select('*').eq('plan_id', plan.id),
    ]);
    if (daysRes.error) throw new Error(daysRes.error.message);
    if (completionsRes.error) throw new Error(completionsRes.error.message);
    if (answersRes.error) throw new Error(answersRes.error.message);
    planDays = (daysRes.data ?? []).map((row) => ({
      dayNumber: row.day_number,
      scriptureRef: row.scripture_ref,
      prompt: row.prompt,
    }));
    completions = (completionsRes.data ?? []).map((row) => ({
      userId: row.user_id,
      dayNumber: row.day_number,
      completedOn: row.completed_on,
      usedGrace: row.used_grace,
    }));
    answers = (answersRes.data ?? []).map((row) => ({
      userId: row.user_id,
      dayNumber: row.day_number,
      answer: row.answer,
    }));
  }

  if (checkInsRes.error) throw new Error(checkInsRes.error.message);
  if (prayersRes.error) throw new Error(prayersRes.error.message);
  if (heartRes.error) throw new Error(heartRes.error.message);

  return {
    duo: {
      id: duoRes.data.id,
      name: duoRes.data.name,
      inviteCode: duoRes.data.invite_code,
      createdBy: duoRes.data.created_by,
    },
    members,
    plan,
    planDays,
    completions,
    answers,
    checkIns: (checkInsRes.data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      mood: row.mood,
      note: row.note ?? '',
      checkedOn: row.checked_on,
    })),
    prayers: (prayersRes.data ?? []).map((row) => ({
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      forPartner: row.for_partner,
      isAnswered: row.is_answered,
      createdAt: row.created_at,
    })),
    heartVerses: (heartRes.data ?? []).map((row) => ({
      id: row.id,
      authorId: row.author_id,
      reference: row.reference,
      text: row.text,
      note: row.note ?? '',
      createdAt: row.created_at,
    })),
  };
}

export async function upsertCheckIn(input: {
  userId: string;
  duoId: string;
  mood: MoodId;
  note: string;
  checkedOn: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('check_ins').upsert(
    {
      user_id: input.userId,
      duo_id: input.duoId,
      mood: input.mood,
      note: input.note || null,
      checked_on: input.checkedOn,
    },
    { onConflict: 'user_id,checked_on' },
  );
  if (error) throw new Error(error.message);
}

export async function insertPrayer(input: { duoId: string; authorId: string; body: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('prayers').insert({
    duo_id: input.duoId,
    author_id: input.authorId,
    body: input.body,
    for_partner: true,
  });
  if (error) throw new Error(error.message);
}

export async function markPrayerAnswered(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('prayers').update({ is_answered: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function insertHeartVerse(input: {
  duoId: string;
  authorId: string;
  reference: string;
  text: string;
  note: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('heart_verses').insert({
    duo_id: input.duoId,
    author_id: input.authorId,
    reference: input.reference,
    text: input.text,
    note: input.note || null,
  });
  if (error) throw new Error(error.message);
}

export async function upsertPlanAnswer(input: {
  planId: string;
  userId: string;
  dayNumber: number;
  answer: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('plan_answers').upsert(
    {
      plan_id: input.planId,
      user_id: input.userId,
      day_number: input.dayNumber,
      answer: input.answer,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'plan_id,day_number,user_id' },
  );
  if (error) throw new Error(error.message);
}

export async function upsertCompletion(input: {
  planId: string;
  userId: string;
  dayNumber: number;
  completedOn: string;
  usedGrace: boolean;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('plan_completions').upsert(
    {
      plan_id: input.planId,
      user_id: input.userId,
      day_number: input.dayNumber,
      completed_on: input.completedOn,
      used_grace: input.usedGrace,
    },
    { onConflict: 'plan_id,user_id,day_number' },
  );
  if (error) throw new Error(error.message);
}

export async function updateDisplayName(userId: string, displayName: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}
