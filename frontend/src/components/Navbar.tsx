import { Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Flame className="h-5 w-5 text-brand-500" strokeWidth={2.25} />
          Habit Tracker
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden sm:inline">{user.name ?? user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 transition hover:border-slate-400 hover:text-slate-900"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
