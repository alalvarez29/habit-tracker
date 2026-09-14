import { Check, Flame, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Habit } from '../../types/habit';
import { HABIT_COLOR_STYLES } from './colors';
import { HeatMap } from './HeatMap';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onToggleToday: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  isToggling: boolean;
}

export function HabitCard({ habit, today, onToggleToday, onDelete, isToggling }: HabitCardProps) {
  const style = HABIT_COLOR_STYLES[habit.color];

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
            <h2 className="font-display truncate text-base font-semibold text-slate-900">{habit.name}</h2>
          </div>
          {habit.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{habit.description}</p>
          )}
        </div>

        <div className="flex gap-3 text-sm">
          <Link
            to={`/habits/${habit.id}/edit`}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          <button
            onClick={() => onDelete(habit)}
            className="flex items-center gap-1 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Borrar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${style.bg} ${style.text}`}>
          <Flame className="h-3.5 w-3.5" />
          {habit.currentStreak} {habit.currentStreak === 1 ? 'día' : 'días'}
        </span>
        <span className="text-slate-500">Racha más larga: {habit.longestStreak}</span>
      </div>

      <div className="overflow-x-auto">
        <HeatMap checkInDates={habit.recentCheckIns} color={habit.color} today={today} weeks={12} />
      </div>

      <button
        onClick={() => onToggleToday(habit)}
        disabled={isToggling}
        className={`mt-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${
          habit.completedToday
            ? `${style.bg} ${style.text} ring-1 ${style.ring}`
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {habit.completedToday && <Check className="h-4 w-4" />}
        {habit.completedToday ? 'Completado hoy' : 'Marcar hoy como hecho'}
      </button>
    </article>
  );
}
