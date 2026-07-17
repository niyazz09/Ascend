import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  HelpCircle,
  BarChart3,
  GraduationCap,
  Sparkles,
  BookOpen,
  Rocket,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/focused-session', label: 'Focused Session', icon: Sparkles },
  { to: '/resources', label: 'Resources Hub', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', icon: HelpCircle },
  { to: '/analysis', label: 'Analysis', icon: BarChart3 },
  { to: '/about', label: 'About ASCEND', icon: Rocket },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const name = user?.name || user?.email.split('@')[0] || 'Learner';
  const email = user?.email || 'learner@ascend.app';

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-base-600 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-base-600">
        <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-slate-900 tracking-tight">
          Ascend
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-accent-50 text-accent-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-base-600">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-left"
        >
          <Avatar name={name} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-900 truncate">{name}</p>
            <p className="text-[11px] text-slate-500 truncate">{email}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
