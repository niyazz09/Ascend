import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Award,
  Flame,
  Zap,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

function StatTile({
  icon: Icon,
  label,
  value,
  accent = 'text-accent-600',
  bg = 'bg-accent-50',
}: {
  icon: any;
  label: string;
  value: string;
  accent?: string;
  bg?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${accent}`} />
        </div>
        <div>
          <p className="text-[13px] text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-900 tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile details');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile stats:', err);
        setError(err.message || 'Error communicating with server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const name = user?.name || user?.email.split('@')[0] || 'Learner';
  const email = user?.email || 'learner@ascend.app';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <PageLayout title="Profile" description="Your account and learning identity.">
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6 border-rose-200 bg-rose-50/20">
            <h2 className="text-lg font-semibold text-danger-600">Failed to load Profile</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
            <button onClick={fetchProfile} className="btn-primary mx-auto">
              Retry Load
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const level = data?.stats?.completedTopics + 1 || 1;
  const xp = (data?.stats?.completedTopics || 0) * 100;
  const streak = data?.stats?.streak || 0;
  const mastery = `${data?.stats?.overallProgress || 0}%`;

  return (
    <PageLayout title="Profile" description="Your account and learning identity.">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-5">
            <Avatar name={name} size="xl" className="border-2 border-white dark:border-slate-800 ring-4 ring-accent-50 dark:ring-accent-950/20" />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                {name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 text-xs font-semibold">
                Verified ASCEND Student
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile icon={Award} label="Level" value={`${level}`} />
          <StatTile
            icon={Zap}
            label="XP"
            value={xp.toLocaleString()}
            accent="text-warning-600"
            bg="bg-warning-50"
          />
          <StatTile
            icon={Flame}
            label="Day Streak"
            value={`${streak}`}
            accent="text-danger-600"
            bg="bg-rose-50"
          />
          <StatTile
            icon={TrendingUp}
            label="Mastery"
            value={mastery}
            accent="text-success-600"
            bg="bg-success-50"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-accent-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Account Details
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-base-600">
              <span className="text-sm text-slate-500">Plan</span>
              <span className="text-sm font-medium text-slate-900">Free</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-slate-500">Account ID</span>
              <span className="text-sm font-mono text-slate-600 truncate max-w-[200px]">
                {user?.id || 'u_001'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
