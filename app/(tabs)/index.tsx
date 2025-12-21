import React, { useState } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import Product from '../../model/product';

// Search query using Q.like for efficiency [cite: 1001, 1005]
const observeProducts = (search: string) =>
  database.get<Product>('products').query(
    Q.where('name', Q.like(`%${Q.sanitizeLikeString(search)}%`))
  ).observe();

const ProductList = withObservables(['search'], ({ search }) => ({
  products: observeProducts(search),
}))(({ products }: { products: Product[] }) => (
  <FlatList
    data={products}
    renderItem={({ item }) => <Text style={{ padding: 10 }}>{item.name}</Text>}
    keyExtractor={item => item.id}
  />
));

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
      <TextInput
        placeholder="Search Products..."
        value={search}
        onChangeText={setSearch}
        style={{ height: 40, borderBottomWidth: 1, margin: 10 }}
      />
      <ProductList search={search} />
    </View>
  );
}