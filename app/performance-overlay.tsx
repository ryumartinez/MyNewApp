import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import PerformanceStats from 'react-native-performance-stats';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import { useSyncManager } from '@/hooks/use-sync';

// --- Inner Component to handle Reactive Data ---
const MetricsBadge = ({ productCount, batchCount, isSyncing, stats }: any) => {
  return (
    <View style={styles.badge}>
      {/* Existing Performance Stats */}
      <Text style={styles.text}>UI: {stats.uiFps.toFixed(1)} FPS</Text>
      <Text style={styles.text}>JS: {stats.jsFps.toFixed(1)} FPS</Text>
      <Text style={styles.text}>RAM: {stats.usedRam.toFixed(1)} MB</Text>

      <View style={styles.divider} />

      {/* Database Stats [cite: 815, 817] */}
      <Text style={styles.dbText}>📦 PRODUCTS: {productCount}</Text>
      <Text style={styles.dbText}>🏷️ BATCHES: {batchCount}</Text>

      <View style={styles.divider} />

      {/* Sync Status [cite: 1438, 1469] */}
      <Text style={[styles.syncText, isSyncing && styles.syncingActive]}>
        {isSyncing ? '🔄 SYNCING...' : '✅ UP TO DATE'}
      </Text>
    </View>
  );
};

// Use withObservables to keep the row counts reactive [cite: 37, 969]
const EnhancedMetrics = withObservables([], () => ({
  productCount: database.get('products').query().observeCount(),
  batchCount: database.get('product_batches').query().observeCount(),
}))(MetricsBadge);

export default function PerformanceOverlay() {
  const [stats, setStats] = useState({ uiFps: 0, jsFps: 0, usedRam: 0 });
  const { isSyncing } = useSyncManager();

  useEffect(() => {
    const listener = PerformanceStats.addListener((newStats) => {
      setStats({
        uiFps: newStats.uiFps,
        jsFps: newStats.jsFps,
        usedRam: newStats.usedRam,
      });
    });
    return () => listener.remove();
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <EnhancedMetrics stats={stats} isSyncing={isSyncing} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 10,
    zIndex: 9999,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 120,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 6,
  },
  text: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dbText: {
    color: '#00E5FF', // Bright cyan for DB stats
    fontSize: 10,
    fontWeight: 'bold',
  },
  syncText: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  syncingActive: {
    color: '#FFD700', // Gold when active
  },
});