import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';

/**
 * HomeScreen for a reactive database benchmark app[cite: 8].
 * Features navigation to sync tests and product lists.
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🍉</Text>
        <Text style={styles.title}>WatermelonDB</Text>
        <Text style={styles.subtitle}>Performance Benchmarks</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Link href="/turbo-login-test" asChild>
          <Pressable style={styles.button}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEDEB' }]}>
              <Text style={styles.buttonIcon}>⚡</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Turbo Login Test</Text>
              <Text style={styles.buttonDesc}>Test initial sync speed</Text>
            </View>
          </Pressable>
        </Link>

        <Link href="/product-list" asChild>
          <Pressable style={styles.button}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.buttonIcon}>📦</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Product List</Text>
              <Text style={styles.buttonDesc}>View reactive collections</Text>
            </View>
          </Pressable>
        </Link>

        {/* --- Added Product Batches Button --- */}
        <Link href="/product-batch-list" asChild>
          <Pressable style={styles.button}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.buttonIcon}>🏷️</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Product Batches</Text>
              <Text style={styles.buttonDesc}>View batch expiration data</Text>
            </View>
          </Pressable>
        </Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by WatermelonDB [cite: 12]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 4,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  buttonDesc: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#ADB5BD',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});