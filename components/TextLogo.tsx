
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useFonts, Cinzel_400Regular, Cinzel_600SemiBold, Cinzel_900Black } from '@expo-google-fonts/cinzel';

interface TextLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function TextLogo({ size = 'medium', color = colors.card }: TextLogoProps) {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_900Black,
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
    borderRadius: 80,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderWidth: 4,
    width: 160,
    height: 100,
  },
  ovalMedium: {
    borderRadius: 120,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: 240,
    height: 140,
  },
  ovalLarge: {
    borderRadius: 160,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderWidth: 6,
    width: 320,
    height: 180,
  },
  the: {
    fontFamily: 'Cinzel_600SemiBold',
    letterSpacing: 3,
  },
  theSmall: {
    fontSize: 12,
  },
  theMedium: {
    fontSize: 16,
  },
  theLarge: {
    fontSize: 20,
  },
  poker: {
    fontFamily: 'Cinzel_900Black',
    letterSpacing: 4,
    marginVertical: -2,
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
    fontFamily: 'Cinzel_600SemiBold',
    letterSpacing: 3,
  },
  placeSmall: {
    fontSize: 12,
  },
  placeMedium: {
    fontSize: 16,
  },
  placeLarge: {
    fontSize: 20,
  },
});
