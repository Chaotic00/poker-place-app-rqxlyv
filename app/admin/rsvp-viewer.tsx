
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Tournament, RSVP, User } from '@/types';
import { StorageService } from '@/utils/storage';
import { Picker } from '@react-native-picker/picker';

export default function RSVPViewerScreen() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rsvpUsers, setRsvpUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      loadRSVPs();
    }
  }, [selectedTournamentId]);

  const loadData = async () => {
    const tournamentsData = await StorageService.getTournaments();
    const sorted = tournamentsData.sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
    setTournaments(sorted);
    if (sorted.length > 0) {
      setSelectedTournamentId(sorted[0].id);
    }

    const usersData = await StorageService.getUsers();
    setUsers(usersData);
  };

  const loadRSVPs = async () => {
    const allRsvps = await StorageService.getRSVPs();
    const tournamentRsvps = allRsvps.filter(r => r.tournament_id === selectedTournamentId);
    setRsvps(tournamentRsvps);

    const rsvpUserIds = tournamentRsvps.map(r => r.user_id);
    const rsvpUsersList = users.filter(u => rsvpUserIds.includes(u.id));
    setRsvpUsers(rsvpUsersList);
  };

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Tournament:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedTournamentId}
            onValueChange={(value) => setSelectedTournamentId(value)}
            style={styles.picker}
          >
            {tournaments.map((tournament, index) => (
              <Picker.Item
                key={index}
                label={tournament.name}
                value={tournament.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {selectedTournament && (
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentName}>{selectedTournament.name}</Text>
          <Text style={styles.tournamentDetail}>
            {new Date(selectedTournament.date_time).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.tournamentDetail}>
            RSVPs: {rsvpUsers.length} / {selectedTournament.max_players}
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {rsvpUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No RSVPs for this tournament</Text>
          </View>
        ) : (
          rsvpUsers.map((user, index) => (
            <React.Fragment key={index}>
              <View key={user.id} style={commonStyles.card}>
                <View style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                    <Text style={styles.userNickname}>@{user.nickname}</Text>
                  </View>
                  <View style={styles.userContact}>
                    <Text style={styles.contactText}>📧 {user.email}</Text>
                    <Text style={styles.contactText}>📱 {user.phone}</Text>
                  </View>
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
  pickerContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  tournamentInfo: {
    padding: 16,
    backgroundColor: colors.highlight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tournamentDetail: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
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
  userRow: {
    flexDirection: 'column',
    gap: 12,
  },
  userInfo: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userNickname: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userContact: {
    gap: 4,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
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
