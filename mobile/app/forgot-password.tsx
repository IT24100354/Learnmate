import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { AxiosError } from 'axios';
import api, { getApiErrorMessage } from '../utils/api';

type ApiError = {
  message?: string;
};

const webInputReset = Platform.OS === 'web' ? ({ outlineStyle: 'none', boxShadow: 'none' } as any) : null;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const buildIdentifierPayload = () => {
    const trimmedIdentifier = identifier.trim();
    return trimmedIdentifier.includes('@')
      ? { email: trimmedIdentifier }
      : { username: trimmedIdentifier };
  };

  const requestOtp = async () => {
    if (submitting) return;

    if (!identifier.trim()) {
      Alert.alert('Validation Error', 'Enter your username or email.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password/request-otp', buildIdentifierPayload());
      setOtpSent(true);
      Alert.alert('OTP Sent', response.data?.message ?? 'OTP sent to your registered email address.');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      Alert.alert('OTP Failed', getApiErrorMessage(axiosError, 'Failed to send OTP.'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitReset = async () => {
    if (submitting) return;

    const trimmedOtp = otp.trim();
    if (!identifier.trim()) {
      Alert.alert('Validation Error', 'Enter your username or email.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      Alert.alert('Validation Error', 'Enter the 6-digit OTP sent to your email.');
      return;
    }

    if (!newPassword || !/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(newPassword)) {
      Alert.alert(
        'Validation Error',
        'New password must be at least 8 characters and include uppercase and lowercase letters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Password confirmation does not match.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...buildIdentifierPayload(),
        otp: trimmedOtp,
        newPassword,
      };

      const response = await api.post('/auth/forgot-password', payload);
      Alert.alert('Success', response.data?.message ?? 'Password reset successful.');
      router.replace('/');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      const message = getApiErrorMessage(axiosError, 'Password reset failed.');
      Alert.alert('Reset Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Request an OTP, then set your new password.</Text>

          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={[styles.input, webInputReset]}
            placeholder="Enter username or email"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!otpSent}
          />

          {!otpSent ? (
            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={requestOtp}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>{submitting ? 'Sending...' : 'Send OTP'}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.label}>OTP</Text>
              <TextInput
                style={[styles.input, webInputReset]}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                autoCapitalize="none"
                keyboardType="number-pad"
                maxLength={6}
              />

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={[styles.input, webInputReset]}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, webInputReset]}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryButton, submitting && styles.buttonDisabled]}
                onPress={submitReset}
                disabled={submitting}
              >
                <Text style={styles.primaryButtonText}>{submitting ? 'Updating...' : 'Reset Password'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                <Text style={styles.textButtonText}>Use a different username or email</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 14,
    marginBottom: 20,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    marginBottom: 14,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
  textButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
