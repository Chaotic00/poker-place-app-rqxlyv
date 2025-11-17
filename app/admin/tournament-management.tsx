
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Tournament } from '@/types';
import { StorageService } from '@/utils/storage';

export default function TournamentManagementScreen() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const data = await StorageService.getTournaments();
    const sorted = data.sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
    setTournaments(sorted);
  };

  const handleDelete = (tournamentId: string) => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = tournaments.filter(t => t.id !== tournamentId);
            await StorageService.saveTournaments(updated);
            setTournaments(updated);

            const rsvps = await StorageService.getRSVPs();
            const updatedRsvps = rsvps.filter(r => r.tournament_id !== tournamentId);
            await StorageService.saveRSVPs(updatedRsvps);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[buttonStyles.primary, styles.createButton]}
          onPress={() => router.push('/admin/create-tournament')}
        >
          <Text style={buttonStyles.text}>+ Create Tournament</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {tournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No tournaments created yet</Text>
          </View>
        ) : (
          tournaments.map((tournament, index) => (
            <React.Fragment key={index}>
              <View key={tournament.id} style={commonStyles.card}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                
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
                    <Text style={styles.infoText}>{tournament.buy_in}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>👥</Text>
                    <Text style={styles.infoText}>Max {tournament.max_players} players</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.actionButton]}
                    onPress={() => router.push({
                      pathname: '/admin/edit-tournament',
                      params: { id: tournament.id }
                    })}
                  >
                    <Text style={buttonStyles.text}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[buttonStyles.outline, styles.actionButton, { borderColor: colors.error }]}
                    onPress={() => handleDelete(tournament.id)}
                  >
                    <Text style={[buttonStyles.outlineText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  createButton: {
    width: '100%',
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
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
