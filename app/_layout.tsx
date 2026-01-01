import { useEffect, useState } from 'react';
import { Stack } from "expo-router";
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import { View, ActivityIndicator } from 'react-native';
// 1. Import performance monitoring tools
import PerformanceStats from 'react-native-performance-stats';
import PerformanceOverlay from "@/app/performance-overlay";
// 2. Import the new unified sync manager hook
import { useSyncManager } from '@/hooks/use-sync';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  // 3. Initialize the background sync manager
  // This hook handles network listeners and periodic syncs automatically [cite: 1474]
  useSyncManager();

  useEffect(() => {
    // Start performance monitoring
    PerformanceStats.start(true);

    const listener = PerformanceStats.addListener((stats) => {
      if (__DEV__) {
        console.log(`[Performance] FPS: ${stats.uiFps.toFixed(1)} | JS FPS: ${stats.jsFps.toFixed(1)} | RAM: ${stats.usedRam}MB`);
      }
    });

    const initDb = async () => {
      try {
        const start = Date.now();
        // Check database readiness using a Reader to ensure consistency [cite: 1352, 1355]
        await database.read(async () => {
          const duration = Date.now() - start;
          console.log(`WatermelonDB ready in ${duration}ms`);
          setDbReady(true);
        });
      } catch (e) {
        console.error("WatermelonDB Init Failed:", e);
      }
    };

    initDb();

    return () => {
      listener.remove();
      PerformanceStats.stop();
    };
  }, []);

  // Show a loading indicator while the database is initializing
  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  return (
    // DatabaseProvider allows all children to use reactive decorators like @field and @relation [cite: 2075]
    <DatabaseProvider database={database}>
      <Stack />
      <PerformanceOverlay />
    </DatabaseProvider>
  );
}