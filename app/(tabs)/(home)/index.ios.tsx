
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Tournament, RSVP } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tournamentsData = await StorageService.getTournaments();
    const rsvpsData = await StorageService.getRSVPs();
    
    const sortedTournaments = tournamentsData.sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
    
    setTournaments(sortedTournaments);
    setRsvps(rsvpsData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRSVP = async (tournamentId: string, event: any) => {
    // Stop event propagation to prevent navigation
    event.stopPropagation();
    
    if (!user) return;

    const existingRSVP = rsvps.find(
      r => r.tournament_id === tournamentId && r.user_id === user.id
    );

    let updatedRsvps: RSVP[];
    if (existingRSVP) {
      updatedRsvps = rsvps.filter(r => r.id !== existingRSVP.id);
    } else {
      const newRSVP: RSVP = {
        id: Date.now().toString(),
        user_id: user.id,
        tournament_id: tournamentId,
        timestamp: new Date().toISOString(),
      };
      updatedRsvps = [...rsvps, newRSVP];
    }

    await StorageService.saveRSVPs(updatedRsvps);
    setRsvps(updatedRsvps);
  };

  const handleTournamentPress = (tournamentId: string) => {
    console.log('Navigating to tournament details:', tournamentId);
    router.push({
      pathname: '/tournament-details',
      params: { id: tournamentId }
    });
  };

  const isRSVPd = (tournamentId: string) => {
    return rsvps.some(r => r.tournament_id === tournamentId && r.user_id === user?.id);
  };

  const getRSVPCount = (tournamentId: string) => {
    return rsvps.filter(r => r.tournament_id === tournamentId).length;
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
    <>
      <Stack.Screen
        options={{
          title: "♠️ The Poker Place",
          headerLargeTitle: true,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {tournaments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🃏</Text>
              <Text style={styles.emptyText}>No tournaments scheduled</Text>
            </View>
          ) : (
            tournaments.map((tournament, index) => {
              const rsvpCount = getRSVPCount(tournament.id);
              const isUserRSVPd = isRSVPd(tournament.id);
              const isFull = rsvpCount >= tournament.max_players;

              return (
                <React.Fragment key={index}>
                  <View style={commonStyles.card}>
                    <TouchableOpacity
                      onPress={() => handleTournamentPress(tournament.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.tournamentHeader}>
                        <Text style={styles.tournamentName}>{tournament.name}</Text>
                        {isUserRSVPd && (
                          <View style={styles.rsvpBadge}>
                            <Text style={styles.rsvpBadgeText}>✓ RSVP&apos;d</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.tournamentInfo}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoIcon}>📅</Text>
                          <Text style={styles.infoText}>{formatDate(tournament.date_time)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoIcon}>💰</Text>
                          <Text style={styles.infoText}>Buy-in: {tournament.buy_in}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoIcon}>👥</Text>
                          <Text style={styles.infoText}>
                            {rsvpCount} {rsvpCount === 1 ? 'player' : 'players'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {user?.status === 'approved' && (
                      <TouchableOpacity
                        style={[
                          styles.rsvpButton,
                          isUserRSVPd && styles.rsvpButtonActive,
                          isFull && !isUserRSVPd && styles.rsvpButtonDisabled,
                        ]}
                        onPress={(e) => {
                          if (!isFull || isUserRSVPd) {
                            handleRSVP(tournament.id, e);
                          }
                        }}
                        disabled={isFull && !isUserRSVPd}
                      >
                        <Text style={[
                          styles.rsvpButtonText,
                          isUserRSVPd && styles.rsvpButtonTextActive,
                        ]}>
                          {isFull && !isUserRSVPd ? 'Full' : isUserRSVPd ? 'Cancel RSVP' : 'RSVP'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </React.Fragment>
              );
            })
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
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
  rsvpBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rsvpBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  tournamentInfo: {
    marginBottom: 16,
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
  rsvpButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  rsvpButtonActive: {
    backgroundColor: colors.textSecondary,
  },
  rsvpButtonDisabled: {
    backgroundColor: colors.border,
  },
  rsvpButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  rsvpButtonTextActive: {
    color: colors.card,
  },
});
