import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [place, setPlace] = useState('Sol Cafe');
  const [guestType, setGuestType] = useState('Walk-in Guest');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill current time on mount
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCheckInTime(`${hours}:${minutes}`);
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter guest name');
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Error', 'Please enter valid phone number');
      return false;
    }
    if (!pax || parseInt(pax) <= 0) {
      Alert.alert('Error', 'Please enter valid number of pax');
      return false;
    }
    if (!checkInTime.trim()) {
      Alert.alert('Error', 'Please enter check-in time');
      return false;
    }
    if (guestType === 'Room Guest' && !roomNumber.trim()) {
      Alert.alert('Error', 'Please enter room number for room guest');
      return false;
    }
    return true;
  };

  const generateMessage = () => {
    let message = `Guest Name: ${name}\n`;
    message += `Phone: +91${phone}\n`;
    message += `Pax: ${pax}\n`;
    message += `Check-in: ${checkInTime}\n`;
    message += `Place: ${place}\n`;
    message += `Type: ${guestType}`;
    if (guestType === 'Room Guest' && roomNumber) {
      message += ` (Room ${roomNumber})`;
    }
    return message;
  };

  const handleSendToWhatsApp = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Save to database
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone: `+91${phone}`,
          pax: parseInt(pax),
          check_in_time: checkInTime,
          place,
          guest_type: guestType,
          room_number: guestType === 'Room Guest' ? roomNumber : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save guest entry');
      }

      // Get WhatsApp target from settings
      const settingsResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/settings`);
      const settings = await settingsResponse.json();

      if (!settings.whatsapp_target) {
        Alert.alert(
          'WhatsApp Not Configured',
          'Please configure WhatsApp number in Settings first',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Generate message
      const message = generateMessage();
      const encodedMessage = encodeURIComponent(message);
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${settings.whatsapp_target}?text=${encodedMessage}`;

      // Open WhatsApp
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        
        // Clear form after successful send
        setName('');
        setPhone('');
        setPax('');
        setRoomNumber('');
        setGuestType('Walk-in Guest');
        setPlace('Sol Cafe');
        
        // Reset time
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        setCheckInTime(`${hours}:${minutes}`);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process guest entry');
    } finally {
      setLoading(false);
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
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Guest Entry</Text>
            <Link href="/settings" asChild>
              <TouchableOpacity style={styles.settingsButton}>
                <Text style={styles.settingsButtonText}>⚙️</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Guest Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter guest name"
                placeholderTextColor="#666"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phonePrefix}>+91</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Pax */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Pax</Text>
              <TextInput
                style={styles.input}
                value={pax}
                onChangeText={setPax}
                placeholder="Enter number of guests"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            {/* Check-in Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Check-in Time</Text>
              <TextInput
                style={styles.input}
                value={checkInTime}
                onChangeText={setCheckInTime}
                placeholder="HH:MM"
                placeholderTextColor="#666"
              />
            </View>

            {/* Place */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Place</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={place}
                  onValueChange={(itemValue) => setPlace(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Sol Cafe" value="Sol Cafe" />
                  <Picker.Item label="Poolside" value="Poolside" />
                </Picker>
              </View>
            </View>

            {/* Guest Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Guest Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={guestType}
                  onValueChange={(itemValue) => setGuestType(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Walk-in Guest" value="Walk-in Guest" />
                  <Picker.Item label="Room Guest" value="Room Guest" />
                </Picker>
              </View>
            </View>

            {/* Room Number - Conditional */}
            {guestType === 'Room Guest' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Room Number</Text>
                <TextInput
                  style={styles.input}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  placeholder="Enter room number"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSendToWhatsApp}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? 'Processing...' : 'Send to WhatsApp'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phonePrefix: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontWeight: '600',
    minHeight: 56,
    textAlignVertical: 'center',
  },
  phoneInput: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    minHeight: 56,
    justifyContent: 'center',
  },
  picker: {
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 60,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1a8c47',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});