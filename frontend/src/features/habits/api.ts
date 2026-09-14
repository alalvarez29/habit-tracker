import { apiRequest } from '../../lib/apiClient';
import type { Habit, HabitDetail, HabitInput } from '../../types/habit';

export function fetchHabits(today: string) {
  return apiRequest<Habit[]>('/habits', { params: { today } });
}

export function fetchHabit(id: string, today: string) {
  return apiRequest<HabitDetail>(`/habits/${id}`, { params: { today } });
}

export function createHabit(input: HabitInput) {
  return apiRequest<Habit>('/habits', { method: 'POST', body: input });
}

export function updateHabit(id: string, input: HabitInput) {
  return apiRequest<Habit>(`/habits/${id}`, { method: 'PATCH', body: input });
}

export function deleteHabit(id: string) {
  return apiRequest<{ success: boolean }>(`/habits/${id}`, { method: 'DELETE' });
}

export function toggleCheckIn(id: string, date: string) {
  return apiRequest<HabitDetail>(`/habits/${id}/checkins/toggle`, {
    method: 'POST',
    body: { date },
  });
}
