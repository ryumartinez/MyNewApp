import { useEffect, useState } from 'react';
import { Stack } from "expo-router";
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        // Ensuring the bridge is alive by entering a simple Reader [cite: 1352]
        await database.read(async () => {
          setDbReady(true);
        });
      } catch (e) {
        console.error("WatermelonDB Init Failed:", e);
      }
    };
    initDb();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  return (
    <DatabaseProvider database={database}>
      <Stack />
    </DatabaseProvider>
  );
}