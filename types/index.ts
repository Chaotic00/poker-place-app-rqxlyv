
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nickname: string;
  password: string;
  status: UserStatus;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  date_time: string;
  location: string;
  buy_in: string;
  blind_structure: string;
  level_times?: string;
  max_players: number;
  created_by: string;
  created_at: string;
  game_type?: string;
  late_registration?: string;
  starting_chips?: string;
  add_on?: string;
}

export interface RSVP {
  id: string;
  user_id: string;
  tournament_id: string;
  timestamp: string;
}

export type CashGameType = 'holdem' | 'plo';

export interface CashGame {
  id: string;
  game_type: CashGameType;
  stakes: string;
  tables_running: number;
  seats_open: number;
  total_seats: number;
  updated_at: string;
}

export interface CashGameRSVP {
  id: string;
  user_id: string;
  cash_game_id: string;
  timestamp: string;
}
