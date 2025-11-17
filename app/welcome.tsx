
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import TextLogo from '@/components/TextLogo';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.black, colors.darkSilver, colors.silver]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <TextLogo size="large" color={colors.card} />
          <Text style={styles.subtitle}>Private Poker Club</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.requestButton]}
            onPress={() => router.push('/request-access')}
          >
            <Text style={styles.requestButtonText}>Request Access</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Private poker club — access by approval only
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: colors.card,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  loginButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  requestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.card,
  },
  requestButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    color: colors.card,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
});
