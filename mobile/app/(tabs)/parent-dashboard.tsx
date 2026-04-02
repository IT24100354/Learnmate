import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ParentDashboard() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Parent Dashboard</Text>
      <Text style={styles.subtitle}>Track your children&apos;s progress, fees, and notifications.</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/fees' as any)}>
        <Text style={styles.cardTitle}>Fees</Text>
        <Text style={styles.cardText}>Review pending fees and submit payment slips.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/notifications' as any)}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.cardText}>View announcements sent to your family.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/results' as any)}>
        <Text style={styles.cardTitle}>Results</Text>
        <Text style={styles.cardText}>Review published marks for linked children.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  cardText: {
    color: '#4b5563',
    fontSize: 14,
  },
});
