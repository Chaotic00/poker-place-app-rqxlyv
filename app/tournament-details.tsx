
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Tournament, RSVP, User } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'main' | 'blinds';

export default function TournamentDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [rsvpUsers, setRsvpUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the tournament ID from params
  const tournamentId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  useEffect(() => {
    console.log('Tournament details screen mounted with params:', params);
    console.log('Tournament ID:', tournamentId);
    if (tournamentId) {
      loadData();
    } else {
      setError('No tournament ID provided');
      setLoading(false);
    }
  }, [tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading tournament data for ID:', tournamentId);
      const tournaments = await StorageService.getTournaments();
      console.log('Total tournaments:', tournaments.length);
      
      const foundTournament = tournaments.find(t => t.id === tournamentId);
      console.log('Found tournament:', foundTournament?.name);
      
      if (!foundTournament) {
        setError('Tournament not found');
        setLoading(false);
        return;
      }
      
      setTournament(foundTournament);

      const allRsvps = await StorageService.getRSVPs();
      const tournamentRsvps = allRsvps.filter(r => r.tournament_id === tournamentId);
      console.log('Tournament RSVPs:', tournamentRsvps.length);
      setRsvps(tournamentRsvps);

      const users = await StorageService.getUsers();
      const rsvpUserIds = tournamentRsvps.map(r => r.user_id);
      const rsvpUsersList = users.filter(u => rsvpUserIds.includes(u.id));
      setRsvpUsers(rsvpUsersList);
      
      setLoading(false);
    } catch (err) {
      console.log('Error loading tournament data:', err);
      setError('Failed to load tournament data');
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!user || !tournament) return;

    const existingRSVP = rsvps.find(r => r.user_id === user.id);
    const allRsvps = await StorageService.getRSVPs();

    let updatedRsvps: RSVP[];
    if (existingRSVP) {
      updatedRsvps = allRsvps.filter(r => r.id !== existingRSVP.id);
    } else {
      const newRSVP: RSVP = {
        id: Date.now().toString(),
        user_id: user.id,
        tournament_id: tournament.id,
        timestamp: new Date().toISOString(),
      };
      updatedRsvps = [...allRsvps, newRSVP];
    }

    await StorageService.saveRSVPs(updatedRsvps);
    await loadData();
  };

  const isRSVPd = rsvps.some(r => r.user_id === user?.id);
  const isFull = rsvps.length >= (tournament?.max_players || 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { marginTop: 16 }]}>Loading tournament...</Text>
      </View>
    );
  }

  if (error || !tournament) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Tournament not found'}</Text>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 20 }]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.text}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderInfoGrid = () => (
    <View style={styles.infoGrid}>
      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Event Name</Text>
          <Text style={styles.infoValue}>{tournament.name}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Game Type</Text>
          <Text style={styles.infoValue}>{tournament.game_type || 'Hold\'em'}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Date & Time</Text>
          <Text style={styles.infoValue}>{formatDate(tournament.date_time)}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Late Registration</Text>
          <Text style={styles.infoValue}>{tournament.late_registration || 'End of Level 3'}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Buy-In</Text>
          <Text style={styles.infoValue}>{tournament.buy_in}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Starting Chips</Text>
          <Text style={styles.infoValue}>{tournament.starting_chips || '10,000'}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Add On</Text>
          <Text style={styles.infoValue}>{tournament.add_on || 'None'}</Text>
        </View>
      </View>
    </View>
  );

  const renderBlindStructure = () => {
    const blindLevels = tournament.blind_structure.split(',').map(level => level.trim());
    
    return (
      <View style={styles.blindsContainer}>
        <View style={styles.blindsHeader}>
          <Text style={[styles.blindsHeaderText, { flex: 1 }]}>LEVEL</Text>
          <Text style={[styles.blindsHeaderText, { flex: 1 }]}>SB</Text>
          <Text style={[styles.blindsHeaderText, { flex: 1 }]}>BB</Text>
          <Text style={[styles.blindsHeaderText, { flex: 1 }]}>Ante</Text>
        </View>
        {blindLevels.map((level, index) => {
          const parts = level.split('/');
          const sb = parts[0] || '-';
          const bb = parts[1] || '-';
          const ante = parts[2] || '-';
          
          return (
            <React.Fragment key={index}>
              <View style={[styles.blindsRow, index % 2 === 0 && styles.blindsRowAlt]}>
                <Text style={[styles.blindsCell, { flex: 1 }]}>Lv.{index + 1}</Text>
                <Text style={[styles.blindsCell, { flex: 1 }]}>{sb}</Text>
                <Text style={[styles.blindsCell, { flex: 1 }]}>{bb}</Text>
                <Text style={[styles.blindsCell, { flex: 1 }]}>{ante}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{tournament.name}</Text>
      </View>

      <View style={styles.registerSection}>
        <View style={styles.registerInfo}>
          <Text style={styles.registerLabel}>Start</Text>
          <Text style={styles.registerValue}>{formatDate(tournament.date_time)}</Text>
          
          <Text style={[styles.registerLabel, { marginTop: 8 }]}>Late Reg.</Text>
          <Text style={styles.registerValue}>{tournament.late_registration || 'End of Level 3'}</Text>
          
          <Text style={[styles.registerLabel, { marginTop: 8 }]}>Buy-In</Text>
          <Text style={styles.registerValue}>{tournament.buy_in}</Text>
        </View>

        {user?.status === 'approved' && (
          <TouchableOpacity
            style={[
              styles.registerButton,
              isRSVPd && styles.registeredButton,
              isFull && !isRSVPd && styles.disabledButton,
            ]}
            onPress={handleRSVP}
            disabled={isFull && !isRSVPd}
          >
            <Text style={styles.registerButtonText}>
              {isFull && !isRSVPd ? 'Full' : isRSVPd ? 'Registered' : 'Register'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'main' && styles.activeTab]}
          onPress={() => setActiveTab('main')}
        >
          <Text style={[styles.tabText, activeTab === 'main' && styles.activeTabText]}>
            Main
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'blinds' && styles.activeTab]}
          onPress={() => setActiveTab('blinds')}
        >
          <Text style={[styles.tabText, activeTab === 'blinds' && styles.activeTabText]}>
            Blinds
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'main' ? renderInfoGrid() : renderBlindStructure()}

        {activeTab === 'main' && (
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>
              Players RSVP&apos;d ({rsvpUsers.length})
            </Text>
            {rsvpUsers.length === 0 ? (
              <Text style={styles.emptyText}>No players have RSVP&apos;d yet</Text>
            ) : (
              rsvpUsers.map((rsvpUser, index) => (
                <React.Fragment key={index}>
                  <View style={styles.playerRow}>
                    <Text style={styles.playerIcon}>👤</Text>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{rsvpUser.full_name}</Text>
                      <Text style={styles.playerNickname}>@{rsvpUser.nickname}</Text>
                    </View>
                  </View>
                </React.Fragment>
              ))
            )}
          </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  registerSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  registerInfo: {
    flex: 1,
  },
  registerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  registerValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  infoGrid: {
    backgroundColor: colors.background,
  },
  infoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoCell: {
    flex: 1,
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  blindsContainer: {
    backgroundColor: colors.background,
  },
  blindsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blindsHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  blindsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blindsRowAlt: {
    backgroundColor: colors.cardBackground || '#F5F5F5',
  },
  blindsCell: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  playersSection: {
    padding: 16,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  playerNickname: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
