
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/(home)');
    } else {
      setError(result.error || 'Login failed');
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
          <Text style={styles.headerIcon}>♠️</Text>
          <Text style={commonStyles.title}>Welcome Back</Text>
          <Text style={commonStyles.textSecondary}>Login to your account</Text>
        </View>

        <View style={styles.form}>
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
            <Text style={commonStyles.inputLabel}>Password</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your password"
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
            style={[buttonStyles.primary, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={buttonStyles.text}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Alert.alert('Forgot Password', 'Please contact an administrator to reset your password.')}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>← Back to Welcome</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Admin: admin@pokerplace.com / admin123</Text>
          <Text style={styles.demoText}>User: john@example.com / password123</Text>
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
    marginBottom: 40,
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 8,
  },
  loginButton: {
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
  demoInfo: {
    marginTop: 40,
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
});
