import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import Product from "@/database/product";
import {database} from "@/database";

// Prop types for the row [cite: 715]
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
  product: product.observe(), // Explicitly observing the model [cite: 861, 862]
}))(ProductRow);

// Prop types for the list [cite: 777]
interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => (
  <FlatList
    data={products}
    keyExtractor={(item) => item.id} // All models have a built-in 'id' string [cite: 282]
    renderItem={({ item }) => <EnhancedProductRow product={item} />}
  />
);

const enhance = withObservables([], () => ({
  products: database.get<Product>('products').query().observe(), // [cite: 814, 865]
}));

export default enhance(ProductList);

const styles = StyleSheet.create({
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { color: '#666' }
});