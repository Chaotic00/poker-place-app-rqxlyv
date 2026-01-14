
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { CashGame } from '@/types';
import { StorageService } from '@/utils/storage';

export default function CashGameManagementScreen() {
  const router = useRouter();
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stakes, setStakes] = useState('');
  const [tablesRunning, setTablesRunning] = useState('');
  const [seatsOpen, setSeatsOpen] = useState('');
  const [totalSeats, setTotalSeats] = useState('');

  useEffect(() => {
    loadCashGames();
  }, []);

  const loadCashGames = async () => {
    console.log('Loading cash games for admin management');
    const data = await StorageService.getCashGames();
    setCashGames(data);
  };

  const handleEdit = (cashGame: CashGame) => {
    console.log('Editing cash game:', cashGame.game_type);
    setEditingId(cashGame.id);
    setStakes(cashGame.stakes);
    setTablesRunning(cashGame.tables_running.toString());
    setSeatsOpen(cashGame.seats_open.toString());
    setTotalSeats(cashGame.total_seats.toString());
  };

  const handleSave = async () => {
    if (!editingId) return;

    const tablesNum = parseInt(tablesRunning);
    const seatsOpenNum = parseInt(seatsOpen);
    const totalSeatsNum = parseInt(totalSeats);

    if (isNaN(tablesNum) || tablesNum < 0) {
      Alert.alert('Error', 'Tables running must be a valid number');
      return;
    }

    if (isNaN(seatsOpenNum) || seatsOpenNum < 0) {
      Alert.alert('Error', 'Seats open must be a valid number');
      return;
    }

    if (isNaN(totalSeatsNum) || totalSeatsNum < 1) {
      Alert.alert('Error', 'Total seats must be at least 1');
      return;
    }

    if (seatsOpenNum > totalSeatsNum) {
      Alert.alert('Error', 'Seats open cannot exceed total seats');
      return;
    }

    console.log('Saving cash game updates:', editingId);

    const updatedCashGames = cashGames.map(cg => {
      if (cg.id === editingId) {
        return {
          ...cg,
          stakes,
          tables_running: tablesNum,
          seats_open: seatsOpenNum,
          total_seats: totalSeatsNum,
          updated_at: new Date().toISOString(),
        };
      }
      return cg;
    });

    await StorageService.saveCashGames(updatedCashGames);
    setCashGames(updatedCashGames);
    setEditingId(null);
    setStakes('');
    setTablesRunning('');
    setSeatsOpen('');
    setTotalSeats('');

    Alert.alert('Success', 'Cash game updated successfully');
  };

  const handleCancel = () => {
    console.log('Cancelled editing cash game');
    setEditingId(null);
    setStakes('');
    setTablesRunning('');
    setSeatsOpen('');
    setTotalSeats('');
  };

  const getGameTypeName = (gameType: string) => {
    return gameType === 'holdem' ? 'Hold\'em' : 'PLO';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💵</Text>
        <Text style={styles.headerTitle}>Cash Game Management</Text>
        <Text style={styles.headerSubtitle}>Manage stakes, tables, and seats</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {cashGames.map((cashGame, index) => (
          <React.Fragment key={index}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.gameTitle}>{getGameTypeName(cashGame.game_type)}</Text>
                {editingId !== cashGame.id && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(cashGame)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {editingId === cashGame.id ? (
                <View style={styles.editForm}>
                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.inputLabel}>Stakes *</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="e.g., $1/$2"
                      placeholderTextColor={colors.textSecondary}
                      value={stakes}
                      onChangeText={setStakes}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.inputLabel}>Tables Running *</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="e.g., 2"
                      placeholderTextColor={colors.textSecondary}
                      value={tablesRunning}
                      onChangeText={setTablesRunning}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.inputLabel}>Seats Open *</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="e.g., 5"
                      placeholderTextColor={colors.textSecondary}
                      value={seatsOpen}
                      onChangeText={setSeatsOpen}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={commonStyles.inputLabel}>Total Seats *</Text>
                    <TextInput
                      style={commonStyles.input}
                      placeholder="e.g., 18"
                      placeholderTextColor={colors.textSecondary}
                      value={totalSeats}
                      onChangeText={setTotalSeats}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[buttonStyles.primary, styles.saveButtonSmall]}
                      onPress={handleSave}
                    >
                      <Text style={buttonStyles.text}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[buttonStyles.outline, styles.cancelButtonSmall]}
                      onPress={handleCancel}
                    >
                      <Text style={buttonStyles.outlineText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.gameInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Stakes:</Text>
                    <Text style={styles.infoValue}>{cashGame.stakes}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tables Running:</Text>
                    <Text style={styles.infoValue}>{cashGame.tables_running}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Seats Open:</Text>
                    <Text style={styles.infoValue}>{cashGame.seats_open}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Seats:</Text>
                    <Text style={styles.infoValue}>{cashGame.total_seats}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Last Updated:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(cashGame.updated_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </React.Fragment>
        ))}

        <TouchableOpacity
          style={[buttonStyles.outline, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.outlineText}>Back to Admin</Text>
        </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  gameInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  editForm: {
    gap: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButtonSmall: {
    flex: 1,
  },
  cancelButtonSmall: {
    flex: 1,
  },
  backButton: {
    marginTop: 16,
  },
});
