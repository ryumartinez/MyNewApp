import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { Q } from '@nozbe/watermelondb'; // [cite: 1243]
import { pullAndPush } from "@/database/sync";
import { database } from "@/database"; // Ensure this matches your index file [cite: 1215]

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

      // --- Query and Log Products ---
      // Use database.get() as a shortcut to access the collection [cite: 832]
      const productsCollection = database.get('products');

      const rawProducts = await productsCollection.query().unsafeFetchRaw();
      console.log(`Total rows in DB: ${rawProducts.length}`);
      console.log('Sample Raw Product Data:', rawProducts[0]);
      // Fetch all products or add Q.where for specific criteria [cite: 1232, 1235]
      const allProducts = await productsCollection.query().fetch();

      console.log(`Total products after sync: ${allProducts.length}`);
      if (allProducts.length > 0) {
        // Log the first product to verify raw records match the Schema [cite: 1338]
        console.log('Sample Product Data:', allProducts[0]._raw);
      }

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
    <View style={styles.container}>
      <Text style={styles.title}>Turbo Login Test</Text>

      {status === 'syncing' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.statusText}>Performing High-Speed Native Sync...</Text>
        </View>
      )}

      {status === 'done' && (
        <View style={styles.center}>
          <Text style={styles.successText}>✅ Turbo Sync Successful!</Text>
          <Text style={styles.info}>Data processed directly via JSI bridge.</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  center: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statusText: { marginTop: 10, color: '#666' },
  successText: { fontSize: 18, color: 'green', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: 'red', fontWeight: 'bold' },
  errorDetail: { color: '#444', textAlign: 'center', marginVertical: 10 },
  info: { marginVertical: 10, color: '#888', fontStyle: 'italic' }
});

export default TurboLoginTest;