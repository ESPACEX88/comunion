import { useAppState } from '@/features/app-state/AppStateProvider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Al volver a Hoy / Nosotros / Planes / Yo, pide el dúo de nuevo. */
export function useRefreshOnFocus() {
  const { live, refreshLive } = useAppState();
  useFocusEffect(
    useCallback(() => {
      if (!live) return;
      void refreshLive();
    }, [live, refreshLive]),
  );
}

export function useLivePullToRefresh() {
  const { live, refreshLive } = useAppState();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!live) return;
    setRefreshing(true);
    try {
      await refreshLive({ force: true });
    } finally {
      setRefreshing(false);
    }
  }, [live, refreshLive]);

  return {
    refreshing,
    onRefresh: live ? onRefresh : undefined,
  };
}

export function useDuoSyncControls() {
  useRefreshOnFocus();
  return useLivePullToRefresh();
}
