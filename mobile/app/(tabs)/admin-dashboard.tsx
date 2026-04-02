import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Manage institution-wide exams, fees, and notifications.</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/exams')}>
        <Text style={styles.cardTitle}>Exams</Text>
        <Text style={styles.cardText}>Review all exam schedules and files.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/fees')}>
        <Text style={styles.cardTitle}>Fees</Text>
        <Text style={styles.cardText}>Create fee records and verify submitted payments.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/notifications')}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.cardText}>Broadcast updates to classes, roles, and subjects.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
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
    borderLeftColor: '#1d4ed8',
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
