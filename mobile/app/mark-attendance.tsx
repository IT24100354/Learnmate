import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import api from '../utils/api';
import { useLocalSearchParams } from 'expo-router';

type NamedItem = { _id: string; name: string };
type Student = { _id: string; name: string; username: string };

type AttendanceRosterResponse = {
  schoolClass: NamedItem;
  subject?: NamedItem;
  students: Student[];
  attendanceDate: string;
  presentStudentIds: string[];
  sessionNotes?: string;
};

export default function MarkAttendanceScreen() {
  const params = useLocalSearchParams();
  const [classes, setClasses] = useState<NamedItem[]>([]);
  const [subjects, setSubjects] = useState<NamedItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(params.classId ? String(params.classId) : '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [sessionNotes, setSessionNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await api.get('/attendance/mark');
      setClasses(response.data?.schoolClasses ?? []);
      setSubjects(response.data?.subjects ?? []);
      setSelectedDate(response.data?.currentDate ?? new Date().toISOString().slice(0, 10));
    } catch {
      Alert.alert('Attendance', 'Failed to load classes for attendance.');
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = useMemo(
    () => classes.find((item) => item._id === selectedClassId) || null,
    [classes, selectedClassId]
  );

  const selectedSubject = useMemo(
    () => subjects.find((item) => item._id === selectedSubjectId) || null,
    [subjects, selectedSubjectId]
  );

  const loadRoster = async () => {
    if (!selectedClassId) {
      Alert.alert('Validation', 'Please select a class first.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<AttendanceRosterResponse>(`/attendance/mark/${selectedClassId}`, {
        params: {
          subjectId: selectedSubjectId || undefined,
          date: selectedDate,
        },
      });

      const rosterStudents = response.data?.students ?? [];
      const initialPresent: Record<string, boolean> = {};
      rosterStudents.forEach((student) => {
        initialPresent[student._id] = false;
      });

      (response.data?.presentStudentIds ?? []).forEach((studentId) => {
        initialPresent[studentId] = true;
      });

      setStudents(rosterStudents);
      setPresentMap(initialPresent);
      setSessionNotes(response.data?.sessionNotes ?? '');
    } catch (error: any) {
      Alert.alert('Attendance', error?.response?.data?.message || 'Failed to load attendance roster');
    } finally {
      setLoading(false);
    }
  };

  const submitAttendance = async () => {
    if (!selectedClassId) {
      Alert.alert('Validation', 'Please select a class first.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/attendance/mark/${selectedClassId}`, {
        subjectId: selectedSubjectId || undefined,
        date: selectedDate,
        attendance: presentMap,
        notes: sessionNotes,
      });

      Alert.alert('Success', 'Attendance marked successfully.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.center} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mark Attendance</Text>

      <Text style={styles.label}>Class</Text>
      <View style={styles.optionWrap}>
        {classes.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.optionChip, selectedClassId === item._id && styles.optionChipSelected]}
            onPress={() => setSelectedClassId(item._id)}
          >
            <Text style={selectedClassId === item._id ? styles.optionTextSelected : styles.optionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Subject</Text>
      <View style={styles.optionWrap}>
        <TouchableOpacity
          style={[styles.optionChip, selectedSubjectId === '' && styles.optionChipSelected]}
          onPress={() => setSelectedSubjectId('')}
        >
          <Text style={selectedSubjectId === '' ? styles.optionTextSelected : styles.optionText}>General</Text>
        </TouchableOpacity>
        {subjects.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.optionChip, selectedSubjectId === item._id && styles.optionChipSelected]}
            onPress={() => setSelectedSubjectId(item._id)}
          >
            <Text style={selectedSubjectId === item._id ? styles.optionTextSelected : styles.optionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={selectedDate}
        onChangeText={setSelectedDate}
      />

      <TouchableOpacity style={styles.loadButton} onPress={loadRoster}>
        <Text style={styles.loadButtonText}>Load Roster</Text>
      </TouchableOpacity>

      {students.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText}>Select class and subject, then load roster.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={styles.selectionSummary}>
            {selectedClass?.name || 'Class'} {selectedSubject ? `- ${selectedSubject.name}` : '- General'}
          </Text>

          <FlatList
            data={students}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <Text style={styles.studentName}>{item.name}</Text>
                <View style={styles.btnGroup}>
                  <TouchableOpacity
                    style={[styles.btn, styles.presentBtn]}
                    onPress={() => setPresentMap((prev) => ({ ...prev, [item._id]: true }))}
                  >
                    <Text style={styles.btnText}>Present</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.absentBtn]}
                    onPress={() => setPresentMap((prev) => ({ ...prev, [item._id]: false }))}
                  >
                    <Text style={styles.btnText}>Absent</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.stateText}>{presentMap[item._id] ? 'Marked Present' : 'Marked Absent'}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No students in this class.</Text>}
          />

          <Text style={styles.label}>Session Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={sessionNotes}
            onChangeText={setSessionNotes}
            multiline
            placeholder="Optional notes for this attendance session"
          />

          <TouchableOpacity style={styles.submitButton} onPress={submitAttendance} disabled={submitting}>
            <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Save Attendance'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: '#374151',
    fontWeight: '600',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  optionChipSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  optionText: {
    color: '#374151',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  loadButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  selectionSummary: {
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  emptyBlock: {
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
  },
  emptyText: {
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  studentCard: {
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#ffffff',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  studentName: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  btnGroup: {
    flexDirection: 'row',
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  presentBtn: {
    backgroundColor: '#34C759',
  },
  absentBtn: {
    backgroundColor: '#FF3B30',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stateText: {
    marginTop: 8,
    fontSize: 12,
    color: '#374151',
  },
});
