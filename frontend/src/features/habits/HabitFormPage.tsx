import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ApiError } from '../../lib/apiClient';
import { localToday } from '../../lib/date';
import { HABIT_COLORS } from '../../types/habit';
import { createHabit, fetchHabit, updateHabit } from './api';
import { HABIT_COLOR_STYLES } from './colors';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80),
  description: z.string().max(300).optional(),
  color: z.enum(HABIT_COLORS),
});

type FormValues = z.infer<typeof schema>;

export function HabitFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const habitQuery = useQuery({
    queryKey: ['habit', id],
    queryFn: () => fetchHabit(id as string, localToday()),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { color: 'emerald' },
  });

  useEffect(() => {
    if (habitQuery.data) {
      reset({
        name: habitQuery.data.name,
        description: habitQuery.data.description ?? '',
        color: habitQuery.data.color,
      });
    }
  }, [habitQuery.data, reset]);

  const selectedColor = watch('color');

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        color: values.color,
      };
      return isEditing ? updateHabit(id as string, payload) : createHabit(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      navigate('/');
    },
    onError: (error) => {
      setServerError(error instanceof ApiError ? error.message : 'No se pudo guardar el hábito');
    },
  });

  if (isEditing && habitQuery.isLoading) {
    return <p className="mx-auto max-w-lg px-4 py-8 text-slate-500">Cargando hábito…</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-semibold text-slate-900">
        {isEditing ? 'Editar hábito' : 'Nuevo hábito'}
      </h1>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm text-slate-600">Nombre</label>
          <input
            placeholder="Leer 20 minutos"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">Descripción (opcional)</label>
          <input
            placeholder="Antes de dormir, sin pantallas"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
            {...register('description')}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-600">Color</label>
          <div className="flex gap-2">
            {HABIT_COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input type="radio" value={color} className="peer sr-only" {...register('color')} />
                <span
                  className={`block h-8 w-8 rounded-full ${HABIT_COLOR_STYLES[color].dot} ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-white ' + HABIT_COLOR_STYLES[color].ring : ''
                  }`}
                />
              </label>
            ))}
          </div>
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </main>
  );
}
