import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function Header({ onNavigate, onLogin }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TripPlanner AI</Text>
      <View style={styles.nav}>
        {['Dashboard', 'Create Itinerary', 'Travel Info', 'Share & Export', 'Profile'].map(
          (item) => (
            <TouchableOpacity key={item} onPress={() => onNavigate?.(item)}>
              <Text style={styles.navItem}>{item}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  navItem: {
    color: colors.text,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
