
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Tournament, RSVP, User } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';

export default function TournamentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [rsvpUsers, setRsvpUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const tournaments = await StorageService.getTournaments();
    const foundTournament = tournaments.find(t => t.id === id);
    setTournament(foundTournament || null);

    const allRsvps = await StorageService.getRSVPs();
    const tournamentRsvps = allRsvps.filter(r => r.tournament_id === id);
    setRsvps(tournamentRsvps);

    const users = await StorageService.getUsers();
    const rsvpUserIds = tournamentRsvps.map(r => r.user_id);
    const rsvpUsersList = users.filter(u => rsvpUserIds.includes(u.id));
    setRsvpUsers(rsvpUsersList);
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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={commonStyles.text}>Tournament not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{tournament.name}</Text>
      </View>

      <View style={commonStyles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{formatDate(tournament.date_time)}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{tournament.location}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💰</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Buy-in</Text>
            <Text style={styles.detailValue}>{tournament.buy_in}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>👥</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Players</Text>
            <Text style={styles.detailValue}>
              {rsvps.length} / {tournament.max_players}
            </Text>
          </View>
        </View>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Blind Structure</Text>
        <Text style={styles.blindStructure}>{tournament.blind_structure}</Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.sectionTitle}>Players RSVP&apos;d ({rsvpUsers.length})</Text>
        {rsvpUsers.length === 0 ? (
          <Text style={styles.emptyText}>No players have RSVP&apos;d yet</Text>
        ) : (
          rsvpUsers.map((rsvpUser, index) => (
            <React.Fragment key={index}>
              <View key={rsvpUser.id} style={styles.playerRow}>
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

      {user?.status === 'approved' && (
        <TouchableOpacity
          style={[
            buttonStyles.primary,
            styles.actionButton,
            isRSVPd && styles.cancelButton,
            isFull && !isRSVPd && styles.disabledButton,
          ]}
          onPress={handleRSVP}
          disabled={isFull && !isRSVPd}
        >
          <Text style={buttonStyles.text}>
            {isFull && !isRSVPd ? 'Tournament Full' : isRSVPd ? 'Cancel RSVP' : 'RSVP to Tournament'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[buttonStyles.outline, styles.actionButton]}
        onPress={() => router.back()}
      >
        <Text style={buttonStyles.outlineText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  blindStructure: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  },
  actionButton: {
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
});
