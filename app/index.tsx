import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Benchmarks</Text>

      {/* Button for SQLite */}
      <Link href="/expo-test" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>🚀 Test Raw expo-sqlite</Text>
        </Pressable>
      </Link>

      {/* Button for WatermelonDB */}
      <Link href="/turbo-login-test" asChild>
        <Pressable style={[styles.button, styles.watermelonBtn]}>
          <Text style={styles.buttonText}>🍉 Test WatermelonDB</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginVertical: 10 },
  watermelonBtn: { backgroundColor: '#FF4500' }, // Orange color to distinguish
  buttonText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }
});