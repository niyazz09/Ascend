import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Flame,
  BookOpen,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  HelpCircle,
  RefreshCw,
  Play,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  mastery: Target,
  xp: Zap,
  streak: Flame,
  lessons: BookOpen,
} as const;

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

const trendColor = {
  up: 'text-success-600',
  down: 'text-danger-600',
  flat: 'text-slate-400',
} as const;

interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  icon: 'mastery' | 'xp' | 'streak' | 'lessons';
}

function StatCard({ metric }: { metric: DashboardMetric }) {
  const Icon = iconMap[metric.icon];
  const TrendIcon = trendIcon[metric.trend];
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-accent-600" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor[metric.trend]}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {metric.delta}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[13px] text-slate-500">{metric.label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-slate-900 tracking-tight">
          {metric.value}
        </p>
      </div>
    </div>
  );
}

function MasteryRing({ value }: { value: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-base-600"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          style={{ transition: 'stroke-dashoffset 1s ease-out 0.2s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-slate-900">{value}%</span>
        <span className="text-xs text-slate-500 mt-1">Mastery</span>
      </div>
    </div>
  );
}

const activityIcon = {
  quiz: HelpCircle,
  lesson: BookOpen,
  streak: Flame,
} as const;

const activityColor = {
  quiz: 'bg-accent-50 text-accent-600',
  lesson: 'bg-emerald-50 text-success-600',
  streak: 'bg-rose-50 text-danger-600',
} as const;

const taskIcon = {
  quiz: HelpCircle,
  lesson: Play,
  review: RefreshCw,
} as const;

