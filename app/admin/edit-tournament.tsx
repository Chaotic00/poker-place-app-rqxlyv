
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Tournament } from '@/types';
import { StorageService } from '@/utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditTournamentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [name, setName] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [blindStructure, setBlindStructure] = useState('');
  const [levelTimes, setLevelTimes] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTournament();
  }, [id]);

  const loadTournament = async () => {
    const tournaments = await StorageService.getTournaments();
    const found = tournaments.find(t => t.id === id);
    if (found) {
      setTournament(found);
      setName(found.name);
      setDateTime(new Date(found.date_time));
      setLocation(found.location);
      setBuyIn(found.buy_in);
      setBlindStructure(found.blind_structure);
      setLevelTimes(found.level_times || '');
      setMaxPlayers(found.max_players.toString());
    }
  };

  const processLevelTimes = (levelTimesInput: string, blindStructureInput: string): string => {
    if (!levelTimesInput.trim()) {
      return '';
    }

    const timesArray = levelTimesInput.split(',').map(time => time.trim()).filter(time => time);
    const blindLevels = blindStructureInput.split(',').map(level => level.trim()).filter(level => level);
    
    // If only one time is entered, apply it to all levels
    if (timesArray.length === 1 && blindLevels.length > 1) {
      const singleTime = timesArray[0];
      return Array(blindLevels.length).fill(singleTime).join(', ');
    }
    
    return levelTimesInput;
  };

  const handleSave = async () => {
    setError('');

    if (!name || !location || !buyIn || !blindStructure || !maxPlayers) {
      setError('Please fill in all fields');
      return;
    }

    const maxPlayersNum = parseInt(maxPlayers);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 2) {
      setError('Max players must be at least 2');
      return;
    }

    if (!tournament) return;

    const processedLevelTimes = processLevelTimes(levelTimes, blindStructure);

    const updatedTournament: Tournament = {
      ...tournament,
      name,
      date_time: dateTime.toISOString(),
      location,
      buy_in: buyIn,
      blind_structure: blindStructure,
      level_times: processedLevelTimes,
      max_players: maxPlayersNum,
    };

    const tournaments = await StorageService.getTournaments();
    const updated = tournaments.map(t => t.id === id ? updatedTournament : t);
    await StorageService.saveTournaments(updated);

    Alert.alert('Success', 'Tournament updated successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Tournament Name *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., Friday Night Poker"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Date & Time *</Text>
            <TouchableOpacity
              style={[commonStyles.input, styles.dateButton]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {dateTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateTime}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateTime(selectedDate);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Location *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., Downtown Poker Club"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Buy-in *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., $50"
              placeholderTextColor={colors.textSecondary}
              value={buyIn}
              onChangeText={setBuyIn}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Blind Structure *</Text>
            <Text style={styles.helperText}>
              Format: SB/BB/Ante (e.g., 25/50/50, 50/100/100)
            </Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="e.g., 25/50/50, 50/100/100, 100/200/200"
              placeholderTextColor={colors.textSecondary}
              value={blindStructure}
              onChangeText={setBlindStructure}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Level Times</Text>
            <Text style={styles.helperText}>
              Enter time for each level in minutes, separated by commas (e.g., 30, 30, 45).{'\n'}
              Tip: Enter a single time (e.g., 30) to apply it to all levels.
            </Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="e.g., 30, 30, 45, 45, 60 or just 30"
              placeholderTextColor={colors.textSecondary}
              value={levelTimes}
              onChangeText={setLevelTimes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={commonStyles.inputLabel}>Max Players *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., 10"
              placeholderTextColor={colors.textSecondary}
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType="number-pad"
            />
          </View>

          {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[buttonStyles.primary, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={buttonStyles.text}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={buttonStyles.outlineText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 8,
  },
  dateButton: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
  },
});
