
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/welcome');
    }
  }, [user, loading, router]);

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
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'my-tournaments',
      route: '/(tabs)/my-tournaments',
      icon: 'event',
      label: 'My RSVPs',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  if (user.status === 'admin') {
    tabs.push({
      name: 'admin',
      route: '/(tabs)/admin',
      icon: 'settings',
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
