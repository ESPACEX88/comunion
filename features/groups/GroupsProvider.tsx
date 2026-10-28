import { useAuth } from '@/features/auth/AuthProvider';
import { rotatingChallenge } from '@/features/groups/challenges';
import { todayKey, weekStartMonday } from '@/lib/date';
import {
  createGroup as createGroupRemote,
  deleteGroupPrayer,
  deleteVerseComment,
  joinGroup as joinGroupRemote,
  leaveGroup as leaveGroupRemote,
  listMyGroups,
  loadGroupBundle,
  markGroupReading,
  postGroupPrayer,
  postVerseComment,
  removeGroupMember as removeMemberRemote,
  rotateGroupCode as rotateCodeRemote,
  setPrayerAnswered,
  setWeekChallenge as setWeekChallengeRemote,
  togglePrayerMark,
  upsertChallengeProgress,
  type GroupBundle,
  type GroupColorId,
  type GroupSummary,
} from '@/lib/groups';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type GroupsContextValue = {
  ready: boolean;
  groups: GroupSummary[];
  error: string | null;
  refresh: () => Promise<void>;
  loadBundle: (groupId: string) => Promise<GroupBundle | null>;
  createGroup: (name: string, emoji: string, color: GroupColorId) => Promise<GroupSummary['id']>;
  joinGroup: (code: string) => Promise<string>;
  leaveGroup: (groupId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  rotateCode: (groupId: string) => Promise<string>;
  markReading: (planId: string, dayNumber: number) => Promise<void>;
  postPrayer: (groupId: string, body: string, anonymous: boolean) => Promise<void>;
  togglePray: (prayerId: string, already: boolean) => Promise<void>;
  answerPrayer: (prayerId: string, answered: boolean) => Promise<void>;
  deletePrayer: (prayerId: string) => Promise<void>;
  postComment: (groupId: string, body: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  pickChallenge: (groupId: string, key: string) => Promise<void>;
  bumpChallenge: (challengeId: string, progress: number) => Promise<void>;
  suggestedChallengeKey: string;
};

const GroupsContext = createContext<GroupsContextValue | null>(null);

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [ready, setReady] = useState(!configured);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!configured || !user || !isSupabaseConfigured()) {
      setGroups([]);
      setReady(true);
      return;
    }
    try {
      const next = await listMyGroups();
      setGroups(next);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los grupos.');
    } finally {
      setReady(true);
    }
  }, [configured, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createGroup = useCallback(
    async (name: string, emoji: string, color: GroupColorId) => {
      const row = await createGroupRemote(name, emoji, color);
      await refresh();
      return row.id;
    },
    [refresh],
  );

  const joinGroup = useCallback(
    async (code: string) => {
      const row = await joinGroupRemote(code);
      await refresh();
      return row.id;
    },
    [refresh],
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      await leaveGroupRemote(groupId);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<GroupsContextValue>(
    () => ({
      ready,
      groups,
      error,
      refresh,
      loadBundle: loadGroupBundle,
      createGroup,
      joinGroup,
      leaveGroup,
      removeMember: removeMemberRemote,
      rotateCode: rotateCodeRemote,
      markReading: markGroupReading,
      postPrayer: postGroupPrayer,
      togglePray: togglePrayerMark,
      answerPrayer: setPrayerAnswered,
      deletePrayer: deleteGroupPrayer,
      postComment: postVerseComment,
      deleteComment: deleteVerseComment,
      pickChallenge: setWeekChallengeRemote,
      bumpChallenge: upsertChallengeProgress,
      suggestedChallengeKey: rotatingChallenge(weekStartMonday(todayKey())).id,
    }),
    [createGroup, error, groups, joinGroup, leaveGroup, ready, refresh],
  );

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

export function useGroups(): GroupsContextValue {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error('useGroups debe usarse dentro de GroupsProvider');
  return ctx;
}
