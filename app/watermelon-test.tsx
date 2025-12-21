import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import Product from '@/model/product'; // Adjust based on your tree

// 1. Define the UI Component
const ProductItem = ({ product }: { product: Product }) => (
  <View style={styles.item}>
    <Text style={styles.name}>{product.name}</Text>
    {/* Adjust property names to match your Product model */}
    <Text style={styles.detail}>SKU: {product.sku}</Text>
  </View>
);

// 2. Wrap it in withObservables to make it reactive
const EnhancedProductItem = withObservables(['product'], ({ product }) => ({
  product, // Shorthand for product: product.observe()
}))(ProductItem);

export default function WatermelonTest() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      const start = performance.now();

      // Fetching via WatermelonDB Collection
      const result = await database.get<Product>('products').query().fetch();

      const end = performance.now();
      setTime(end - start);
      setProducts(result);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <Text style={styles.statText}>Method: WatermelonDB (ORM)</Text>
        <Text style={styles.statText}>Fetch Time: {time.toFixed(2)}ms</Text>
        <Text style={styles.statText}>Items: {products.length}</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EnhancedProductItem product={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center' },
  stats: { padding: 15, backgroundColor: '#FFF5F0', borderBottomWidth: 1, borderColor: '#FF4500' },
  statText: { fontWeight: 'bold', color: '#FF4500' },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600' },
  detail: { color: '#666', fontSize: 12 }
});