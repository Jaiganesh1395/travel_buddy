import React from 'react';
import { ScrollView, View, StyleSheet, StatusBar } from 'react-native';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { DashboardSection } from './DashboardSection';
import { colors } from '../theme/colors';

export function HomeScreen({ onLogin }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Header onLogin={onLogin} />
        <Hero onCreate={() => {}} onExplore={() => {}} />
        <DashboardSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
    gap: 12,
  },
});
