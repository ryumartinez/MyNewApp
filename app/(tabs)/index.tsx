import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import Product from '../../model/product';

const observeProducts = (search: string) => {
  const collection = database.get<Product>('products');

  if (!search) {
    console.log('[WatermelonDB] No search term. Fetching default 3 products.');
    // When empty, take 3 products.
    // We use take(3) for performance on your 100k dataset.
    return collection.query(Q.take(3)).observe();
  }

  console.log(`[WatermelonDB] Searching for: "${search}"`);
  return collection.query(
    Q.where('name', Q.like(`%${Q.sanitizeLikeString(search)}%`))
  ).observe();
};

const ProductList = withObservables(['search'], ({ search }) => ({
  products: observeProducts(search),
}))(({ products }: { products: Product[] }) => {
  console.log(`[ProductList] Rendering ${products.length} items.`);

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View style={{ padding: 15, borderBottomWidth: 0.5, borderColor: '#ccc' }}>
          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ color: '#666' }}>{item.sku}</Text>
        </View>
      )}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text style={{ padding: 20 }}>No products found.</Text>}
    />
  );
});

export default function HomeScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={{ flex: 1, paddingTop: 60, backgroundColor: '#fff' }}>
      <TextInput
        placeholder="Search 100,000 products..."
        value={search}
        onChangeText={setSearch}
        style={{
          height: 50,
          borderWidth: 1,
          borderColor: '#ddd',
          margin: 10,
          paddingHorizontal: 15,
          borderRadius: 8
        }}
      />
      <ProductList search={search} />
    </View>
  );
}