import type { HabitColor } from '../../types/habit';

export const HABIT_COLOR_STYLES: Record<HabitColor, { dot: string; bg: string; text: string; ring: string }> = {
  emerald: { dot: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500' },
  sky: { dot: 'bg-sky-500', bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-500' },
  amber: { dot: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-500' },
  rose: { dot: 'bg-rose-500', bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-500' },
  violet: { dot: 'bg-violet-500', bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-500' },
  slate: { dot: 'bg-slate-500', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500' },
};
