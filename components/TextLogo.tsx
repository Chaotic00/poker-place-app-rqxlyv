
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface TextLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function TextLogo({ size = 'medium', color = colors.card }: TextLogoProps) {
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
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ovalSmall: {
    borderRadius: 60,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  ovalMedium: {
    borderRadius: 80,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ovalLarge: {
    borderRadius: 100,
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  the: {
    fontWeight: '600',
    letterSpacing: 2,
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
    fontWeight: '900',
    letterSpacing: 3,
    marginVertical: 2,
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
    fontWeight: '600',
    letterSpacing: 2,
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
