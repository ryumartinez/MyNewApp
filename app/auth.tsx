import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import {setAuthToken} from "@/database/sync";

export default function Auth() {
  const [token, setToken] = useState('');

  const handleApplyToken = () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter a valid token');
      return;
    }

    setAuthToken(token.trim());
    Alert.alert('Success', 'Access token applied to Axios interceptor');
  };

  return (
    <View style={styles.container}>
      <Button title="Apply Token" onPress={handleApplyToken} color="#007AFF" />
      <Text style={styles.label}>Access Token (JWT)</Text>
      <TextInput
        style={styles.input}
        value={token}
        onChangeText={setToken}
        placeholder="paste your bearer token here..."
        multiline
        autoCapitalize="none"
        autoCorrect={false}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
});