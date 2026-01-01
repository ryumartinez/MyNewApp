import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import PerformanceStats from 'react-native-performance-stats';

export default function PerformanceOverlay() {
  const [stats, setStats] = useState({ uiFps: 0, jsFps: 0, usedRam: 0 });

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
      <View style={styles.badge}>
        <Text style={styles.text}>UI: {stats.uiFps.toFixed(1)} FPS</Text>
        <Text style={styles.text}>JS: {stats.jsFps.toFixed(1)} FPS</Text>
        <Text style={styles.text}>RAM: {stats.usedRam.toFixed(1)} MB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30, // Adjust for status bar
    right: 10,
    zIndex: 9999,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  text: {
    color: '#00FF00', // Classic "perf monitor" green
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});