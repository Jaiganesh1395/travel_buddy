import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function DestinationCard({ destination }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: destination.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{destination.name}</Text>
        <Text style={styles.country}>{destination.country}</Text>
        <Text style={styles.tagline}>{destination.tagline}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  country: {
    color: colors.muted,
    fontSize: 13,
  },
  tagline: {
    color: colors.text,
    fontSize: 12,
  },
});
