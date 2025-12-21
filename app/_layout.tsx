// Example for Expo Router _layout.tsx
import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { initDB } from '@/database';
import {Stack} from "expo-router";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startApp = async () => {
    try {
      setError(null);
      await initDB();
      setIsReady(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    startApp();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}>Database Error</Text>
        <Text style={{ textAlign: 'center', marginVertical: 10 }}>{error}</Text>
        <Button title="Try Again" onPress={startApp} />
      </View>
    );
  }

  if (!isReady) {
    return <Text>Loading 100,000 Products...</Text>; // Your Splash Screen
  }

  return <Stack />; // Or your normal app entry
}