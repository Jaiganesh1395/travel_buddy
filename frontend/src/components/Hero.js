import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

export function Hero({ onCreate, onExplore }) {
  return (
    <LinearGradient colors={gradients.hero} start={[0, 0]} end={[1, 1]} style={styles.container}>
      <Text style={styles.title}>Plan Your Perfect Trip with AI</Text>
      <Text style={styles.subtitle}>
        Create personalized itineraries in minutes. Let our intelligent travel assistant handle the
        details while you focus on the adventure.
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.primary]} onPress={onCreate}>
          <Text style={styles.primaryText}>Create New Itinerary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onExplore}>
          <Text style={styles.secondaryText}>Explore Destinations</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.surface,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: colors.surface,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.surface,
  },
  primaryText: {
    color: colors.primary,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
