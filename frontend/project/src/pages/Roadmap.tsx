import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  X,
  ArrowRight,
  CircleDot,
  BookOpen,
  ListChecks,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

type Filter = 'all' | 'completed' | 'current' | 'locked';

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'current', label: 'Current' },
  { key: 'locked', label: 'Locked' },
];

const difficultyStyles: Record<string, string> = {
  Beginner: 'bg-success-50 text-success-600 border-success-200',
  Intermediate: 'bg-accent-50 text-accent-700 border-accent-200',
  Advanced: 'bg-warning-50 text-warning-600 border-warning-200',
  Expert: 'bg-rose-50 text-danger-600 border-rose-200',
};

function statusRing(status: string) {
  if (status === 'completed') return 'border-success-500 bg-success-50';
  if (status === 'current') return 'border-accent-500 bg-accent-50';
  return 'border-base-600 bg-white';
}

function statusIcon(status: string) {
  if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-success-600" />;
  if (status === 'current') return <CircleDot className="w-5 h-5 text-accent-600" />;
  return <Lock className="w-4 h-4 text-slate-400" />;
}

function StatPill({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-accent-600" />
        </div>
        <div>
          <p className="text-[13px] text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-900 tracking-tight">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function NodeCard({
  node,
  index,
  onSelect,
  totalNodes,
}: {
  node: any;
  index: number;
  onSelect: (n: any) => void;
  totalNodes: number;
}) {
  const isLocked = node.status === 'locked';
  const isCurrent = node.status === 'current';
  const isCompleted = node.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="relative flex items-stretch gap-4"
    >
      <div className="relative flex flex-col items-center">
        {index !== 0 && (
          <div
            className={`w-px flex-1 -mb-2 ${
              isCompleted ? 'bg-success-500/40' : 'bg-base-600'
            }`}
          />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(node)}
          className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${statusRing(node.status)}`}
        >
          {isCurrent && (
            <motion.span
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-accent-200"
            />
          )}
          {statusIcon(node.status)}
        </motion.button>
        {index !== totalNodes - 1 && (
          <div
            className={`w-px flex-1 -mt-2 ${
              isCompleted ? 'bg-success-500/40' : 'bg-base-600'
            }`}
          />
        )}
      </div>

      <motion.button
        whileHover={{ y: -2 }}
        onClick={() => onSelect(node)}
        className={`group flex-1 text-left card card-hover p-5 mb-4 transition-colors ${
          isLocked
            ? 'opacity-70 hover:opacity-100'
            : isCurrent
              ? 'border-accent-200 hover:border-accent-300'
              : 'hover:border-base-500'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">Step {node.order}</span>
              <span className={`badge ${difficultyStyles[node.difficulty]}`}>
                {node.difficulty}
              </span>
            </div>
            <h3
              className={`mt-1.5 text-base font-semibold tracking-tight ${
                isLocked ? 'text-slate-500' : 'text-slate-900'
              }`}
            >
              {node.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{node.topic}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
            <Zap className="w-3.5 h-3.5 text-warning-600" />
            {node.xp} XP
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {node.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              {isLocked ? 'Locked' : `${node.mastery}% mastery`}
            </span>
          </div>
          {!isLocked && (
            <span className="text-xs font-medium text-accent-600 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
              Details
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {!isLocked && (
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${node.mastery}%` }}
              transition={{ duration: 0.7, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isCompleted
                  ? 'bg-success-500'
                  : 'bg-accent-500'
              }`}
            />
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}

function SidePanel({ node, onClose, goal }: { node: any; onClose: () => void; goal: string }) {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [projectBlueprint, setProjectBlueprint] = useState<any>(null);
  const [generatingProject, setGeneratingProject] = useState(false);

  const isLocked = node.status === 'locked';
  const isCompleted = node.status === 'completed';

  const handleGenerateProject = async () => {
    setGeneratingProject(true);
    try {
      const res = await fetchWithAuth('/planner/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicTitle: node.title, goal })
      });
      if (res.ok) {
        const json = await res.json();
        setProjectBlueprint(json);
      }
    } catch (err) {
      console.error('Failed to generate AI project blueprint:', err);
    } finally {
      setGeneratingProject(false);
    }
  };

  useEffect(() => {
    setProjectBlueprint(null);
    setLoadingDetails(true);
    setDetails(null);
    fetchWithAuth(`/planner/topic-details?topicId=${node.topicId}&topicTitle=${encodeURIComponent(node.title)}&goal=${encodeURIComponent(goal)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load topic details');
        return res.json();
      })
      .then(json => {
        setDetails(json);
        setLoadingDetails(false);
      })
      .catch(err => {
        console.error('Failed to load topic details:', err);
        // Fallback placeholder content
        setDetails({
          lessonTitle: node.title,
          lessonContent: `Study guide and conceptual checklist for "${node.title}" as part of learning "${goal}".`,
          objectives: [
            `Analyze target structures of ${node.title}`,
            `Synthesize custom templates inside ${node.title}`,
            `Validate integration patterns`
          ],
          keyConcepts: [
            `Standard design approaches`,
            `Prerequisites enforcement`
          ],
          resources: {
            documentation: 'https://google.com/search?q=' + encodeURIComponent(node.title + ' documentation'),
            youtube: 'https://youtube.com/results?search_query=' + encodeURIComponent(node.title),
            books: 'https://google.com/search?q=' + encodeURIComponent(node.title + ' books')
          }
        });
        setLoadingDetails(false);
      });
  }, [node.topicId, node.title, goal]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-base-600 shadow-pop overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 h-14 bg-white border-b border-base-600">
          <div className="flex items-center gap-2">
            <span className={`badge ${difficultyStyles[node.difficulty] || 'bg-slate-50 text-slate-600 border-base-600'}`}>
              {node.difficulty}
            </span>
            <span className="text-xs text-slate-500">Step {node.order}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <p className="text-xs text-slate-500">{node.topic}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900 tracking-tight">
              {node.title}
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {details?.lessonContent || node.description}
            </p>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isLocked
                ? 'bg-slate-50 border-base-600'
                : isCompleted
                  ? 'bg-success-50 border-success-200'
                  : 'bg-accent-50 border-accent-200'
            }`}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-slate-400" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success-600" />
            ) : (
              <CircleDot className="w-5 h-5 text-accent-600" />
            )}
            <span className="text-sm text-slate-700">
              {isLocked
                ? 'Complete prerequisites to unlock'
                : isCompleted
                  ? 'Completed — mastery achieved'
                  : 'In progress — keep going!'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-base-600 rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 text-accent-600 mx-auto" />
              <p className="mt-1.5 text-base font-semibold text-slate-900">
                {node.estimatedMinutes}
              </p>
              <p className="text-[11px] text-slate-500">minutes</p>
            </div>
            <div className="bg-slate-50 border border-base-600 rounded-lg p-3 text-center">
              <Target className="w-4 h-4 text-success-600 mx-auto" />
              <p className="mt-1.5 text-base font-semibold text-slate-900">
                {node.mastery}%
              </p>
              <p className="text-[11px] text-slate-500">mastery</p>
            </div>
            <div className="bg-slate-50 border border-base-600 rounded-lg p-3 text-center">
              <Zap className="w-4 h-4 text-warning-600 mx-auto" />
              <p className="mt-1.5 text-base font-semibold text-slate-900">
                {node.xp}
              </p>
              <p className="text-[11px] text-slate-500">XP</p>
            </div>
          </div>

          {node.resources && (
            <div className="border-t border-base-600 pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-600" />
                <h3 className="text-sm font-semibold text-slate-900">Curated Learning Resources</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(typeof node.resources === 'string' ? JSON.parse(node.resources) : node.resources).map(([key, val]: any) => {
                  if (!val || !val.title) return null;
                  
                  let icon = "🌍";
                  if (key === "books") icon = "📖";
                  if (key === "videos") icon = "🎥";
                  if (key === "practice") icon = "💻";
                  if (key === "interactive") icon = "🧪";

                  return (
                    <a
                      key={key}
                      href={val.link.startsWith('http') ? val.link : `https://google.com/search?q=${encodeURIComponent(val.link)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3.5 rounded-xl border border-base-600 hover:border-accent-500 hover:bg-slate-50 transition-all bg-slate-50/50 hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900 hover:text-accent-600 transition-colors">
                              {val.title}
                            </h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/50 text-slate-500">
                              {key}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-normal">
                            {val.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 mt-2">Generating theory & study notes...</p>
            </div>
          ) : (
            details && (
              <>
                {details.theory && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Core Theory & Breakdown
                      </h3>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {details.theory}
                    </div>
                  </div>
                )}

                {details.videoRecommendations && details.videoRecommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      🎥 Recommended Theory Video Lectures
                    </h3>
                    <div className="space-y-2">
                      {details.videoRecommendations.map((vid: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{vid.title}</h4>
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{vid.duration}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-normal">{vid.description}</p>
                          <a
                            href={vid.youtubeUrl || `https://youtube.com/results?search_query=${encodeURIComponent(vid.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700"
                          >
                            Watch Lecture Video →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-accent-600" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Learning Objectives
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {details.objectives.map((obj: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-slate-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-accent-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Prerequisites</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {node.prerequisites.length > 0 ? (
                      node.prerequisites.map((p: string) => (
                        <span
                          key={p}
                          className="text-xs text-slate-700 bg-slate-50 border border-base-600 px-2.5 py-1.5 rounded-md"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
              </>
            )
          )}

          {/* Project Blueprint Card */}
          {projectBlueprint && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">AI Portfolio Project</span>
                <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded text-[10px] font-bold">{projectBlueprint.difficulty}</span>
              </div>
              <h4 className="font-bold text-indigo-950 text-sm">{projectBlueprint.projectName}</h4>
              <p className="text-xs text-slate-700">{projectBlueprint.description}</p>
              
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-indigo-900">Key Features:</div>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                  {projectBlueprint.features?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {projectBlueprint.folderStructure && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-indigo-900">Folder Structure:</div>
                  <pre className="p-2 bg-slate-900 text-slate-200 text-[10px] rounded-lg overflow-x-auto">
                    {projectBlueprint.folderStructure}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate(`/resources?topic=${encodeURIComponent(node.title)}`)}
              className="w-full py-2.5 px-4 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Find More Resources
            </button>

            <button
              onClick={handleGenerateProject}
              disabled={generatingProject}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {generatingProject ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-indigo-700 rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Generate AI Project Blueprint
                </>
              )}
            </button>

            <button
              disabled={isLocked}
              onClick={() => !isLocked && navigate('/quiz')}
              className={`w-full inline-flex items-center justify-center gap-2 font-medium px-5 py-2.5 rounded-lg transition-colors ${
                isLocked
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isCompleted
                    ? 'btn-secondary'
                    : 'btn-primary'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  Locked
                </>
              ) : isCompleted ? (
                'Review Topic'
              ) : (
                <>
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Roadmap() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<any>(null);
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [goalInput, setGoalInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDeleteRoadmap = async () => {
    setDeleting(true);
    setPlannerError(null);
    setSuccessMessage(null);
    try {
      const res = await fetchWithAuth('/planner', {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowConfirm(false);
        setGoalInput('');
        setSuccessMessage("Roadmap cleared successfully. Choose a new career goal.");
        setTimeout(() => setSuccessMessage(null), 4000);
        fetchDashboard();
      } else {
        const errJson = await res.json();
        setPlannerError(errJson.error || 'Failed to clear learning goal');
      }
    } catch (err: any) {
      setPlannerError(err.message || 'Error communicating with server');
    } finally {
      setDeleting(false);
    }
  };

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load learning goal roadmap');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching roadmap data:', err);
        setError(err.message || 'Error communicating with server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;

    setSubmitting(true);
    setPlannerError(null);
    setSuccessMessage(null);
    try {
      const res = await fetchWithAuth('/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalInput.trim() })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.message === 'Unknown goal' || !json.roadmap || json.roadmap.length === 0) {
          setPlannerError("We couldn't generate a personalized roadmap for this learning goal yet. Please try a broader topic or one that is currently supported.");
        } else {
          setGoalInput('');
          fetchDashboard();
        }
      } else {
        const errJson = await res.json();
        setPlannerError(errJson.error || 'Failed to create roadmap');
      }
    } catch (err: any) {
      setPlannerError(err.message || 'Error communicating with planner agent');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedNodes = useMemo(() => {
    if (!data || !data.roadmap || !data.roadmap.roadmap) return [];

    return data.roadmap.roadmap.map((node: any, idx: number) => {
      // Map statuses and details dynamically
      const mastery = data.mastery.find((m: any) => m.topicId === node.topicId)?.score || 0;
      const isCompleted = node.status === 'completed';
      const isCurrent = node.status === 'next';

      let difficulty = 'Beginner';
      if (idx >= 4) difficulty = 'Expert';
      else if (idx >= 3) difficulty = 'Advanced';
      else if (idx >= 1) difficulty = 'Intermediate';

      return {
        id: node.topicId,
        topicId: node.topicId,
        title: node.title,
        topic: data.roadmap.goal || 'General Node',
        difficulty,
        estimatedMinutes: 30,
        mastery: Math.min(mastery, 100),
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'locked',
        order: idx + 1,
        description: `Deepen your knowledge of ${node.title} and explore core concepts, logic flows, and use cases.`,
        objectives: [
          `Recognize and configure basic ${node.title} components`,
          `Analyze and trace inputs through the ${node.title} process`,
          `Validate output compliance using ${node.title} patterns`
        ],
        prerequisites: node.prerequisites || [],
        aiRecommendation: data.recommendations.reviewTopics.includes(node.topicId)
          ? 'Suggested review area: recent performance highlights conceptual opportunities.'
          : 'Great standing: follow the standard flow to expand your mastery envelope.',
        xp: 100
      };
    });
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === 'all') return formattedNodes;
    return formattedNodes.filter((n: any) => n.status === filter);
  }, [filter, formattedNodes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <PageLayout title="Learning Roadmap" description="Your personalized path to mastery.">
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6 border-rose-200 bg-rose-50/20">
            <h2 className="text-lg font-semibold text-danger-600">Failed to load Roadmap</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
            <button onClick={fetchDashboard} className="btn-primary mx-auto">
              Retry Load
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Active Goal Check
  const hasRoadmap = data.roadmap && data.roadmap.goal && data.roadmap.roadmap.length > 0;

  return (
    <PageLayout
      title="Learning Roadmap"
      description="Your personalized path to mastery."
      actions={
        hasRoadmap ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3.5 py-2 rounded-lg border border-base-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Change Goal
          </button>
        ) : undefined
      }
    >
      {!hasRoadmap ? (
        <div className="max-w-xl mx-auto mt-8">
          <div className="card p-6 border-accent-200 bg-accent-50/20">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-700" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Choose Your Learning Goal</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Enter a learning objective (e.g. "Frontend Developer", "Machine Learning", "Backend Architect") to dynamically generate your structured path.
            </p>
            {successMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-success-700 mb-4">
                {successMessage}
              </div>
            )}
            {plannerError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-danger-600 mb-4">
                {plannerError}
              </div>
            )}
            <form onSubmit={handleCreateRoadmap} className="space-y-4">
              <div>
                <label htmlFor="goal" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Learning Goal Name
                </label>
                <input
                  type="text"
                  id="goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full bg-white border border-base-600 rounded-lg px-3 py-2 text-[13px] text-slate-950 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center"
              >
                {submitting ? 'Generating Path...' : 'Generate Roadmap'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {data.roadmap?.source === 'fallback' && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13px] text-amber-800 flex items-center gap-2 font-medium">
              <span>⚠ AI planner is temporarily unavailable. A generic learning roadmap has been generated.</span>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          >
            <StatPill
              icon={Target}
              label="Roadmap Completion"
              value={`${data.stats.overallProgress}%`}
              sub={`${data.stats.completedTopics} of ${data.stats.totalTopics} completed`}
            />
            <StatPill
              icon={Zap}
              label="XP Earned"
              value={`${data.stats.completedTopics * 100}`}
              sub={`of ${data.stats.totalTopics * 100} total available`}
            />
            <StatPill
              icon={Clock}
              label="Estimated Time"
              value={`${(data.stats.totalTopics - data.stats.completedTopics) * 30} min`}
              sub="across all remaining nodes"
            />
          </motion.div>

          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Goal: {data.roadmap.goal}</span>
              <span className="text-sm font-semibold text-slate-900">
                {data.stats.overallProgress}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.stats.overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-accent-500 rounded-full"
              />
            </div>
          </div>

          {/* Change goal button option */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                    filter === f.key
                      ? 'text-accent-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {filter === f.key && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 bg-accent-50 border border-accent-200 rounded-lg"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs font-semibold text-slate-500 hover:text-accent-700 transition-colors"
            >
              Reset Goal
            </button>
          </div>

          <div className="max-w-2xl">
            <AnimatePresence mode="popLayout">
              {filtered.map((node: any, i: number) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  index={i}
                  onSelect={setSelected}
                  totalNodes={filtered.length}
                />
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {selected && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelected(null)}
                  className="fixed inset-0 z-40 bg-slate-900/40"
                />
                <SidePanel node={selected} onClose={() => setSelected(null)} goal={data?.roadmap?.goal || ''} />
              </>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="card max-w-md w-full p-6 bg-white border border-base-600 shadow-xl m-4"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Reset Learning Goal</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    This will permanently delete your current roadmap and progress. Continue?
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={deleting}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteRoadmap}
                      disabled={deleting}
                      className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Continue'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </PageLayout>
  );
}
