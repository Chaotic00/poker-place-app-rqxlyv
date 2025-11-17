
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { StorageService } from '@/utils/storage';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSaveNickname = async () => {
    if (!user) return;

    const users = await StorageService.getUsers();
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, nickname } : u
    );
    await StorageService.saveUsers(updatedUsers);
    await refreshUser();
    setIsEditing(false);
    Alert.alert('Success', 'Nickname updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('=== USER CONFIRMED LOGOUT ===');
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.log('Logout error in profile:', error);
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>👤</Text>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={commonStyles.card}>
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user.full_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                user.status === 'admin' && styles.statusBadgeAdmin,
                user.status === 'approved' && styles.statusBadgeApproved,
              ]}>
                <Text style={styles.statusBadgeText}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Nickname</Text>
            
            {isEditing ? (
              <>
                <TextInput
                  style={commonStyles.input}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Enter nickname"
                  placeholderTextColor={colors.textSecondary}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.editButton]}
                    onPress={handleSaveNickname}
                  >
                    <Text style={buttonStyles.text}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[buttonStyles.outline, styles.editButton]}
                    onPress={() => {
                      setNickname(user.nickname);
                      setIsEditing(false);
                    }}
                  >
                    <Text style={buttonStyles.outlineText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.nicknameValue}>@{user.nickname}</Text>
                <TouchableOpacity
                  style={[buttonStyles.outline, styles.editNicknameButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={buttonStyles.outlineText}>Edit Nickname</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {user.status === 'admin' && (
          <View style={commonStyles.card}>
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Admin Actions</Text>
              <Text style={styles.adminDescription}>
                Access admin portal to manage users and tournaments
              </Text>
              <TouchableOpacity
                style={[buttonStyles.secondary, styles.adminButton]}
                onPress={() => router.push('/admin/user-approvals')}
              >
                <Text style={buttonStyles.text}>👥 User Approvals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.secondary, styles.adminButton]}
                onPress={() => router.push('/admin/tournament-management')}
              >
                <Text style={buttonStyles.text}>🎯 Tournament Management</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.secondary, styles.adminButton]}
                onPress={() => router.push('/admin/rsvp-viewer')}
              >
                <Text style={buttonStyles.text}>📋 RSVP Viewer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            buttonStyles.outline, 
            styles.logoutButton, 
            { borderColor: colors.error },
            isLoggingOut && styles.logoutButtonDisabled
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Text style={[buttonStyles.outlineText, { color: colors.error }]}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  profileSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  adminDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.textSecondary,
  },
  statusBadgeAdmin: {
    backgroundColor: colors.secondary,
  },
  statusBadgeApproved: {
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  nicknameValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  editNicknameButton: {
    marginTop: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  adminButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 16,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
});
