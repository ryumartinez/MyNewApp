import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import Product from "@/database/product";
import { database } from "@/database";

// --- 1. Product Row Component ---
interface ProductRowProps {
  product: Product;
}

const ProductRow: React.FC<ProductRowProps> = ({ product }) => (
  <View style={styles.item}>
    <View style={styles.row}>
      <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{product.dataAreaId}</Text>
      </View>
    </View>

    <Text style={styles.details}>
      ID: {product.itemId} | BC: {product.barCode}
    </Text>

    <Text style={styles.brandDetails}>
      {product.brandName} • {product.sizeName} ({product.sizeCode})
    </Text>
  </View>
);

// We observe the product to ensure UI updates if the sync engine changes data in the background
const EnhancedProductRow = withObservables(['product'], ({ product }: ProductRowProps) => ({
  product: product.observe(),
}))(ProductRow);

// --- 2. Main List Component ---
interface ProductListProps {
  products: Product[];
  count: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
                                                   products,
                                                   count,
                                                   searchQuery,
                                                   setSearchQuery
                                                 }) => (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search name, barcode, or ID..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>

    <View style={styles.header}>
      <Text style={styles.countText}>
        {searchQuery ? `FOUND ${count} MATCHES` : `TOTAL PRODUCTS: ${count}`}
      </Text>
    </View>

    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EnhancedProductRow product={item} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>No products found.</Text>
          <Text style={styles.emptySubtext}>Try searching for a different term.</Text>
        </View>
      }
      initialNumToRender={15}
      maxToRenderPerBatch={20}
      windowSize={5}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  </SafeAreaView>
);

// --- 3. The Enhancer (Fixed Logic) ---
const enhance = withObservables(['searchQuery'], ({ searchQuery }: { searchQuery: string }) => {
  const sanitized = Q.sanitizeLikeString(searchQuery.trim());

  // Define common filters
  const clauses = [
    Q.or(
      Q.where('name', Q.like(`%${sanitized}%`)),
      Q.where('bar_code', Q.like(`%${sanitized}%`)),
      Q.where('item_id', Q.like(`%${sanitized}%`)),
      Q.where('brand_name', Q.like(`%${sanitized}%`))
    )
  ];

  // List Query: Safe to use take() and sortBy()
  const listQuery = database.get<Product>('products').query(
    ...clauses,
    Q.sortBy('name', Q.asc),
    Q.take(100)
  );

  // Count Query: Must NOT use take() or sortBy()
  const countQuery = database.get<Product>('products').query(
    ...clauses
  );

  return {
    products: listQuery.observe(),
    count: countQuery.observeCount(),
  };
});

const EnhancedProductList = enhance(ProductList);

// --- 4. Main Export ---
export default function ProductSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <EnhancedProductList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </View>
    </SafeAreaProvider>
  );
}

// --- 5. Styles ---
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  searchContainer: {
    backgroundColor: '#fff',
    paddingBottom: 5,
  },
  searchBar: {
    height: 46,
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f2f2f7', // iOS-style system background
    fontSize: 16,
    color: '#000',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countText: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  item: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    flex: 1,
    marginRight: 10
  },
  badge: {
    backgroundColor: '#007aff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  details: {
    color: '#3a3a3c',
    fontSize: 13,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  brandDetails: { color: '#8e8e93', fontSize: 12, marginTop: 4 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80
  },
  empty: { fontSize: 17, fontWeight: '600', color: '#8e8e93' },
  emptySubtext: { fontSize: 14, color: '#aeaeb2', marginTop: 5 }
});