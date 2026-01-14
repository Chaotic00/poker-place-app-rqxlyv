
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';

export default function AdminScreen() {
  const router = useRouter();

  const adminActions = [
    {
      title: 'User Approvals',
      description: 'Approve or reject user registration requests',
      icon: '👥',
      route: '/admin/user-approvals',
    },
    {
      title: 'Tournament Management',
      description: 'Create, edit, and manage tournaments',
      icon: '🎯',
      route: '/admin/tournament-management',
    },
    {
      title: 'Cash Game Management',
      description: 'Manage stakes, tables running, and seats open',
      icon: '💵',
      route: '/admin/cash-game-management',
    },
    {
      title: 'Tournament RSVP Viewer',
      description: 'View RSVPs for all tournaments',
      icon: '📋',
      route: '/admin/rsvp-viewer',
    },
    {
      title: 'Cash Game RSVP Viewer',
      description: 'View and manage cash game RSVPs',
      icon: '💰',
      route: '/admin/cash-game-rsvp-viewer',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage users, tournaments, and cash games</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {adminActions.map((action, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={commonStyles.card}
              onPress={() => {
                console.log('Admin navigating to:', action.route);
                router.push(action.route as any);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.actionCard}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </React.Fragment>
        ))}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionArrow: {
    fontSize: 32,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
