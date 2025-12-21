import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import Product from "@/database/product";
import { database } from "@/database";

// --- Product Row (Stays the same) ---
interface ProductRowProps {
  product: Product;
}

const ProductRow: React.FC<ProductRowProps> = ({ product }) => (
  <View style={styles.item}>
    <Text style={styles.name}>{product.name}</Text>
    <Text style={styles.details}>SKU: {product.sku} | ${product.price}</Text>
  </View>
);

const EnhancedProductRow = withObservables(['product'], ({ product }: ProductRowProps) => ({
  product: product.observe(),
}))(ProductRow);

// --- Product List ---
interface ProductListProps {
  products: Product[];
  count: number; // Added count prop
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, count, searchQuery, setSearchQuery }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.searchBar}
      placeholder="Search by name or SKU..."
      value={searchQuery}
      onChangeText={setSearchQuery}
    />

    {/* Result Counter Header */}
    <View style={styles.header}>
      <Text style={styles.countText}>
        {searchQuery ? `Found ${count} matching products` : `Total Products: ${count}`}
      </Text>
    </View>

    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EnhancedProductRow product={item} />}
      ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
    />
  </View>
);

// --- The Enhancer ---
const enhance = withObservables(['searchQuery'], ({ searchQuery }: { searchQuery: string }) => {
  // Create the base query once to reuse for both records and count [cite: 1234, 1235]
  const productQuery = database.get<Product>('products').query(
    Q.or(
      Q.where('name', Q.like(`%${Q.sanitizeLikeString(searchQuery)}%`)),
      Q.where('sku', Q.like(`%${Q.sanitizeLikeString(searchQuery)}%`))
    )
  );

  return {
    products: productQuery.observe(), // Observes the actual records
    count: productQuery.observeCount(), // Efficiently observes just the count
  };
});

const EnhancedProductList = enhance(ProductList);

export default function ProductSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <EnhancedProductList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 15,
    marginBottom: 5,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  countText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { color: '#666' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});