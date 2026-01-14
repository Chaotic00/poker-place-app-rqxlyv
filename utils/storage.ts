
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Tournament, RSVP, CashGame, CashGameRSVP } from '@/types';

const USERS_KEY = '@poker_place_users';
const TOURNAMENTS_KEY = '@poker_place_tournaments';
const RSVPS_KEY = '@poker_place_rsvps';
const CURRENT_USER_KEY = '@poker_place_current_user';
const CASH_GAMES_KEY = '@poker_place_cash_games';
const CASH_GAME_RSVPS_KEY = '@poker_place_cash_game_rsvps';

export const StorageService = {
  async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting users:', error);
      return [];
    }
  },

  async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      console.log('Users saved:', users.length);
    } catch (error) {
      console.log('Error saving users:', error);
    }
  },

  async getTournaments(): Promise<Tournament[]> {
    try {
      const data = await AsyncStorage.getItem(TOURNAMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting tournaments:', error);
      return [];
    }
  },

  async saveTournaments(tournaments: Tournament[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    } catch (error) {
      console.log('Error saving tournaments:', error);
    }
  },

  async getRSVPs(): Promise<RSVP[]> {
    try {
      const data = await AsyncStorage.getItem(RSVPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting RSVPs:', error);
      return [];
    }
  },

  async saveRSVPs(rsvps: RSVP[]): Promise<void> {
    try {
      await AsyncStorage.setItem(RSVPS_KEY, JSON.stringify(rsvps));
    } catch (error) {
      console.log('Error saving RSVPs:', error);
    }
  },

  async getCashGames(): Promise<CashGame[]> {
    try {
      const data = await AsyncStorage.getItem(CASH_GAMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting cash games:', error);
      return [];
    }
  },

  async saveCashGames(cashGames: CashGame[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CASH_GAMES_KEY, JSON.stringify(cashGames));
      console.log('Cash games saved:', cashGames.length);
    } catch (error) {
      console.log('Error saving cash games:', error);
    }
  },

  async getCashGameRSVPs(): Promise<CashGameRSVP[]> {
    try {
      const data = await AsyncStorage.getItem(CASH_GAME_RSVPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting cash game RSVPs:', error);
      return [];
    }
  },

  async saveCashGameRSVPs(rsvps: CashGameRSVP[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CASH_GAME_RSVPS_KEY, JSON.stringify(rsvps));
      console.log('Cash game RSVPs saved:', rsvps.length);
    } catch (error) {
      console.log('Error saving cash game RSVPs:', error);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('Error getting current user:', error);
      return null;
    }
  },

  async setCurrentUser(user: User | null): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        console.log('Current user set:', user.email);
      } else {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
        console.log('Current user cleared');
      }
    } catch (error) {
      console.log('Error setting current user:', error);
    }
  },

  async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      console.log('Current user cleared');
    } catch (error) {
      console.log('Error clearing current user:', error);
    }
  },

  async initializeDefaultData(): Promise<void> {
    const users = await this.getUsers();
    if (users.length === 0) {
      const defaultUsers: User[] = [
        {
          id: '1',
          full_name: 'Admin User',
          email: 'admin@pokerplace.com',
          phone: '555-0100',
          nickname: 'Admin',
          password: 'admin123',
          status: 'admin',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '555-0101',
          nickname: 'JohnnyPoker',
          password: 'password123',
          status: 'approved',
          created_at: new Date().toISOString(),
        },
      ];
      await this.saveUsers(defaultUsers);
      console.log('Default users created');
    }

    const tournaments = await this.getTournaments();
    if (tournaments.length === 0) {
      const defaultTournaments: Tournament[] = [
        {
          id: '1',
          name: 'Friday Night Poker',
          date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Downtown Poker Club',
          buy_in: '$50',
          blind_structure: '25/50, 50/100, 100/200, 200/400, 400/800',
          max_players: 10,
          created_by: '1',
          created_at: new Date().toISOString(),
          game_type: 'Hold\'em',
          late_registration: 'End of Level 3',
          starting_chips: '10,000',
          add_on: 'None',
        },
        {
          id: '2',
          name: 'Weekend Championship',
          date_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Main Street Casino',
          buy_in: '$100',
          blind_structure: '50/100, 100/200, 200/400, 400/800, 800/1600',
          max_players: 20,
          created_by: '1',
          created_at: new Date().toISOString(),
          game_type: 'Hold\'em',
          late_registration: 'End of Level 5',
          starting_chips: '20,000',
          add_on: '$50 for 10,000 chips',
        },
      ];
      await this.saveTournaments(defaultTournaments);
      console.log('Default tournaments created');
    }

    const cashGames = await this.getCashGames();
    if (cashGames.length === 0) {
      const defaultCashGames: CashGame[] = [
        {
          id: 'holdem',
          game_type: 'holdem',
          stakes: '$1/$2',
          tables_running: 2,
          seats_open: 5,
          total_seats: 18,
          updated_at: new Date().toISOString(),
        },
        {
          id: 'plo',
          game_type: 'plo',
          stakes: '$2/$5',
          tables_running: 1,
          seats_open: 3,
          total_seats: 9,
          updated_at: new Date().toISOString(),
        },
      ];
      await this.saveCashGames(defaultCashGames);
      console.log('Default cash games created');
    }
  },
};
