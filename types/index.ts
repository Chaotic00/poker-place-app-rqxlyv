
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
