import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { initDB, database } from '@/database';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setIsReady(true));
  }, []);

  if (!isReady) return null; // Or a Splash Screen

  return (
    <DatabaseProvider database={database}>
      <Stack />
    </DatabaseProvider>
  );
}