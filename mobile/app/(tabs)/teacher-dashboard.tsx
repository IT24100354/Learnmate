import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TeacherDashboard() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Teacher Dashboard</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/classes')}>
        <Text style={styles.cardTitle}>My Classes</Text>
        <Text style={styles.cardDesc}>Manage your assigned classes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/manage-timetable')}>
        <Text style={styles.cardTitle}>Manage Timetable</Text>
        <Text style={styles.cardDesc}>View your schedule and add new sessions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/create-exam')}>
        <Text style={styles.cardTitle}>Create Exam</Text>
        <Text style={styles.cardDesc}>Schedule and manage exams for your subjects</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/mark-attendance')}>
        <Text style={styles.cardTitle}>Mark Attendance</Text>
        <Text style={styles.cardDesc}>Take daily attendance for your classes</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.card} onPress={() => router.push('/enter-marks')}>
        <Text style={styles.cardTitle}>Enter Marks</Text>
        <Text style={styles.cardDesc}>Submit bulk exam scores</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/upload-materials')}>
        <Text style={styles.cardTitle}>Upload Materials</Text>
        <Text style={styles.cardDesc}>Share study materials and resources</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    color: '#666',
  }
});
