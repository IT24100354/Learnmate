import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../utils/api';

type NamedItem = { _id: string; name: string };
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ManageTimetableScreen() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('MONDAY');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('');

  const [subjects, setSubjects] = useState<NamedItem[]>([]);
  const [classes, setClasses] = useState<NamedItem[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [subjectsRes, classesRes, timetableRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/timetables/list')
      ]);

      const filteredSubjects: NamedItem[] = subjectsRes.data?.subjects ?? [];
      const filteredClasses: NamedItem[] = classesRes.data ?? [];

      setSubjects(filteredSubjects);
      setClasses(filteredClasses);
      setTimetable(timetableRes.data?.timetables || timetableRes.data || []);
    } catch {
      Alert.alert('Error', 'Failed to load classes and subjects');
    } finally {
      setLoading(false);
    }
  };

  const calculateUniqueItems = (items: NamedItem[]) => {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  };

  const handleCreate = async () => {
    if (!title.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Validation', 'Please provide a title, start time, and end time');
      return;
    }

    if (!subjectId || !classId) {
      Alert.alert('Validation', 'Please select both class and subject');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        subjectId,
        classId,
        day,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        room: room.trim(),
        teacherId: undefined // Let backend resolve from token
      };

      await api.post('/timetables', payload);

      Alert.alert('Success', 'Timetable slot created successfully!');
      setTitle('');
      setStartTime('08:00');
      setEndTime('09:00');
      setRoom('');
      setSubjectId('');
      setClassId('');
      loadOptions(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Creation Failed', error?.response?.data?.message || 'There was an issue creating the timetable session.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const uniqueSubjects = calculateUniqueItems(subjects);
  const uniqueClasses = calculateUniqueItems(classes);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Manage Timetable</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Math Double Period"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Select Class</Text>
      <View style={styles.optionWrap}>
        {uniqueClasses.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.optionChip, classId === item._id && styles.optionChipSelected]}
            onPress={() => setClassId(item._id)}
          >
            <Text style={[styles.optionText, classId === item._id && styles.optionTextSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select Subject</Text>
      <View style={styles.optionWrap}>
        {uniqueSubjects.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.optionChip, subjectId === item._id && styles.optionChipSelected]}
            onPress={() => setSubjectId(item._id)}
          >
            <Text style={[styles.optionText, subjectId === item._id && styles.optionTextSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Select Day</Text>
      <View style={styles.optionWrap}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.optionChip, day === d && styles.optionChipSelected]}
            onPress={() => setDay(d)}
          >
            <Text style={[styles.optionText, day === d && styles.optionTextSelected]}>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Start Time (HH:MM)</Text>
      <TextInput
        style={styles.input}
        placeholder="08:00"
        value={startTime}
        onChangeText={setStartTime}
      />

      <Text style={styles.label}>End Time (HH:MM)</Text>
      <TextInput
        style={styles.input}
        placeholder="09:00"
        value={endTime}
        onChangeText={setEndTime}
      />

      <Text style={styles.label}>Room (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Room 101"
        value={room}
        onChangeText={setRoom}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handleCreate} disabled={saving}>
        <Text style={styles.uploadText}>{saving ? 'Saving...' : 'Add Session'}</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        <Text style={styles.listHeader}>Current Schedule</Text>
        {timetable.map((session, index) => (
          <View key={session._id || index} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{session.title || 'Session'}</Text>
              <Text style={styles.cardSub}>Day: {session.day}</Text>
              <Text style={styles.cardSub}>Time: {session.startTime} - {session.endTime}</Text>
              <Text style={styles.cardSub}>Subject: {session.subject?.name || 'N/A'}</Text>
              <Text style={styles.cardSub}>Class: {session.schoolClass?.name || 'N/A'}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 6,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  uploadBtn: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 20,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  }
});
