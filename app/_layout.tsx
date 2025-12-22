import { useEffect, useState } from 'react';
import { Stack } from "expo-router";
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import { View, ActivityIndicator } from 'react-native';
// 1. Import the performance monitor
import PerformanceStats from 'react-native-performance-stats';
import PerformanceOverlay from "@/app/performance-overlay";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // 2. Start monitoring (pass 'true' to include CPU usage tracking)
    PerformanceStats.start(true);

    // 3. Set up a listener for real-time metrics
    const listener = PerformanceStats.addListener((stats) => {
      // stats contains: fps, jsFps, cpu, ram
      if (__DEV__) {
        console.log(`[Performance] FPS: ${stats.uiFps.toFixed(1)} | JS FPS: ${stats.jsFps.toFixed(1)} | RAM: ${stats.usedRam}MB`);
      }
    });

    const initDb = async () => {
      try {
        // Measure start time for DB init
        const start = Date.now();

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

    // 4. Cleanup listener and stop monitoring on unmount
    return () => {
      listener.remove();
      PerformanceStats.stop();
    };
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  return (
    <DatabaseProvider database={database}>
      <Stack/>
      <PerformanceOverlay />
    </DatabaseProvider>
  );
}