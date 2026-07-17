import { motion } from 'framer-motion';
import {
  Bell,
  HelpCircle,
  Award,
  Flame,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { mockRecentActivity } from '../services/mockData';

const iconMap = {
  quiz: HelpCircle,
  lesson: BookOpen,
  milestone: Award,
  streak: Flame,
} as const;

const colorMap = {
  quiz: 'bg-accent-50 text-accent-600',
  lesson: 'bg-emerald-50 text-success-600',
  milestone: 'bg-amber-50 text-warning-600',
  streak: 'bg-rose-50 text-danger-600',
} as const;

export default function Notifications() {
  return (
    <PageLayout
      title="Notifications"
      description="Recent activity and updates across your account."
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-accent-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Activity
            </h3>
          </div>
          <div className="relative space-y-5">
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-base-600" />
            {mockRecentActivity.map((item, i) => {
              const Icon = iconMap[item.type];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="relative flex items-start gap-4"
                >
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorMap[item.type]}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {item.timestamp}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Notification Preferences
            </h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Manage your notification settings in the{' '}
            <span className="font-medium text-slate-700">Settings</span> page
            under the Notifications section.
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
