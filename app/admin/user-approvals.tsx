
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { User, UserStatus } from '@/types';
import { StorageService } from '@/utils/storage';
import { Picker } from '@react-native-picker/picker';

export default function UserApprovalsScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'admin'>('pending');

  useEffect(() => {
    console.log('User Approvals screen loaded');
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await StorageService.getUsers();
    console.log('Loaded users:', allUsers.length);
    setUsers(allUsers);
  };

  const handleApprove = async (userId: string) => {
    console.log('Admin approving user:', userId);
    Alert.alert(
      'Approve User',
      'Are you sure you want to approve this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            const updatedUsers = users.map(u =>
              u.id === userId ? { ...u, status: 'approved' as const } : u
            );
            await StorageService.saveUsers(updatedUsers);
            setUsers(updatedUsers);
            console.log('User approved successfully');
          },
        },
      ]
    );
  };

  const handleReject = async (userId: string) => {
    console.log('Admin rejecting user:', userId);
    Alert.alert(
      'Reject User',
      'Are you sure you want to reject this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const updatedUsers = users.map(u =>
              u.id === userId ? { ...u, status: 'rejected' as const } : u
            );
            await StorageService.saveUsers(updatedUsers);
            setUsers(updatedUsers);
            console.log('User rejected successfully');
          },
        },
      ]
    );
  };

  const handleChangeStatus = async (userId: string, currentStatus: UserStatus) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.log('User not found:', userId);
      return;
    }

    console.log('Admin changing user status for:', user.email, 'current status:', currentStatus);

    Alert.alert(
      'Change User Access Level',
      `Change access level for ${user.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Admin',
          onPress: async () => {
            console.log('Changing user to admin:', user.email);
            const updatedUsers = users.map(u =>
              u.id === userId ? { ...u, status: 'admin' as const } : u
            );
            await StorageService.saveUsers(updatedUsers);
            setUsers(updatedUsers);
            Alert.alert('Success', `${user.full_name} is now an admin.`);
          },
        },
        {
          text: 'Make Regular User',
          onPress: async () => {
            console.log('Changing user to approved:', user.email);
            const updatedUsers = users.map(u =>
              u.id === userId ? { ...u, status: 'approved' as const } : u
            );
            await StorageService.saveUsers(updatedUsers);
            setUsers(updatedUsers);
            Alert.alert('Success', `${user.full_name} is now a regular user.`);
          },
        },
        {
          text: 'Reject Access',
          style: 'destructive',
          onPress: async () => {
            console.log('Changing user to rejected:', user.email);
            const updatedUsers = users.map(u =>
              u.id === userId ? { ...u, status: 'rejected' as const } : u
            );
            await StorageService.saveUsers(updatedUsers);
            setUsers(updatedUsers);
            Alert.alert('Success', `${user.full_name}'s access has been rejected.`);
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(u => u.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'approved' && styles.filterButtonActive]}
          onPress={() => setFilter('approved')}
        >
          <Text style={[styles.filterButtonText, filter === 'approved' && styles.filterButtonTextActive]}>
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'rejected' && styles.filterButtonActive]}
          onPress={() => setFilter('rejected')}
        >
          <Text style={[styles.filterButtonText, filter === 'rejected' && styles.filterButtonTextActive]}>
            Rejected
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'admin' && styles.filterButtonActive]}
          onPress={() => setFilter('admin')}
        >
          <Text style={[styles.filterButtonText, filter === 'admin' && styles.filterButtonTextActive]}>
            Admins
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {filter} users</Text>
          </View>
        ) : (
          filteredUsers.map((user, index) => (
            <React.Fragment key={index}>
              <View style={commonStyles.card}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.full_name}</Text>
                  <View style={[
                    styles.statusBadge,
                    user.status === 'pending' && styles.statusBadgePending,
                    user.status === 'approved' && styles.statusBadgeApproved,
                    user.status === 'rejected' && styles.statusBadgeRejected,
                    user.status === 'admin' && styles.statusBadgeAdmin,
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nickname:</Text>
                    <Text style={styles.infoValue}>@{user.nickname}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Registered:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {user.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.actionButton]}
                      onPress={() => handleApprove(user.id)}
                    >
                      <Text style={buttonStyles.text}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[buttonStyles.outline, styles.actionButton, { borderColor: colors.error }]}
                      onPress={() => handleReject(user.id)}
                    >
                      <Text style={[buttonStyles.outlineText, { color: colors.error }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[buttonStyles.outline, styles.changeAccessButton]}
                  onPress={() => handleChangeStatus(user.id, user.status)}
                >
                  <Text style={buttonStyles.outlineText}>Change Access Level</Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[buttonStyles.outline, styles.closeButton]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.outlineText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: colors.accent,
  },
  statusBadgeApproved: {
    backgroundColor: colors.success,
  },
  statusBadgeRejected: {
    backgroundColor: colors.error,
  },
  statusBadgeAdmin: {
    backgroundColor: colors.primary,
  },
  statusBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 90,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  changeAccessButton: {
    width: '100%',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  closeButton: {
    width: '100%',
  },
});
