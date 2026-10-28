import { subscribeGroupLive } from '@/lib/realtime';
import { useGroups } from '@/features/groups/GroupsProvider';
import type { GroupBundle } from '@/lib/groups';
import { useFocusEffect } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

export type GroupLiveValue = {
  bundle: GroupBundle | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  reload: () => Promise<void>;
};

const GroupLiveContext = createContext<GroupLiveValue | null>(null);

export function useGroupLive(groupId: string | undefined): GroupLiveValue {
  const { loadBundle } = useGroups();
  const [bundle, setBundle] = useState<GroupBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    if (!groupId) return;
    try {
      const next = await loadBundle(groupId);
      setBundle(next);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el grupo.');
    } finally {
      setLoading(false);
    }
  }, [groupId, loadBundle]);

  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  useEffect(() => {
    setLoading(Boolean(groupId));
    setBundle(null);
    setError(null);
  }, [groupId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status === 'active') void reloadRef.current();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    try {
      return subscribeGroupLive(groupId, () => {
        void reloadRef.current();
      });
    } catch {
      return undefined;
    }
  }, [groupId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  return { bundle, loading, error, refreshing, onRefresh, reload };
}

export function GroupLiveProvider({
  groupId,
  children,
}: {
  groupId: string | undefined;
  children: ReactNode;
}) {
  const live = useGroupLive(groupId);
  return <GroupLiveContext.Provider value={live}>{children}</GroupLiveContext.Provider>;
}

export function useActiveGroupLive(): GroupLiveValue {
  const ctx = useContext(GroupLiveContext);
  if (!ctx) throw new Error('useActiveGroupLive debe usarse dentro de GroupLiveProvider');
  return ctx;
}
