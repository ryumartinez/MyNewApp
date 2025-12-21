import { View, Text } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function ExpoTest() {
  const db = useSQLiteContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function setup() {
      const result = await db.getFirstAsync<{ "COUNT(*)": number }>('SELECT COUNT(*) FROM products;');
      setCount(result?.["COUNT(*)"] ?? 0);
    }
    setup();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Raw SQLite Test</Text>
      <Text>Total Products: {count !== null ? count : 'Loading...'}</Text>
    </View>
  );
}