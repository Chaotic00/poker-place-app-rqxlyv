
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function RequestAccessScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!fullName || !email || !phone || !nickname || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await register({
      full_name: fullName,
      email,
      phone,
      nickname,
      password,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Request Submitted',
        'Your registration request has been submitted. You will be notified once approved.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/welcome'),
          },
        ]
      );
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/fd7338a8-fef1-4474-876e-ff41e60fa21d.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Request Access</Text>
          <Text style={commonStyles.textSecondary}>Join our poker community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Full Name</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Email</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Phone Number</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Preferred Nickname</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your poker nickname"
              placeholderTextColor={colors.textSecondary}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Password</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Create a password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[buttonStyles.primary, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={buttonStyles.text}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>← Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 240,
    height: 140,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
