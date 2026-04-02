import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../utils/api';

type NamedItem = { _id: string; name: string };

export default function MaterialsScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [subjects, setSubjects] = useState<NamedItem[]>([]);
  const [classes, setClasses] = useState<NamedItem[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
      ]);

      setSubjects(subjectsRes.data?.subjects ?? []);
      setClasses(classesRes.data ?? []);
    } catch {
      Alert.alert('Materials', 'Failed to load classes and subjects');
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setFile(result.assets[0]);
      }
    } catch {
      Alert.alert('Materials', 'Document picking failed');
    }
  };

  const uploadFile = async () => {
    if (!file || !title.trim()) {
      Alert.alert('Validation', 'Please provide a title and select a file');
      return;
    }

    if (!subjectId || !classId) {
      Alert.alert('Validation', 'Please select both class and subject');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subjectId', subjectId);
      formData.append('schoolClassId', classId);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as unknown as Blob);

      await api.post('/materials/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Material uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      setSubjectId('');
      setClassId('');
    } catch (error: any) {
      Alert.alert('Upload Failed', error?.response?.data?.message || 'There was an issue uploading the file.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Upload Material</Text>

      <TextInput
        style={styles.input}
        placeholder="Material Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Class</Text>
      <View style={styles.optionWrap}>
        {classes.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.optionChip, classId === item._id && styles.optionChipSelected]}
            onPress={() => setClassId(item._id)}
          >
            <Text style={classId === item._id ? styles.optionTextSelected : styles.optionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Subject</Text>
      <View style={styles.optionWrap}>
        {subjects.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.optionChip, subjectId === item._id && styles.optionChipSelected]}
            onPress={() => setSubjectId(item._id)}
          >
            <Text style={subjectId === item._id ? styles.optionTextSelected : styles.optionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.pickerBtn} onPress={pickDocument}>
        <Text style={styles.pickerText}>
          {file ? `Selected: ${file.name}` : 'Pick a File / Document'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBtn} onPress={uploadFile} disabled={uploading}>
        <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Upload Material'}</Text>
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
    paddingBottom: 30,
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
  pickerBtn: {
    backgroundColor: '#E5E5EA',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadBtn: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
