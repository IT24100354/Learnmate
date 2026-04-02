import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';
import { downloadAndShareApiFile } from '../utils/download';

type Subject = { _id: string; name: string };
type SchoolClass = { _id: string; name: string };
type Exam = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  passMark: number;
  maxMarks: number;
  subject?: Subject;
  schoolClass?: SchoolClass;
  filePath?: string;
};

export default function ExamsScreen() {
  const [role, setRole] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingExamId, setUploadingExamId] = useState<string | null>(null);
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);

  const loadExams = async () => {
    try {
      const savedRole = await SecureStore.getItemAsync('userRole');
      setRole(savedRole || '');

      const response = await api.get('/exams/list');
      setExams(response.data?.exams ?? []);
    } catch (error) {
      console.error(error);
      setExams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const uploadAnswer = async (examId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/pdf'],
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      setUploadingExamId(examId);
      const file = result.assets[0];

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'answer.pdf',
        type: file.mimeType || 'application/pdf',
      } as unknown as Blob);

      await api.post(`/exams/upload-answer/${examId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Answer sheet uploaded successfully!');
    } catch (error: any) {
      Alert.alert('Upload Failed', error?.response?.data?.message || 'Failed to upload answer sheet');
    } finally {
      setUploadingExamId(null);
    }
  };

  const downloadExamFile = async (exam: Exam) => {
    try {
      setDownloadingExamId(exam._id);
      const titleSlug = exam.title && exam.title.trim() ? exam.title.trim() : `exam_${exam._id}`;
      const fileName = `${titleSlug}.pdf`;

      const downloadResult = await downloadAndShareApiFile({
        endpoint: `/exams/download/${exam._id}`,
        fileName,
        dialogTitle: 'Open or share exam file',
      });

      if (!downloadResult.shared) {
        Alert.alert('Downloaded', `Exam saved to ${downloadResult.uri}`);
      }
    } catch (error: any) {
      Alert.alert('Download Failed', error?.message || 'Unable to download exam file');
    } finally {
      setDownloadingExamId(null);
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
    <FlatList
      data={exams}
      keyExtractor={(item) => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadExams(); }} />}
      contentContainerStyle={exams.length === 0 ? styles.center : styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No exams found.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>Subject: {item.subject?.name || '-'}</Text>
          <Text style={styles.meta}>Class: {item.schoolClass?.name || '-'}</Text>
          <Text style={styles.meta}>Date: {new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.score}>Pass: {item.passMark} / {item.maxMarks}</Text>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

          {item.filePath ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => downloadExamFile(item)}
              disabled={downloadingExamId === item._id}
            >
              <Text style={styles.secondaryButtonText}>
                {downloadingExamId === item._id ? 'Downloading...' : 'Download Exam File'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {role === 'STUDENT' ? (
            <TouchableOpacity style={styles.button} onPress={() => uploadAnswer(item._id)} disabled={uploadingExamId === item._id}>
              <Text style={styles.buttonText}>{uploadingExamId === item._id ? 'Uploading...' : 'Upload Answer Sheet'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 3,
  },
  score: {
    marginTop: 6,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  description: {
    marginTop: 6,
    color: '#374151',
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  empty: {
    color: '#6b7280',
    fontSize: 15,
  },
});
