import { getSupabase } from '@/lib/supabase';
import type { MemberHue } from '@/theme';

export type FriendRow = {
  id: string;
  name: string;
  hue: MemberHue;
  since: string;
};

export type FriendInvite = {
  id: string;
  code: string;
  status: 'open' | 'used' | 'cancelled';
  createdAt: string;
};

function explain(error: { message: string } | null, fallback: string) {
  return error?.message ?? fallback;
}

function hueFor(id: string): MemberHue {
  const palettes: MemberHue[] = ['olive', 'amber', 'terracotta', 'charcoal'];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % palettes.length;
  return palettes[hash];
}

async function currentUserId() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error('No hay sesión.');
  return data.user.id;
}

export async function loadFriends(): Promise<{ friends: FriendRow[]; invite: FriendInvite | null }> {
  const supabase = getSupabase();
  const userId = await currentUserId();
  const [friendshipsRes, inviteRes] = await Promise.all([
    supabase.from('friendships').select('id, user_a, user_b, created_at'),
    supabase
      .from('friend_invites')
      .select('id, code, status, created_at')
      .eq('inviter_id', userId)
      .eq('status', 'open')
      .maybeSingle(),
  ]);
  if (friendshipsRes.error) throw new Error(explain(friendshipsRes.error, 'No se pudieron cargar los amigos.'));

  const otherIds = (friendshipsRes.data ?? []).map((row) => (row.user_a === userId ? row.user_b : row.user_a));
  let nameById = new Map<string, string>();
  if (otherIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', otherIds);
    if (profileError) throw new Error(explain(profileError, 'No se pudieron leer los nombres.'));
    nameById = new Map((profiles ?? []).map((row) => [row.id, row.display_name]));
  }

  const friends: FriendRow[] = (friendshipsRes.data ?? []).map((row) => {
    const friendId = row.user_a === userId ? row.user_b : row.user_a;
    return {
      id: friendId,
      name: nameById.get(friendId) || 'Amigo',
      hue: hueFor(friendId),
      since: row.created_at,
    };
  });

  const invite = inviteRes.data
    ? {
        id: inviteRes.data.id,
        code: inviteRes.data.code,
        status: inviteRes.data.status as FriendInvite['status'],
        createdAt: inviteRes.data.created_at,
      }
    : null;

  return { friends, invite };
}

export async function createFriendInvite(): Promise<FriendInvite> {
  const { data, error } = await getSupabase().rpc('create_friend_invite');
  if (error || !data) throw new Error(explain(error, 'No se pudo crear la invitación.'));
  return {
    id: data.id,
    code: data.code,
    status: data.status as FriendInvite['status'],
    createdAt: data.created_at,
  };
}

export async function acceptFriendInvite(code: string): Promise<void> {
  const { error } = await getSupabase().rpc('accept_friend_invite', {
    p_code: code.trim().toUpperCase(),
  });
  if (error) throw new Error(explain(error, 'No se pudo aceptar la invitación.'));
}

export async function cancelFriendInvite(): Promise<void> {
  const { error } = await getSupabase().rpc('cancel_friend_invite');
  if (error) throw new Error(explain(error, 'No se pudo cancelar la invitación.'));
}

export async function unfriend(friendId: string): Promise<void> {
  const { error } = await getSupabase().rpc('unfriend', { p_friend_id: friendId });
  if (error) throw new Error(explain(error, 'No se pudo quitar al amigo.'));
}
