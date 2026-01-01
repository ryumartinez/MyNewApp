import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { database } from "@/database";
import Product from "@/database/product";

/**
 * ProductCreateScreen
 * A form component used to test the WatermelonDB record creation flow[cite: 840].
 */
export default function ProductCreateScreen() {
  // Pre-filled state for testing the creation flow
  const [formData, setFormData] = useState({
    name: 'Test Product ' + Math.floor(Math.random() * 1000),
    itemId: 'ITEM-' + Math.random().toString(36).substring(7).toUpperCase(),
    barCode: '789123456789',
    brandName: 'Watermelon Brand',
    dataAreaId: 'USMF',
    sizeName: 'Large',
    sizeCode: 'L',
  });

  const handleCreate = async () => {
    try {
      // All modifications must be done in a Writer block
      await database.write(async () => {
        const productsCollection = database.get<Product>('products');

        const newProduct = await productsCollection.create((product) => {
          // Setting values inside the builder function
          product.name = formData.name;
          product.itemId = formData.itemId;
          product.barCode = formData.barCode;
          product.brandName = formData.brandName;
          product.dataAreaId = formData.dataAreaId;
          product.sizeName = formData.sizeName;
          product.sizeCode = formData.sizeCode;
        });

        console.log('Created product ID:', newProduct.id);
        Alert.alert('Success', `Created Product: ${newProduct.name}`);
      });
    } catch (error) {
      console.error('Creation failed:', error);
      Alert.alert('Error', 'Failed to create product.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Product Test</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(t) => setFormData({...formData, name: t})}
        />

        <Text style={styles.label}>Item ID</Text>
        <TextInput
          style={styles.input}
          value={formData.itemId}
          onChangeText={(t) => setFormData({...formData, itemId: t})}
        />

        <Text style={styles.label}>Barcode</Text>
        <TextInput
          style={styles.input}
          value={formData.barCode}
          keyboardType="numeric"
          onChangeText={(t) => setFormData({...formData, barCode: t})}
        />

        <Text style={styles.label}>Data Area ID (Company)</Text>
        <TextInput
          style={styles.input}
          value={formData.dataAreaId}
          onChangeText={(t) => setFormData({...formData, dataAreaId: t})}
        />

        <Pressable style={styles.submitButton} onPress={handleCreate}>
          <Text style={styles.submitText}>Save to WatermelonDB</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#6c757d', marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#212529',
  },
  submitButton: {
    backgroundColor: '#007aff',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});