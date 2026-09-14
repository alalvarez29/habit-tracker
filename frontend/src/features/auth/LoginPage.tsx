import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/apiClient';
import { NetworkBackground } from '../../components/NetworkBackground';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values);
      navigate('/');
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión');
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <NetworkBackground />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
        <h1 className="font-display mb-1 text-2xl font-semibold text-slate-900">Inicia sesión</h1>
        <p className="mb-6 text-sm text-slate-500">Accede a tus hábitos y rachas.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-brand-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
