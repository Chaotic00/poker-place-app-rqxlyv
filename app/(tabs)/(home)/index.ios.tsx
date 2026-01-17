
import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Tournament, RSVP, CashGame, CashGameRSVP } from '@/types';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';

type ViewMode = 'tournaments' | 'cashgames';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [cashGameRsvps, setCashGameRsvps] = useState<CashGameRSVP[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Loading home screen data');
    const tournamentsData = await StorageService.getTournaments();
    const rsvpsData = await StorageService.getRSVPs();
    const cashGamesData = await StorageService.getCashGames();
    const cashGameRsvpsData = await StorageService.getCashGameRSVPs();
    
    const sortedTournaments = tournamentsData.sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
    
    setTournaments(sortedTournaments);
    setRsvps(rsvpsData);
    setCashGames(cashGamesData);
    setCashGameRsvps(cashGameRsvpsData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTournamentRSVP = async (tournamentId: string, event: any) => {
    event.stopPropagation();
    
    if (!user) return;

    console.log('User toggling tournament RSVP:', tournamentId);

    const existingRSVP = rsvps.find(
      r => r.tournament_id === tournamentId && r.user_id === user.id
    );

    let updatedRsvps: RSVP[];
    if (existingRSVP) {
      updatedRsvps = rsvps.filter(r => r.id !== existingRSVP.id);
      console.log('Cancelled tournament RSVP');
    } else {
      const newRSVP: RSVP = {
        id: Date.now().toString(),
        user_id: user.id,
        tournament_id: tournamentId,
        timestamp: new Date().toISOString(),
      };
      updatedRsvps = [...rsvps, newRSVP];
      console.log('Created tournament RSVP');
    }

    await StorageService.saveRSVPs(updatedRsvps);
    setRsvps(updatedRsvps);
  };

  const handleCashGameRSVP = async (cashGameId: string, event: any) => {
    event.stopPropagation();
    
    if (!user) return;

    console.log('User toggling cash game waitlist:', cashGameId);

    const existingRSVP = cashGameRsvps.find(
      r => r.cash_game_id === cashGameId && r.user_id === user.id
    );

    let updatedRsvps: CashGameRSVP[];
    if (existingRSVP) {
      updatedRsvps = cashGameRsvps.filter(r => r.id !== existingRSVP.id);
      console.log('Removed from cash game waitlist');
    } else {
      const newRSVP: CashGameRSVP = {
        id: Date.now().toString(),
        user_id: user.id,
        cash_game_id: cashGameId,
        timestamp: new Date().toISOString(),
      };
      updatedRsvps = [...cashGameRsvps, newRSVP];
      console.log('Added to cash game waitlist');
    }

    await StorageService.saveCashGameRSVPs(updatedRsvps);
    setCashGameRsvps(updatedRsvps);
  };

  const handleTournamentPress = (tournamentId: string) => {
    console.log('Tournament card pressed, navigating to:', tournamentId);
    router.push(`/tournament-details?id=${tournamentId}`);
  };

  const isTournamentRSVPd = (tournamentId: string) => {
    return rsvps.some(r => r.tournament_id === tournamentId && r.user_id === user?.id);
  };

  const isCashGameRSVPd = (cashGameId: string) => {
    return cashGameRsvps.some(r => r.cash_game_id === cashGameId && r.user_id === user?.id);
  };

  const getTournamentRSVPCount = (tournamentId: string) => {
    return rsvps.filter(r => r.tournament_id === tournamentId).length;
  };

  const getCashGameRSVPCount = (cashGameId: string) => {
    return cashGameRsvps.filter(r => r.cash_game_id === cashGameId).length;
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

  const getGameTypeName = (gameType: string) => {
    return gameType === 'holdem' ? 'Hold\'em' : 'PLO';
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>♠️ The Poker Place</Text>
          
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                viewMode === 'tournaments' && styles.segmentButtonActive,
              ]}
              onPress={() => {
                console.log('Switching to tournaments view');
                setViewMode('tournaments');
              }}
            >
              <Text style={[
                styles.segmentButtonText,
                viewMode === 'tournaments' && styles.segmentButtonTextActive,
              ]}>
                Tournaments
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                viewMode === 'cashgames' && styles.segmentButtonActive,
              ]}
              onPress={() => {
                console.log('Switching to cash games view');
                setViewMode('cashgames');
              }}
            >
              <Text style={[
                styles.segmentButtonText,
                viewMode === 'cashgames' && styles.segmentButtonTextActive,
              ]}>
                Cash Games
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {viewMode === 'tournaments' ? (
            <>
              {tournaments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🃏</Text>
                  <Text style={styles.emptyText}>No tournaments scheduled</Text>
                </View>
              ) : (
                tournaments.map((tournament, index) => {
                  const rsvpCount = getTournamentRSVPCount(tournament.id);
                  const isUserRSVPd = isTournamentRSVPd(tournament.id);
                  const isFull = rsvpCount >= tournament.max_players;

                  return (
                    <React.Fragment key={index}>
                      <TouchableOpacity
                        style={styles.card}
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

                        {user?.status === 'approved' && (
                          <TouchableOpacity
                            style={[
                              styles.rsvpButton,
                              isUserRSVPd && styles.rsvpButtonActive,
                              isFull && !isUserRSVPd && styles.rsvpButtonDisabled,
                            ]}
                            onPress={(e) => {
                              if (!isFull || isUserRSVPd) {
                                handleTournamentRSVP(tournament.id, e);
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
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })
              )}
            </>
          ) : (
            <>
              {cashGames.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>💵</Text>
                  <Text style={styles.emptyText}>No cash games available</Text>
                </View>
              ) : (
                cashGames.map((cashGame, index) => {
                  const waitlistCount = getCashGameRSVPCount(cashGame.id);
                  const isUserWaitlisted = isCashGameRSVPd(cashGame.id);
                  const seatsAvailable = cashGame.seats_open > 0;

                  return (
                    <React.Fragment key={index}>
                      <View style={styles.card}>
                        <View style={styles.tournamentHeader}>
                          <Text style={styles.tournamentName}>{getGameTypeName(cashGame.game_type)}</Text>
                          {isUserWaitlisted && (
                            <View style={styles.rsvpBadge}>
                              <Text style={styles.rsvpBadgeText}>✓ Waitlisted</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.tournamentInfo}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoIcon}>💰</Text>
                            <Text style={styles.infoText}>Stakes: {cashGame.stakes}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoIcon}>🎲</Text>
                            <Text style={styles.infoText}>
                              Tables Running: {cashGame.tables_running}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoIcon}>💺</Text>
                            <Text style={styles.infoText}>
                              Seats Open: {cashGame.seats_open} / {cashGame.total_seats}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoIcon}>👥</Text>
                            <Text style={styles.infoText}>
                              Waitlist: {waitlistCount} {waitlistCount === 1 ? 'player' : 'players'}
                            </Text>
                          </View>
                        </View>

                        {user?.status === 'approved' && (
                          <TouchableOpacity
                            style={[
                              styles.rsvpButton,
                              isUserWaitlisted && styles.rsvpButtonActive,
                            ]}
                            onPress={(e) => {
                              handleCashGameRSVP(cashGame.id, e);
                            }}
                          >
                            <Text style={[
                              styles.rsvpButtonText,
                              isUserWaitlisted && styles.rsvpButtonTextActive,
                            ]}>
                              {isUserWaitlisted ? 'Remove from Waitlist' : 'Join Waitlist'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </React.Fragment>
                  );
                })
              )}
            </>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  rsvpBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rsvpBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  tournamentInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  rsvpButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  rsvpButtonActive: {
    backgroundColor: colors.secondary,
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
