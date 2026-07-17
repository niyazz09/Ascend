import { useState } from 'react';
import { Menu, X, Bell, Search, GraduationCap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/focused-session', label: 'Focused Session' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const name = user?.name || user?.email.split('@')[0] || 'Learner';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-base-600">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-600 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Ascend</span>
          </div>

          <div className="hidden sm:flex items-center bg-slate-50 border border-base-600 rounded-lg px-2.5 py-1.5 w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none w-full ml-2"
            />
            <kbd className="text-[10px] font-medium text-slate-400 bg-white border border-base-600 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/notifications"
            className="relative text-slate-600 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-500 rounded-full" />
          </NavLink>
          <NavLink
            to="/profile"
            className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-semibold text-xs"
            aria-label="Profile"
          >
            {initials}
          </NavLink>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-base-600 px-3 py-2 space-y-0.5 bg-white">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-50 text-accent-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
