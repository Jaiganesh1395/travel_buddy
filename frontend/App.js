import React, { useState } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { api } from './src/api/client';

export default function App() {
  const [user, setUser] = useState(null);

  async function handleLogin() {
    try {
      const data = await api.login('traveler@example.com');
      setUser(data.user);
      Alert.alert('Welcome', `Logged in as ${data.user.email}`);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen onLogin={handleLogin} user={user} />
    </SafeAreaView>
  );
}
