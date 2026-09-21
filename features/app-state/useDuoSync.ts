import { useAppState } from '@/features/app-state/AppStateProvider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Al volver a Hoy / Nosotros / Planes / Yo, pide el dúo de nuevo. */
export function useRefreshOnFocus() {
  const { signedIn, refreshLive } = useAppState();
  useFocusEffect(
    useCallback(() => {
      if (!signedIn) return;
      void refreshLive();
    }, [signedIn, refreshLive]),
  );
}

export function useLivePullToRefresh() {
  const { signedIn, refreshLive } = useAppState();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!signedIn) return;
    setRefreshing(true);
    try {
      await refreshLive({ force: true });
    } finally {
      setRefreshing(false);
    }
  }, [signedIn, refreshLive]);

  return {
    refreshing,
    onRefresh: signedIn ? onRefresh : undefined,
  };
}

export function useDuoSyncControls() {
  useRefreshOnFocus();
  return useLivePullToRefresh();
}
