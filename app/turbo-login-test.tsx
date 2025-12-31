import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button, ScrollView } from 'react-native';
import { pullAndPush } from "@/database/sync";
import { database } from "@/database"; // [cite: 1215]

const TurboLoginTest = () => {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [metrics, setMetrics] = useState({ productCount: 0, batchCount: 0, time: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTurboSync = async () => {
    try {
      setStatus('syncing');
      setErrorMsg(null);

      const startTime = Date.now();
      await pullAndPush();
      const endTime = Date.now();

      // --- Access Collections ---
      // Use database.get() as a shortcut for database.collections.get() [cite: 806, 2445]
      const productsCollection = database.get('products');
      const batchesCollection = database.get('product_batches');

      // --- Performance Optimized Logging (Raw Objects) ---
      // unsafeFetchRaw() returns raw data, bypassing model instantiation overhead [cite: 1129, 1130]
      const rawProducts = await productsCollection.query().unsafeFetchRaw();
      const rawBatches = await batchesCollection.query().unsafeFetchRaw();

      console.log(`[Sync Metrics] Total Products: ${rawProducts.length}`);
      console.log(`[Sync Metrics] Total Batches: ${rawBatches.length}`);

      if (rawBatches.length > 0) {
        console.log('Sample Batch Raw Data:', rawBatches[0]); // Verify snake_case matches schema [cite: 1338]
      }

      // --- Standard Model Fetching ---
      const allProducts = await productsCollection.query().fetch();
      const allBatches = await batchesCollection.query().fetch();

      setMetrics({
        productCount: allProducts.length,
        batchCount: allBatches.length,
        time: endTime - startTime,
      });

      setStatus('done');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    handleTurboSync();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Turbo Login Test</Text>

      {status === 'syncing' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.statusText}>Syncing Products & Batches...</Text>
        </View>
      )}

      {status === 'done' && (
        <View style={styles.center}>
          <Text style={styles.successText}>✅ Sync Successful!</Text>
          <View style={styles.statsBox}>
            <Text style={styles.info}>Time: {metrics.time}ms</Text>
            <Text style={styles.info}>Products in DB: {metrics.productCount}</Text>
            <Text style={styles.info}>Product Batches in DB: {metrics.batchCount}</Text>
          </View>
          <Button title="Sync Again" onPress={handleTurboSync} />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>❌ Sync Failed</Text>
          <Text style={styles.errorDetail}>{errorMsg}</Text>
          <Button title="Retry" onPress={handleTurboSync} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  center: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statusText: { marginTop: 10, color: '#666' },
  successText: { fontSize: 18, color: 'green', fontWeight: 'bold', marginBottom: 10 },
  statsBox: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 20, width: '100%' },
  errorText: { fontSize: 18, color: 'red', fontWeight: 'bold' },
  errorDetail: { color: '#444', textAlign: 'center', marginVertical: 10 },
  info: { marginVertical: 5, color: '#333', fontSize: 16 }
});

export default TurboLoginTest;