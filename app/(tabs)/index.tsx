import React, { useState, useEffect } from 'react';
import {
  View, TextInput, FlatList, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Modal
} from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import Product from '../../model/product';

// --- Configuration ---
const BACKEND_URL = 'http://10.0.2.2:5117/api/sync/seed-db';

interface NetworkLog {
  id: string;
  method: string;
  url: string;
  status: number | 'PENDING' | 'ERROR';
  responseBody: string;
  timestamp: string;
}

// --- WatermelonDB Observable Logic ---
const observeProducts = (search: string) => {
  const collection = database.get<Product>('products');
  if (!search) {
    return collection.query(Q.take(3)).observe(); // Show 3 by default
  }
  return collection.query(
    Q.where('name', Q.like(`%${Q.sanitizeLikeString(search)}%`))
  ).observe();
};

// --- Reactive List Component ---
const ProductList = withObservables(['search'], ({ search }) => ({
  products: observeProducts(search),
}))(({ products }: { products: Product[] }) => (
  <FlatList
    data={products}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.skuText}>{item.sku} • ${item.price?.toFixed(2)}</Text>
      </View>
    )}
    ListEmptyComponent={
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products in local SQLite.</Text>
      </View>
    }
  />
));

// --- Main Screen ---
export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [showLogs, setShowLogs] = useState(true); // Default to true to see activity
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Sync DB Count
  const updateCount = async () => {
    const count = await database.get('products').query().fetchCount();
    setDbCount(count);
  };

  useEffect(() => {
    updateCount();
  }, []);

  // Logger Helper
  const addLog = (method: string, url: string, status: number | 'PENDING' | 'ERROR', body: any = null) => {
    const newLog: NetworkLog = {
      id: Math.random().toString(36).substr(2, 9),
      method,
      url,
      status,
      responseBody: body ? JSON.stringify(body, null, 2) : 'No body returned',
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
  };

  // REAL API CALL TO .NET
  const triggerBackendSync = async () => {
    setIsBusy(true);
    addLog('POST', BACKEND_URL, 'PENDING');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      addLog('POST', BACKEND_URL, response.status, data);

      if (response.ok) {
        // NOTE: If you want to save these to the DB, you'd perform a database.write() here
        await updateCount();
        Alert.alert("Sync Complete", `Backend returned ${data.length || 0} items.`);
      }
    } catch (error: any) {
      addLog('POST', BACKEND_URL, 'ERROR', { message: error.message });
      Alert.alert("Connection Failed", "Ensure your .NET API is running on port 5117");
    } finally {
      setIsBusy(false);
    }
  };

  // DATABASE RESET
  const handleReset = async () => {
    setIsBusy(true);
    try {
      await database.write(async () => {
        // FIXED: .query() is required before .unsafeDestroyAll()
        await database.get<Product>('products').query().destroyAllPermanently();
      });
      addLog('DELETE', 'local-sqlite', 200, { message: "All products wiped" });
      await updateCount();
      setSearch('');
    } catch (e) {
      Alert.alert("Reset Error", "Check console for details");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header & Controls */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>Local SQLite: {dbCount ?? '0'}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={triggerBackendSync}
              disabled={isBusy}
              style={[styles.btn, styles.btnSync, isBusy && { opacity: 0.5 }]}
            >
              <Text style={styles.btnText}>Call .NET</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              disabled={isBusy}
              style={[styles.btn, styles.btnReset, isBusy && { opacity: 0.5 }]}
            >
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          placeholder="Search 100k records..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <TouchableOpacity onPress={() => setShowLogs(!showLogs)} style={styles.logToggle}>
          <Text style={styles.logToggleText}>{showLogs ? '▼ Hide Logs' : '▲ Show Logs'}</Text>
        </TouchableOpacity>
      </View>

      {/* Network Activity Log */}
      {showLogs && (
        <View style={styles.logContainer}>
          <ScrollView style={{ maxHeight: 150 }}>
            {logs.map(log => (
              <TouchableOpacity key={log.id} style={styles.logItem} onPress={() => setSelectedLog(log)}>
                <Text style={styles.logTimestamp}>[{log.timestamp}]</Text>
                <Text style={styles.logMethod}>{log.method}</Text>
                <Text style={styles.logUrl} numberOfLines={1}>{log.url}</Text>
                <Text style={[styles.logStatus, { color: log.status === 200 ? '#2ecc71' : '#e74c3c' }]}>
                  {log.status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Product List */}
      <ProductList search={search} />

      {/* JSON Inspector Modal */}
      <Modal visible={!!selectedLog} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inspect Backend Response</Text>
            <ScrollView style={styles.jsonBox}>
              <Text style={styles.jsonText}>{selectedLog?.responseBody}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedLog(null)}>
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f7', paddingTop: 60 },
  header: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statsText: { fontSize: 14, fontWeight: 'bold' },
  searchInput: { height: 40, backgroundColor: '#f0f0f2', borderRadius: 8, paddingHorizontal: 15 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 8 },
  btnSync: { backgroundColor: '#34c759' },
  btnReset: { backgroundColor: '#ff3b30' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  logToggle: { marginTop: 10, alignSelf: 'center' },
  logToggleText: { color: '#007AFF', fontSize: 11, fontWeight: '700' },
  logContainer: { backgroundColor: '#1c1c1e', padding: 10 },
  logItem: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#333', paddingVertical: 5 },
  logTimestamp: { color: '#888', fontSize: 10, width: 75 },
  logMethod: { color: '#5ac8fa', fontSize: 10, fontWeight: 'bold', width: 45 },
  logUrl: { color: '#fff', fontSize: 10, flex: 1 },
  logStatus: { fontSize: 10, fontWeight: 'bold', width: 45, textAlign: 'right' },
  card: { backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 5, padding: 15, borderRadius: 10 },
  productName: { fontSize: 16, fontWeight: '700' },
  skuText: { color: '#888', fontSize: 13, marginTop: 4 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  jsonBox: { backgroundColor: '#272822', borderRadius: 8, padding: 10 },
  jsonText: { color: '#a6e22e', fontFamily: 'monospace', fontSize: 11 },
  closeBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginTop: 15 }
});