export const HABIT_COLORS = ['emerald', 'sky', 'amber', 'rose', 'violet', 'slate'] as const;
export type HabitColor = (typeof HABIT_COLORS)[number];

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  color: HabitColor;
  createdAt: string;
  updatedAt: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  recentCheckIns: string[];
}

export interface HabitDetail extends Habit {
  checkIns: string[];
}

export interface HabitInput {
  name: string;
  description?: string;
  color: HabitColor;
}
