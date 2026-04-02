import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../utils/api';

type NamedItem = { _id: string; name: string };

export default function CreateExamScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [passMark, setPassMark] = useState('40');

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
      const [subjectsRes, classesRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes')
      ]);

      const filteredSubjects: NamedItem[] = subjectsRes.data?.subjects ?? [];
      const filteredClasses: NamedItem[] = classesRes.data ?? [];

      setSubjects(filteredSubjects);
      setClasses(filteredClasses);
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
    if (!title.trim() || !date.trim()) {
      Alert.alert('Validation', 'Please provide a title and date (YYYY-MM-DD)');
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
        description: description.trim(),
        subjectId,
        schoolClassId: classId,
        date,
        maxMarks: Number(maxMarks),
        passMark: Number(passMark)
      };

      await api.post('/exams/create', payload);

      Alert.alert('Success', 'Exam created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
      setSubjectId('');
      setClassId('');
    } catch (error: any) {
      Alert.alert('Creation Failed', error?.response?.data?.message || 'There was an issue creating the exam.');
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
      <Text style={styles.header}>Create Exam</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Mid-Term Mathematics"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="2026-05-15"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Max Marks</Text>
      <TextInput
        style={styles.input}
        placeholder="100"
        value={maxMarks}
        onChangeText={setMaxMarks}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Pass Mark</Text>
      <TextInput
        style={styles.input}
        placeholder="40"
        value={passMark}
        onChangeText={setPassMark}
        keyboardType="numeric"
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

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Additional details..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handleCreate} disabled={saving}>
        <Text style={styles.uploadText}>{saving ? 'Creating...' : 'Create Exam'}</Text>
      </TouchableOpacity>
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
});
