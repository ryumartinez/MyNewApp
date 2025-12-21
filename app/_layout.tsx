import { useEffect, useState, Suspense } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Stack } from "expo-router";
import { SQLiteProvider } from 'expo-sqlite';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database, initDB } from '@/database'; // Import initDB here

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Initialize WatermelonDB manually
    initDB().then(() => setDbReady(true));
  }, []);

  // Wait for the 'let database' variable to be populated
  if (!dbReady || !database) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Initializing Databases...</Text>
      </View>
    );
  }

  return (
    <DatabaseProvider database={database}>
      <Suspense fallback={<ActivityIndicator />}>
        <SQLiteProvider
          databaseName="watermelon.db"
          assetSource={{ assetId: require('../assets/watermelon.db') }}
        >
          <Stack />
        </SQLiteProvider>
      </Suspense>
    </DatabaseProvider>
  );
}