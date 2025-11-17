
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useFonts, Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';

interface TextLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function TextLogo({ size = 'medium', color = colors.card }: TextLogoProps) {
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const sizeStyles = {
    small: {
      oval: styles.ovalSmall,
      the: styles.theSmall,
      poker: styles.pokerSmall,
      place: styles.placeSmall,
    },
    medium: {
      oval: styles.ovalMedium,
      the: styles.theMedium,
      poker: styles.pokerMedium,
      place: styles.placeMedium,
    },
    large: {
      oval: styles.ovalLarge,
      the: styles.theLarge,
      poker: styles.pokerLarge,
      place: styles.placeLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.oval, currentSize.oval, { borderColor: color }]}>
      <Text style={[styles.the, currentSize.the, { color }]}>THE</Text>
      <Text style={[styles.poker, currentSize.poker, { color }]}>POKER</Text>
      <Text style={[styles.place, currentSize.place, { color }]}>PLACE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  oval: {
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ovalSmall: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderWidth: 4,
    width: 160,
    height: 100,
  },
  ovalMedium: {
    borderRadius: 70,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: 240,
    height: 140,
  },
  ovalLarge: {
    borderRadius: 90,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderWidth: 6,
    width: 320,
    height: 180,
  },
  the: {
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 1,
  },
  theSmall: {
    fontSize: 14,
  },
  theMedium: {
    fontSize: 18,
  },
  theLarge: {
    fontSize: 24,
  },
  poker: {
    fontFamily: 'Oswald_700Bold',
    letterSpacing: 2,
    marginVertical: -4,
  },
  pokerSmall: {
    fontSize: 24,
  },
  pokerMedium: {
    fontSize: 36,
  },
  pokerLarge: {
    fontSize: 48,
  },
  place: {
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 1,
  },
  placeSmall: {
    fontSize: 14,
  },
  placeMedium: {
    fontSize: 18,
  },
  placeLarge: {
    fontSize: 24,
  },
});
