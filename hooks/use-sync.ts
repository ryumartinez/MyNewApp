import { useEffect, useCallback, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { pullAndPush } from '@/database/sync';

export function useSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);

  const performSync = useCallback(async () => {
    // Prevent multiple simultaneous syncs
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      await pullAndPush();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const unsubscribeNet = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        performSync();
      }
    });

    const interval = setInterval(() => {
      performSync();
    }, 300000);

    return () => {
      unsubscribeNet();
      clearInterval(interval);
    };
  }, [performSync]);

  return { performSync, isSyncing };
}