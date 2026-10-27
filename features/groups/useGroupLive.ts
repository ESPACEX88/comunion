import { subscribeGroup, useGroups } from '@/features/groups/GroupsProvider';
import type { GroupBundle } from '@/lib/groups';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useGroupLive(groupId: string | undefined) {
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

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    if (!groupId) return;
    return subscribeGroup(groupId, () => {
      void reload();
    });
  }, [groupId, reload]);

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
