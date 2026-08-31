export interface ClientRow {
  id: number;
  name: string;
  lastname: string;
  email: string | null;
  dni: string;
  phone: string | null;
  birth_date: string | null;
  health_specs: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminRow {
  id: number;
  name: string;
  lastname: string;
  email: string;
  dni: string;
  phone: string | null;
  role: 'admin' | 'superadmin';
  created_at: string;
  updated_at: string;
}

export interface MembershipRow {
  id: number;
  name: string;
  duration_days: number;
  price: string;
  is_active: boolean;
  created_at: string;
}

export interface ClientMembershipRow {
  id: number;
  client_id: number;
  membership_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ClientMembershipView extends ClientMembershipRow {
  client_name: string;
  membership_name: string;
}

export interface ExerciseRow {
  id: number;
  name: string;
  description: string | null;
  muscle_group: string;
  equipment: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineRow {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineExerciseRow {
  id: number;
  routine_id: number;
  exercise_id: number;
  day_of_week: number;
  sets: number;
  reps: number;
  rest_time: number | null;
  order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineExerciseView extends RoutineExerciseRow {
  exercise_name: string;
  muscle_group: string;
  equipment: string | null;
}

export interface RoutineWithExercises extends RoutineRow {
  exercises: RoutineExerciseView[];
}

export interface JwtUser {
  sub: number;
  email: string;
  type: 'admin' | 'client';
  role: 'admin' | 'superadmin' | 'client';
}

export interface AuthUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password_hash: string;
  type: 'admin' | 'client';
  role: 'admin' | 'superadmin' | 'client';
}
