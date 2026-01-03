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
import { database } from "@/database";
import ProductBatch from "@/database/productBatch";

// --- 1. Batch Row Component ---
interface BatchRowProps {
  batch: ProductBatch;
}

const BatchRow: React.FC<BatchRowProps> = ({ batch }) => {
  // Helper to format Unix timestamps from the .NET backend [cite: 408]
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <View style={styles.item}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          Batch: {batch.batchNumber}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{batch.dataAreaId}</Text>
        </View>
      </View>
    </View>
  );
};

// Enhancing the row ensures that if a background sync updates a batch,
// only that specific row re-renders[cite: 37, 82].
const EnhancedBatchRow = withObservables(['batch'], ({ batch }: BatchRowProps) => ({
  batch: batch.observe(),
}))(BatchRow);

// --- 2. Main List Component ---
interface BatchListProps {
  batches: ProductBatch[];
  count: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const BatchList: React.FC<BatchListProps> = ({
                                               batches,
                                               count,
                                               searchQuery,
                                               setSearchQuery
                                             }) => (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Batch, Vendor, or Item..."
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
        {searchQuery ? `FOUND ${count} MATCHES` : `TOTAL BATCHES: ${count}`}
      </Text>
    </View>

    <FlatList
      data={batches}
      keyExtractor={(item) => item.id} // All models have an auto-generated 'id' [cite: 282]
      renderItem={({ item }) => <EnhancedBatchRow batch={item} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>No batches found.</Text>
          <Text style={styles.emptySubtext}>Try a different search term.</Text>
        </View>
      }
      initialNumToRender={15}
      maxToRenderPerBatch={20}
      windowSize={5}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  </SafeAreaView>
);

// --- 3. The Enhancer ---
const enhance = withObservables(['searchQuery'], ({ searchQuery }: { searchQuery: string }) => {
  // Sanitize user input for safe LIKE queries [cite: 1011, 1097]
  const sanitized = Q.sanitizeLikeString(searchQuery.trim());

  // Define shared search filters
  const clauses = [
    Q.or(
      Q.where('batch_number', Q.like(`%${sanitized}%`)),
      Q.where('vendor_batch_number', Q.like(`%${sanitized}%`)),
      Q.where('item_number', Q.like(`%${sanitized}%`))
    )
  ];

  // List Query: Optimized with sorting and paging [cite: 1082, 1092]
  const listQuery = database.get<ProductBatch>('product_batches').query(
    ...clauses,
    Q.sortBy('batch_number', Q.asc),
    Q.take(100)
  );

  // Count Query: Throttled by default for performance [cite: 1074]
  const countQuery = database.get<ProductBatch>('product_batches').query(
    ...clauses
  );

  return {
    batches: listQuery.observe(),
    count: countQuery.observeCount(),
  };
});

const EnhancedProductBatchList = enhance(BatchList);

// --- 4. Main Export ---
export default function BatchSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <EnhancedProductBatchList
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
  searchContainer: { backgroundColor: '#fff', paddingBottom: 5 },
  searchBar: {
    height: 46,
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f2f2f7',
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
  countText: { fontSize: 11, color: '#8e8e93', fontWeight: '700', letterSpacing: 1.2 },
  item: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1c1c1e', flex: 1, marginRight: 10 },
  badge: { backgroundColor: '#34c759', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  details: {
    color: '#3a3a3c',
    fontSize: 13,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  dateContainer: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  dateLabel: { fontSize: 10, color: '#8e8e93', fontWeight: 'bold', marginRight: 4 },
  dateValue: { fontSize: 12, color: '#3a3a3c', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  empty: { fontSize: 17, fontWeight: '600', color: '#8e8e93' },
  emptySubtext: { fontSize: 14, color: '#aeaeb2', marginTop: 5 }
});