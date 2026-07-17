import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

function MiniBars({ score }: { score: number }) {
  const bars = 12;
  const filled = Math.round((score / 100) * bars);
  return (
    <div className="flex items-end gap-1 h-10">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${i < filled ? 'bg-accent-500' : 'bg-slate-200'}`}
          style={{ height: `${30 + (i % 4) * 18}%` }}
        />
      ))}
    </div>
  );
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-accent-600';
  return 'text-danger-600';
}

function scoreBadge(score: number) {
  if (score >= 80) return 'bg-success-50 text-success-700 border-success-200';
  if (score >= 60) return 'bg-accent-50 text-accent-700 border-accent-200';
  return 'bg-rose-50 text-danger-600 border-rose-200';
}

export default function Analysis() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth('/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json);
        if (json.roadmap && json.roadmap.roadmap && json.roadmap.roadmap.length > 0) {
          const firstActive = json.roadmap.roadmap.find((n: any) => n.status !== 'locked') || json.roadmap.roadmap[0];
          setActiveId(firstActive.topicId);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load analysis:', err);
        setLoading(false);
      });
  }, []);

  const formattedAnalysis = useMemo(() => {
    if (!data || !data.roadmap || !data.roadmap.roadmap) return [];

    return data.roadmap.roadmap
      .filter((node: any) => {
        const hasMastery = data.mastery.some((m: any) => m.topicId === node.topicId);
        return node.status !== 'locked' || hasMastery;
      })
      .map((node: any) => {
        const masteryRecord = data.mastery.find((m: any) => m.topicId === node.topicId);
        const score = masteryRecord ? masteryRecord.score : 0;
        
        const topicLogs = data.recentEvidence.filter((e: any) => e.topicId === node.topicId);
        const lastAttempt = topicLogs.length > 0 ? topicLogs[0].timestamp : Date.now();

        // Conceptual strengths and weak areas
        const strongAreas = score >= 80 
          ? [`Familiarity with basic ${node.title} tags`, `Correct structuring of elements`, `Mastery of semantic hierarchy`]
          : score >= 60
          ? [`Familiarity with basic ${node.title} tags`, `Constructive logic flows`]
          : [`Familiarity with foundational terms`];

        const weakAreas = score < 80 
          ? [`Retain ${node.title} rules`, `Review corner scenarios`, `Avoid precision gaps under timed quiz environments`]
          : [];

        return {
          id: node.topicId,
          topicName: node.title,
          score: Math.min(score, 100),
          mastery: Math.min(score, 100),
          lastAttempt,
          weakAreas,
          strongAreas,
        };
      });
  }, [data]);

  const active = useMemo(() => {
    if (formattedAnalysis.length === 0) return null;
    return formattedAnalysis.find((a: any) => a.id === activeId) || formattedAnalysis[0];
  }, [formattedAnalysis, activeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasRoadmap = data?.roadmap && data?.roadmap.goal && data?.roadmap.roadmap.length > 0;

  return (
    <PageLayout
      title="Performance Analysis"
      description="Insights into your strengths and gaps across topics."
    >
      {!hasRoadmap ? (
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">No Learning Path Active</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Create a learning goal on the Roadmap page first to begin performance evaluation tracking.
            </p>
            <button onClick={() => navigate('/roadmap')} className="btn-primary mx-auto">
              Go to Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : formattedAnalysis.length === 0 ? (
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">No Performance Data Yet</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Complete a topic checkpoint quiz to populate analytics charts!
            </p>
            <button onClick={() => navigate('/quiz')} className="btn-primary mx-auto">
              Take Quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        active && (
          <div className="space-y-6">
            {/* Topic tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {formattedAnalysis.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                    activeId === t.id
                      ? 'text-accent-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {activeId === t.id && (
                    <motion.span
                      layoutId="analysis-tab"
                      className="absolute inset-0 bg-accent-50 border border-accent-200 rounded-lg"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className="relative">{t.topicName}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Score + mastery */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-accent-600" />
                    <h3 className="text-[13px] font-medium text-slate-500">Latest Score</h3>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className={`text-4xl font-semibold tracking-tight ${scoreColor(active.score)}`}>
                        {active.score}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">out of 100</p>
                    </div>
                    <div className="flex-1">
                      <MiniBars score={active.score} />
                    </div>
                  </div>
                  <span className={`badge mt-4 ${scoreBadge(active.score)}`}>
                    {active.score >= 80 ? 'Strong' : active.score >= 60 ? 'Developing' : 'Needs focus'}
                  </span>
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-accent-600" />
                    <h3 className="text-[13px] font-medium text-slate-500">Mastery Level</h3>
                  </div>
                  <p className="text-4xl font-semibold text-slate-900 tracking-tight">
                    {active.mastery}%
                  </p>
                  <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${active.mastery}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                      className="h-full bg-accent-500 rounded-full"
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {active.mastery >= 70
                      ? 'On track for topic completion'
                      : 'Continue practicing to build mastery'}
                  </p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-accent-600" />
                    <h3 className="text-[13px] font-medium text-slate-500">Last Attempt</h3>
                  </div>
                  <p className="text-base font-medium text-slate-900">
                    {new Date(active.lastAttempt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(active.lastAttempt).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <button
                    onClick={() => navigate('/quiz', { state: { topicId: active.id } })}
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-600 hover:text-accent-700 transition-colors"
                  >
                    Retake quiz
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weak + Strong areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-danger-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Weak Areas</h3>
                    <span className="ml-auto text-xs text-slate-500">
                      {active.weakAreas.length} identified
                    </span>
                  </div>
                  {active.weakAreas.length > 0 ? (
                    <div className="space-y-2.5">
                      {active.weakAreas.map((w: string, i: number) => (
                        <div
                          key={w}
                          className="flex items-center gap-3 p-3 rounded-lg bg-rose-50/50 border border-rose-100"
                        >
                          <span className="w-6 h-6 rounded-md bg-white border border-rose-200 flex items-center justify-center text-xs font-medium text-danger-600">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-700 flex-1">{w}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No weak areas identified for this topic yet.</p>
                  )}
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-success-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Strong Areas</h3>
                    <span className="ml-auto text-xs text-slate-500">
                      {active.strongAreas.length} identified
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {active.strongAreas.map((s: string) => (
                      <div
                        key={s}
                        className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />
                        <span className="text-sm text-slate-700 flex-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="card p-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4.5 h-4.5 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Recommended next step
                    </h3>
                    <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed max-w-2xl">
                      {active.score >= 80
                        ? `You're performing well in ${active.topicName}. Consider advancing to the next topic in your roadmap to keep momentum.`
                        : `Focus your next session on ${active.weakAreas[0] ?? 'core concepts'} within ${active.topicName}. A 20-minute targeted practice can lift your mastery by an estimated 6–8%.`}
                    </p>
                    <button
                      onClick={() => navigate('/focused-session')}
                      className="mt-4 btn-primary"
                    >
                      Start focused session
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )
      )}
    </PageLayout>
  );
}