const taskColor = {
  quiz: 'bg-accent-50 text-accent-600',
  lesson: 'bg-emerald-50 text-success-600',
  review: 'bg-amber-50 text-warning-600',
} as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dashboard metrics');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard:', err);
        setError(err.message || 'Error communicating with server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <PageLayout title="Dashboard" description="Your learning progress at a glance.">
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6 border-rose-200 bg-rose-50/20">
            <h2 className="text-lg font-semibold text-danger-600">Failed to load Dashboard</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
            <button onClick={loadData} className="btn-primary mx-auto">
              Retry Load
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Construct metrics based on backend response
  const metrics: DashboardMetric[] = [
    {
      id: 'overall-progress',
      label: 'Overall Progress',
      value: `${data.stats.overallProgress}%`,
      delta: 'consecutive',
      trend: 'up',
      icon: 'mastery',
    },
    {
      id: 'completed-topics',
      label: 'Completed Topics',
      value: `${data.stats.completedTopics} / ${data.stats.totalTopics}`,
      delta: 'topics',
      trend: 'up',
      icon: 'lessons',
    },
    {
      id: 'average-mastery',
      label: 'Average Mastery',
      value: `${data.stats.averageMastery}%`,
      delta: 'score',
      trend: 'up',
      icon: 'mastery',
    },
    {
      id: 'streak',
      label: 'Learning Streak',
      value: `${data.stats.streak} Days`,
      delta: 'active',
      trend: data.stats.streak > 0 ? 'up' : 'flat',
      icon: 'streak',
    },
  ];

  // Map AI Recommendations
  const nextTopic = data.recommendations?.nextTopic;
  const nextTopicDetail = nextTopic 
    ? data.roadmap.roadmap.find((n: any) => n.topicId === nextTopic)
    : null;

  const recommendation = {
    title: nextTopicDetail 
      ? `Start learning ${nextTopicDetail.title}` 
      : 'Set a Learning Roadmap',
    reason: data.recommendations.reviewTopics && data.recommendations.reviewTopics.length > 0
      ? `The AI Analyzer suggests reviewing: ${data.recommendations.reviewTopics.join(', ')}.`
      : 'Ready to continue? Follow your roadmap to maximize retention.',
    action: nextTopic ? 'Start Quiz' : 'Create Roadmap',
    topic: nextTopicDetail ? nextTopicDetail.title : 'No Goal Active'
  };

  // Map Continue Learning section
  const activeTopic = data.roadmap.roadmap.find((node: any) => node.status === 'next') || data.roadmap.roadmap[0];
  const activeMastery = activeTopic ? (data.mastery.find((m: any) => m.topicId === activeTopic.topicId)?.score || 0) : 0;

  const continueLearning = activeTopic
    ? {
        topicName: data.roadmap.goal || 'General Path',
        lessonTitle: activeTopic.title,
        progress: Math.min(activeMastery, 100),
        estimatedMinutes: 30,
        nextLesson: activeTopic.title
      }
    : null;

  // Map Recent Activity
  const recentActivities = data.recentEvidence.map((log: any, idx: number) => ({
    id: `act-${idx}`,
    type: 'quiz' as const,
    title: `Quiz Attempt on ${data.roadmap.roadmap.find((n: any) => n.topicId === log.topicId)?.title || log.topicId}`,
    detail: `Score updated to ${log.newScore}% (Delta: ${log.delta > 0 ? `+${log.delta}` : log.delta})`,
    timestamp: new Date(log.timestamp).toLocaleDateString()
  }));

  // Map Upcoming Tasks
  const upcomingTasks = data.roadmap.roadmap
    ? data.roadmap.roadmap
        .filter((n: any) => n.status !== 'completed')
        .slice(0, 3)
        .map((node: any) => ({
          id: node.topicId,
          type: node.status === 'next' ? 'review' as const : 'lesson' as const,
          title: node.title,
          topic: data.roadmap.goal || 'Roadmap',
          due: node.status === 'next' ? 'Next Up' : 'Locked'
        }))
    : [];

  return (
    <PageLayout title="Dashboard" description="Your learning progress at a glance.">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Mastery + AI Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 flex flex-col items-center justify-center">
            <h3 className="text-[13px] font-medium text-slate-500 mb-4 self-start">
              Overall Mastery
            </h3>
            <MasteryRing value={data.stats.overallProgress} />
            <p className="mt-4 text-xs text-slate-500 text-center">
              Keep practicing to level up your mastery ring!
            </p>
          </div>

          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Today's AI Recommendation
              </h3>
              <span className="ml-auto text-xs text-accent-700 font-medium bg-accent-50 px-2 py-1 rounded-md">
                Mastery Booster
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-900">
              {recommendation.title}
            </h4>
            <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
              {recommendation.reason}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(nextTopic ? '/quiz' : '/roadmap')}
                className="btn-primary"
              >
                {recommendation.action}
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500">
                Topic: {recommendation.topic}
              </span>
            </div>
          </div>
        </div>

        {/* Continue Learning + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {continueLearning && (
            <div className="card p-6">
              <h3 className="text-[13px] font-medium text-slate-500 mb-4">
                Continue Learning
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-slate-500">{continueLearning.topicName}</p>
                  <p className="text-base font-semibold text-slate-900 truncate">
                    {continueLearning.lessonTitle}
                  </p>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Mastery Progress</span>
                <span className="text-slate-700 font-medium">
                  {continueLearning.progress}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full"
                  style={{
                    width: `${continueLearning.progress}%`,
                    transition: 'width 1s ease-out 0.3s',
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {continueLearning.estimatedMinutes} min
                </span>
                <button
                  onClick={() => navigate('/focused-session')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-600 hover:text-accent-700 transition-colors"
                >
                  Resume
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="lg:col-span-2 card p-6">
            <h3 className="text-[13px] font-medium text-slate-500 mb-5">
              Upcoming Roadmap Tasks
            </h3>
            <div className="space-y-3">
              {upcomingTasks.map((task: any, i: number) => {
                const Icon = taskIcon[task.type as keyof typeof taskIcon];
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(task.due === 'Next Up' ? '/focused-session' : '/roadmap')}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-base-600 hover:border-accent-200 hover:bg-white transition-colors cursor-pointer"
                    style={{
                      opacity: 0,
                      animation: `fade-up 0.3s ease-out ${i * 60 + 300}ms forwards`,
                    }}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${taskColor[task.type as keyof typeof taskColor]}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-slate-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">{task.topic}</p>
                    </div>
                    <span className="text-xs text-slate-600 bg-white border border-base-600 px-2.5 py-1 rounded-md shrink-0">
                      {task.due}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6">
          <div className="card p-6">
            <h3 className="text-[13px] font-medium text-slate-500 mb-5">
              Recent Activity
            </h3>
            {recentActivities.length > 0 ? (
              <div className="relative space-y-5">
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-base-600" />
                {recentActivities.map((item: any, i: number) => {
                  const Icon = activityIcon[item.type as keyof typeof activityIcon];
                  return (
                    <div
                      key={item.id}
                      className="relative flex items-start gap-4"
                      style={{
                        opacity: 0,
                        animation: `fade-up 0.3s ease-out ${i * 60 + 200}ms forwards`,
                      }}
                    >
                      <div
                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activityColor[item.type as keyof typeof activityColor]}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No recent activity yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
