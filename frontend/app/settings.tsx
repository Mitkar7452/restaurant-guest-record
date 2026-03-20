import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Settings() {
  const router = useRouter();
  const [whatsappTarget, setWhatsappTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/settings`);
      const data = await response.json();
      setWhatsappTarget(data.whatsapp_target || '');
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!whatsappTarget.trim()) {
      Alert.alert('Error', 'Please enter WhatsApp number or group link');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsapp_target: whatsappTarget,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      Alert.alert('Success', 'Settings saved successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WhatsApp Configuration</Text>
              <Text style={styles.description}>
                Enter the WhatsApp number (with country code) or group invite link where guest messages should be sent.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>WhatsApp Number / Group Link</Text>
                <TextInput
                  style={styles.input}
                  value={whatsappTarget}
                  onChangeText={setWhatsappTarget}
                  placeholder="e.g., 919876543210 or group link"
                  placeholderTextColor="#666"
                  editable={!loading}
                />
              </View>

              <View style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>Examples:</Text>
                <Text style={styles.exampleText}>• Phone: 919876543210</Text>
                <Text style={styles.exampleText}>• Group: https://chat.whatsapp.com/...</Text>
                <Text style={styles.exampleText}>• Or just the phone number without +</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, (saving || loading) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || loading}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#25D366',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 56,
  },
  exampleBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 60,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#1a8c47',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});