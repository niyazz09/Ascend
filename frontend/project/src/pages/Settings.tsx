import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Shield,
  Trash2,
  Camera,
  Check,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Clock,
  Target,
  Mail,
  HelpCircle,
  FileText,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type Speed = 'relaxed' | 'balanced' | 'intensive';

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card p-6"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-accent-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-accent-600' : 'bg-base-500'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-base-600 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-base-600 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: typeof Sun;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
        active
          ? 'border-accent-500 bg-accent-50'
          : 'border-base-600 bg-white hover:border-base-500'
      }`}
    >
      <Icon
        className={`w-5 h-5 ${active ? 'text-accent-600' : 'text-slate-500'}`}
      />
      <span
        className={`text-[13px] font-medium ${
          active ? 'text-accent-700' : 'text-slate-700'
        }`}
      >
        {label}
      </span>
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-medium text-slate-400 bg-slate-100 border border-base-600 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute top-2 left-2 w-4 h-4 rounded-full bg-accent-600 flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

function SpeedOption({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-left p-3 rounded-lg border transition-colors ${
        active
          ? 'border-accent-500 bg-accent-50'
          : 'border-base-600 bg-white hover:border-base-500'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            active ? 'bg-accent-600' : 'bg-base-500'
          }`}
        />
        <span
          className={`text-sm font-medium ${
            active ? 'text-accent-700' : 'text-slate-700'
          }`}
        >
          {label}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [speed, setSpeed] = useState<Speed>('balanced');
  const [dailyGoal, setDailyGoal] = useState(45);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || user.email.split('@')[0]);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    if (name.trim()) {
      await updateProfile(name.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PageLayout
      title="Settings"
      description="Manage your account, preferences, and security."
      actions={
        <button onClick={handleSave} className="btn-primary">
          <Check className="w-4 h-4" />
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <SectionCard
          icon={User}
          title="Profile"
          description="Update your personal information and avatar."
        >
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-semibold text-xl">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-base-600 shadow-sm flex items-center justify-center text-slate-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
                aria-label="Change avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Profile Picture
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PNG or JPG, up to 2MB
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors"
              >
                Upload new image
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="Your name"
              />
            </div>
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value="password"
                  readOnly
                  className="input w-full"
                />
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Learning Preferences */}
        <SectionCard
          icon={Target}
          title="Learning Preferences"
          description="Tune your pace, goals, and reminders."
          delay={0.05}
        >
          <div className="space-y-5">
            <div>
              <FieldLabel>Preferred Learning Speed</FieldLabel>
              <div className="flex gap-2">
                <SpeedOption
                  label="Relaxed"
                  description="15 min/day"
                  active={speed === 'relaxed'}
                  onClick={() => setSpeed('relaxed')}
                />
                <SpeedOption
                  label="Balanced"
                  description="30 min/day"
                  active={speed === 'balanced'}
                  onClick={() => setSpeed('balanced')}
                />
                <SpeedOption
                  label="Intensive"
                  description="60 min/day"
                  active={speed === 'intensive'}
                  onClick={() => setSpeed('intensive')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel>Daily Goal</FieldLabel>
                <span className="text-[13px] font-semibold text-accent-700">
                  {dailyGoal} min
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={120}
                step={15}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full accent-accent-600"
              />
              <div className="flex justify-between mt-1 text-[11px] text-slate-400">
                <span>15 min</span>
                <span>120 min</span>
              </div>
            </div>

            <div>
              <FieldLabel>Reminder Time</FieldLabel>
              <div className="relative w-full max-w-[160px]">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="input w-full pl-9"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={Bell}
          title="Notifications"
          description="Choose what we send to your inbox."
          delay={0.1}
        >
          <div>
            <ToggleRow
              icon={Mail}
              title="Email Notifications"
              description="General account and product updates"
              checked={emailNotifs}
              onChange={setEmailNotifs}
            />
            <ToggleRow
              icon={HelpCircle}
              title="Quiz Reminders"
              description="Get pinged before a scheduled quiz"
              checked={quizReminders}
              onChange={setQuizReminders}
            />
            <ToggleRow
              icon={FileText}
              title="Weekly Reports"
              description="A summary of your progress every Sunday"
              checked={weeklyReports}
              onChange={setWeeklyReports}
            />
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard
          icon={Palette}
          title="Appearance"
          description="How Ascend looks on your device."
          delay={0.15}
        >
          <div className="grid grid-cols-3 gap-3">
            <ThemeOption
              icon={Sun}
              label="Light"
              active={theme === 'light'}
              onClick={() => setTheme('light')}
            />
            <ThemeOption
              icon={Moon}
              label="Dark"
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
            />
            <ThemeOption
              icon={Monitor}
              label="System"
              active={theme === 'system'}
              onClick={() => setTheme('system')}
            />
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard
          icon={Shield}
          title="Security"
          description="Keep your account safe and sign out."
          delay={0.2}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-base-600 bg-slate-50">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-base-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Change Password
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Last changed 3 months ago
                  </p>
                </div>
              </div>
              <button type="button" className="btn-secondary">
                Update
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-base-600 bg-slate-50">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-base-600 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Sign Out
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    End your session on this device
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
                className="text-sm font-medium text-danger-600 hover:text-danger-500 transition-colors px-3 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard
          icon={AlertTriangle}
          title="Danger Zone"
          description="Irreversible actions. Proceed with caution."
          delay={0.25}
        >
          <div className="p-4 rounded-lg border border-rose-200 bg-rose-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-danger-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Delete Account
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Permanently remove your account, progress, and all associated
                  data. This action cannot be undone.
                </p>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-danger-600 hover:text-danger-500 border border-rose-300 hover:border-rose-400 bg-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account
                  </button>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 bg-danger-600 hover:bg-danger-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
