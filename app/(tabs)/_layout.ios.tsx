
import React, { useEffect } from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
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

  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="my-tournaments" name="my-tournaments">
        <Icon sf="calendar" />
        <Label>My RSVPs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      {user.status === 'admin' && (
        <NativeTabs.Trigger key="admin" name="admin">
          <Icon sf="gearshape.fill" />
          <Label>Admin</Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
