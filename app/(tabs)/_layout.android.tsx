
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      androidIcon: 'home',
      iosIcon: 'house.fill',
      label: 'Home',
    },
    {
      name: 'my-tournaments',
      route: '/(tabs)/my-tournaments',
      androidIcon: 'event',
      iosIcon: 'calendar',
      label: 'My RSVPs',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      androidIcon: 'person',
      iosIcon: 'person.fill',
      label: 'Profile',
    },
  ];

  if (user.status === 'admin') {
    tabs.push({
      name: 'admin',
      route: '/(tabs)/admin',
      androidIcon: 'settings',
      iosIcon: 'gearshape.fill',
      label: 'Admin',
    });
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="my-tournaments" name="my-tournaments" />
        <Stack.Screen key="profile" name="profile" />
        {user.status === 'admin' && <Stack.Screen key="admin" name="admin" />}
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
