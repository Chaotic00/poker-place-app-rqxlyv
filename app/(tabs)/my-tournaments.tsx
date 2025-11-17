
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Tournament, RSVP } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function MyTournamentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const rsvps = await StorageService.getRSVPs();
    const myRsvps = rsvps.filter(r => r.user_id === user.id);
    
    const tournaments = await StorageService.getTournaments();
    const myTournamentsList = tournaments.filter(t => 
      myRsvps.some(r => r.tournament_id === t.id)
    ).sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );

    setMyTournaments(myTournamentsList);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My RSVPs</Text>
        <Text style={styles.headerSubtitle}>Tournaments you&apos;re attending</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {myTournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🃏</Text>
            <Text style={styles.emptyText}>You haven&apos;t RSVP&apos;d to any tournaments yet</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/(home)')}
            >
              <Text style={styles.browseButtonText}>Browse Tournaments</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myTournaments.map((tournament, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                key={tournament.id}
                style={commonStyles.card}
                onPress={() => router.push({
                  pathname: '/tournament-details',
                  params: { id: tournament.id }
                })}
                activeOpacity={0.7}
              >
                <View style={styles.tournamentHeader}>
                  <Text style={styles.tournamentName}>{tournament.name}</Text>
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedBadgeText}>✓</Text>
                  </View>
                </View>

                <View style={styles.tournamentInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📅</Text>
                    <Text style={styles.infoText}>{formatDate(tournament.date_time)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText}>{tournament.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>💰</Text>
                    <Text style={styles.infoText}>Buy-in: {tournament.buy_in}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))
        )}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  confirmedBadge: {
    backgroundColor: colors.success,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedBadgeText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  tournamentInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});
