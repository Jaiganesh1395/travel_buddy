import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchBar } from '../components/SearchBar';
import { DestinationCard } from '../components/DestinationCard';
import { colors, gradients } from '../theme/colors';
import { api } from '../api/client';

export function DashboardSection() {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations(query) {
    try {
      setLoading(true);
      const data = await api.listDestinations(query);
      setDestinations(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={gradients.dashboard} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Your Travel Dashboard</Text>
          <Text style={styles.headerSubtitle}>Access your saved itineraries and plan new adventures</Text>
          <View style={styles.actions}>
            <Text style={styles.action}>View Favorites</Text>
            <Text style={styles.action}>All Itineraries</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <SearchBar value={search} onChange={setSearch} onSubmit={() => loadDestinations(search)} />
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={destinations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <DestinationCard destination={item} />
            </View>
          )}
          numColumns={1}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    gap: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  action: {
    color: 'white',
    fontWeight: '700',
  },
  body: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  list: {
    paddingVertical: 12,
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
});
