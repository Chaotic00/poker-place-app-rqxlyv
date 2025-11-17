
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>♠️</Text>
          <Text style={styles.title}>The Poker Place</Text>
          <Text style={styles.subtitle}>Private Poker Community</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.button, { backgroundColor: colors.card }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[buttonStyles.text, { color: colors.primary }]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.button, { borderColor: colors.card }]}
            onPress={() => router.push('/request-access')}
          >
            <Text style={[buttonStyles.outlineText, { color: colors.card }]}>Request Access</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Private poker community — access by approval only
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
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.card,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
  footer: {
    fontSize: 14,
    color: colors.card,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
});
