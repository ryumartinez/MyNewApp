import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import {pullAndPush} from "@/database/sync";

const TurboLoginTest = () => {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTurboSync = async () => {
    try {
      setStatus('syncing');
      setErrorMsg(null);

      const startTime = Date.now();
      await pullAndPush();
      const endTime = Date.now();

      console.log(`Turbo Sync completed in ${endTime - startTime}ms`);
      setStatus('done');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  // Trigger automatically when navigating to this component
  useEffect(() => {
    handleTurboSync();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turbo Login Test</Text>

      {status === 'syncing' && (
        <View>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.statusText}>Performing High-Speed Native Sync...</Text>
        </View>
      )}

      {status === 'done' && (
        <View>
          <Text style={styles.successText}>✅ Turbo Sync Successful!</Text>
          <Text style={styles.info}>Data processed directly via JSI bridge.</Text>
          <Button title="Sync Again" onPress={handleTurboSync} />
        </View>
      )}

      {status === 'error' && (
        <View>
          <Text style={styles.errorText}>❌ Sync Failed</Text>
          <Text style={styles.errorDetail}>{errorMsg}</Text>
          <Button title="Retry" onPress={handleTurboSync} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statusText: { marginTop: 10, color: '#666' },
  successText: { fontSize: 18, color: 'green', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: 'red', fontWeight: 'bold' },
  errorDetail: { color: '#444', textAlign: 'center', marginVertical: 10 },
  info: { marginVertical: 10, color: '#888', fontStyle: 'italic' }
});

export default TurboLoginTest;