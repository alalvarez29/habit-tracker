import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { localToday } from '../../lib/date';
import type { Habit } from '../../types/habit';
import { deleteHabit, fetchHabits, toggleCheckIn } from './api';
import { HabitCard } from './HabitCard';

export function HabitsPage() {
  const today = localToday();
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ['habits', today],
    queryFn: () => fetchHabits(today),
  });

  const toggleMutation = useMutation({
    mutationFn: (habit: Habit) => toggleCheckIn(habit.id, today),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (habit: Habit) => deleteHabit(habit.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  function handleDelete(habit: Habit) {
    if (confirm(`¿Borrar el hábito "${habit.name}"? Se perderá todo su historial.`)) {
      deleteMutation.mutate(habit);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Tus hábitos</h1>
        <Link
          to="/habits/new"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Nuevo hábito
        </Link>
      </div>

      {habitsQuery.isLoading && <p className="text-slate-500">Cargando hábitos…</p>}
      {habitsQuery.isError && <p className="text-red-600">No se pudieron cargar los hábitos.</p>}

      {habitsQuery.data && habitsQuery.data.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-slate-500">
          Todavía no tienes hábitos. Crea el primero.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {habitsQuery.data?.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            today={today}
            onToggleToday={(h) => toggleMutation.mutate(h)}
            onDelete={handleDelete}
            isToggling={toggleMutation.isPending && toggleMutation.variables?.id === habit.id}
          />
        ))}
      </div>
    </main>
  );
}
