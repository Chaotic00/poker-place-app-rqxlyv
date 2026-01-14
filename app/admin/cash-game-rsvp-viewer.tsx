
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { CashGame, CashGameRSVP, User } from '@/types';
import { StorageService } from '@/utils/storage';
import { Picker } from '@react-native-picker/picker';

export default function CashGameRSVPViewerScreen() {
  const router = useRouter();
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [selectedCashGameId, setSelectedCashGameId] = useState<string>('');
  const [rsvps, setRsvps] = useState<CashGameRSVP[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rsvpUsers, setRsvpUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCashGameId) {
      loadRSVPs();
    }
  }, [selectedCashGameId]);

  const loadData = async () => {
    console.log('Loading cash games and users for RSVP management');
    const cashGamesData = await StorageService.getCashGames();
    setCashGames(cashGamesData);
    if (cashGamesData.length > 0) {
      setSelectedCashGameId(cashGamesData[0].id);
    }

    const usersData = await StorageService.getUsers();
    setUsers(usersData);
  };

  const loadRSVPs = async () => {
    console.log('Loading RSVPs for cash game:', selectedCashGameId);
    const allRsvps = await StorageService.getCashGameRSVPs();
    const cashGameRsvps = allRsvps.filter(r => r.cash_game_id === selectedCashGameId);
    setRsvps(cashGameRsvps);

    const rsvpUserIds = cashGameRsvps.map(r => r.user_id);
    const rsvpUsersList = users.filter(u => rsvpUserIds.includes(u.id));
    setRsvpUsers(rsvpUsersList);
  };

  const handleUnRSVP = async (userId: string, userName: string) => {
    console.log('Admin un-RSVPing user:', userName, 'from cash game:', selectedCashGameId);
    
    Alert.alert(
      'Confirm Un-RSVP',
      `Are you sure you want to remove ${userName} from this cash game?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const allRsvps = await StorageService.getCashGameRSVPs();
            const updatedRsvps = allRsvps.filter(
              r => !(r.user_id === userId && r.cash_game_id === selectedCashGameId)
            );
            await StorageService.saveCashGameRSVPs(updatedRsvps);
            
            // Update seats open count
            const cashGamesData = await StorageService.getCashGames();
            const updatedCashGames = cashGamesData.map(cg => {
              if (cg.id === selectedCashGameId) {
                return {
                  ...cg,
                  seats_open: Math.min(cg.seats_open + 1, cg.total_seats),
                  updated_at: new Date().toISOString(),
                };
              }
              return cg;
            });
            await StorageService.saveCashGames(updatedCashGames);
            
            console.log('User un-RSVPd successfully, seats open updated');
            Alert.alert('Success', `${userName} has been removed from the cash game`);
            loadRSVPs();
          },
        },
      ]
    );
  };

  const selectedCashGame = cashGames.find(cg => cg.id === selectedCashGameId);

  const getGameTypeName = (gameType: string) => {
    return gameType === 'holdem' ? 'Hold\'em' : 'PLO';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💵</Text>
        <Text style={styles.headerTitle}>Cash Game RSVP Management</Text>
        <Text style={styles.headerSubtitle}>View and manage player RSVPs</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Cash Game:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCashGameId}
            onValueChange={(value) => setSelectedCashGameId(value)}
            style={styles.picker}
          >
            {cashGames.map((cashGame, index) => (
              <Picker.Item
                key={index}
                label={getGameTypeName(cashGame.game_type)}
                value={cashGame.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {selectedCashGame && (
        <View style={styles.cashGameInfo}>
          <Text style={styles.cashGameName}>{getGameTypeName(selectedCashGame.game_type)}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stakes:</Text>
            <Text style={styles.infoValue}>{selectedCashGame.stakes}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tables Running:</Text>
            <Text style={styles.infoValue}>{selectedCashGame.tables_running}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Seats Open:</Text>
            <Text style={styles.infoValue}>{selectedCashGame.seats_open}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total RSVPs:</Text>
            <Text style={styles.infoValue}>{rsvpUsers.length}</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {rsvpUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No RSVPs for this cash game</Text>
          </View>
        ) : (
          rsvpUsers.map((user, index) => (
            <React.Fragment key={index}>
              <View style={styles.card}>
                <View style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                    <Text style={styles.userNickname}>@{user.nickname}</Text>
                    <View style={styles.userContact}>
                      <Text style={styles.contactText}>📧 {user.email}</Text>
                      <Text style={styles.contactText}>📱 {user.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleUnRSVP(user.id, user.full_name)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
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
          <Text style={buttonStyles.outlineText}>Back to Admin</Text>
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
  cashGameInfo: {
    padding: 16,
    backgroundColor: colors.highlight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cashGameName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
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
    marginBottom: 8,
  },
  userContact: {
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    color: colors.text,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
