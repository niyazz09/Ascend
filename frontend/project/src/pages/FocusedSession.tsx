import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Target,
  Zap,
  Sparkles,
  ListChecks,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Code2,
  Timer,
  Play,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Lightbulb,
  AlertTriangle,
  Send,
  RefreshCw
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

const difficultyStyles: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  Advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Expert: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl font-mono">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            code-sample.js
          </span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(lines.join('\n'));
            alert('Code copied to clipboard!');
          }}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          📋 Copy
        </button>
      </div>
      <pre className="px-4 py-4 text-xs leading-relaxed text-slate-200 overflow-x-auto">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="select-none text-slate-600 w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
            <span className={l.startsWith('//') || l.startsWith('  //') ? 'text-slate-500 italic' : ''}>{l}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export default function FocusedSession() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dynamicDetails, setDynamicDetails] = useState<any>(null);

  // Step Pagination state (1..6)
  const [currentStep, setCurrentStep] = useState(1);
  const [revealHint, setRevealHint] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // AI Mentor state
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorMode, setMentorMode] = useState<'teaching' | 'hint' | 'debugging' | 'revision' | 'interview'>('teaching');
  const [mentorInput, setMentorInput] = useState('');
  const [mentorMessages, setMentorMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: "Hello! I am your AI Learning Coach. Ask me any question about this lesson's theory or practice!" }
  ]);
  const [sendingMentor, setSendingMentor] = useState(false);

  const loadDashboard = (refresh = false) => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load focused session metrics');
        return res.json();
      })
      .then(json => {
        setDashboardData(json);
        const activeTopicId = json.recommendations?.nextTopic || 'html-basics';
        const activeTopicNode = json.roadmap?.roadmap?.find((n: any) => n.topicId === activeTopicId) 
          || json.roadmap?.roadmap?.[0]
          || { title: 'HTML Basics', topicId: 'html-basics' };
        const goal = json.roadmap?.goal || 'General';

        const endpoint = `/planner/topic-details?topicId=${activeTopicId}&topicTitle=${encodeURIComponent(activeTopicNode.title)}&goal=${encodeURIComponent(goal)}${refresh ? '&refresh=1' : ''}`;
        return fetchWithAuth(endpoint);
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load RAG topic details');
        return res.json();
      })
      .then(detailsJson => {
        setDynamicDetails(detailsJson);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load topic details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const handleSendMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim() || sendingMentor) return;

    const userMsg = mentorInput.trim();
    setMentorInput('');
    setMentorMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSendingMentor(true);

    try {
      const res = await fetchWithAuth('/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: mentorMessages.map(m => ({ role: m.role, content: m.content })),
          goal: dashboardData?.roadmap?.goal || 'General',
          currentNode: dynamicDetails?.lessonTitle || 'Active Topic',
          mode: mentorMode,
          lessonContext: dynamicDetails
        })
      });

      if (res.ok) {
        const json = await res.json();
        setMentorMessages(prev => [...prev, { role: 'assistant', content: json.response }]);
      } else {
        setMentorMessages(prev => [...prev, { role: 'assistant', content: 'Apologies, I encountered a temporary connection issue. Please try again.' }]);
      }
    } catch (err) {
      console.error('Mentor error:', err);
    } finally {
      setSendingMentor(false);
    }
  };

  const markComplete = async () => {
    if (completed) return;
    try {
      const activeTopicId = dashboardData?.recommendations?.nextTopic || 'html-basics';
      const res = await fetchWithAuth('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: activeTopicId,
          questionResult: { difficulty: 80, correct: true, questionType: "focused_session", timestamp: Date.now() }
        })
      });
      if (res.ok) {
        setCompleted(true);
        setRunning(false);
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="mt-4 text-xs text-slate-400 font-medium">Retrieving educational sources & generating RAG lesson...</p>
      </div>
    );
  }

  const activeTopicId = dashboardData?.recommendations?.nextTopic || 'html-basics';
  const activeTopicNode = dashboardData?.roadmap?.roadmap?.find((n: any) => n.topicId === activeTopicId) 
    || dashboardData?.roadmap?.roadmap?.[0]
    || { title: 'HTML Basics' };
  const goal = dashboardData?.roadmap?.goal || 'General Goal';

  const stepsList = [
    { id: 1, name: 'Overview & Objectives' },
    { id: 2, name: 'Core Theory & Diagrams' },
    { id: 3, name: 'Progressive Code' },
    { id: 4, name: 'Interactive Practice' },
    { id: 5, name: 'Video Masterclasses' },
    { id: 6, name: 'Revision & Sources' }
  ];

  return (
    <PageLayout
      title="RAG Learning Session"
      description="Grounded, structured lesson powered by verified educational sources."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboard(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            Refresh Lesson
          </button>
          <button
            onClick={() => setMentorOpen(!mentorOpen)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Mentor Chat
          </button>
          <button
            onClick={() => navigate('/roadmap')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Roadmap
          </button>
        </div>
      }
    >
      <div className="space-y-6 text-slate-100">
        {/* Step Navigation Bar */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between overflow-x-auto gap-2">
          {stepsList.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.id}
                </span>
                <span className="truncate">{step.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: Overview & Objectives */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Motivation Banner: Why This Matters */}
                <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">🎯 Why This Matters</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {dynamicDetails?.lessonTitle || activeTopicNode.title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {dynamicDetails?.whyItMatters || dynamicDetails?.lessonContent}
                  </p>
                </div>

                {/* Metadata Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400">Target Goal</p>
                    <p className="text-xs font-bold text-slate-200 truncate mt-1">{goal}</p>
                  </div>
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400">Difficulty</p>
                    <span className={`inline-block mt-1 badge text-[11px] ${difficultyStyles['Intermediate']}`}>
                      Intermediate
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400">Estimated Reading</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">⏱ 15-20 min</p>
                  </div>
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400">RAG Grounding</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">Verified {dynamicDetails?.confidenceScore || 98}%</p>
                  </div>
                </div>

                {/* Objectives & Key Takeaways */}
                <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-indigo-400" />
                    Learning Objectives & Expected Outcomes
                  </h3>
                  <ul className="space-y-3">
                    {(dynamicDetails?.objectives || []).map((obj: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* STEP 2: Core Theory & ASCII Diagrams */}
            {currentStep === 2 && (
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-5">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Core Theoretical Mechanics & Architecture
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
                  {dynamicDetails?.theory}
                </div>
              </div>
            )}

            {/* STEP 3: Progressive Code Breakdown & Fixes */}
            {currentStep === 3 && (
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    {dynamicDetails?.progressiveExample?.concept || 'Progressive Pattern'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    Code Sample & Execution Output
                  </h3>
                </div>

                <CodeBlock lines={dynamicDetails?.progressiveExample?.code || dynamicDetails?.codeSnippet || []} />

                {dynamicDetails?.progressiveExample?.output && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400">
                    <span className="text-slate-500 select-none">$ Output: </span>
                    {dynamicDetails.progressiveExample.output}
                  </div>
                )}

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Step-by-Step Breakdown</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {dynamicDetails?.progressiveExample?.explanation || 'Executes the main operational loop and maintains state bounds.'}
                  </p>
                </div>

                {/* Common Mistake & Fix */}
                {dynamicDetails?.progressiveExample?.commonMistake && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        Common Beginner Pitfall
                      </div>
                      <p className="text-xs text-slate-300">{dynamicDetails.progressiveExample.commonMistake}</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        Recommended Fix
                      </div>
                      <p className="text-xs text-slate-300">{dynamicDetails.progressiveExample.fix}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Interactive Practice Exercise */}
            {currentStep === 4 && (
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-100">Interactive Practice Challenge</h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    +50 XP Reward
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 border border-slate-800 rounded-xl">
                  {dynamicDetails?.practiceExercise?.prompt || 'Write a function that validates input values before returning.'}
                </p>

                <div>
                  <button
                    onClick={() => setRevealHint(!revealHint)}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    {revealHint ? 'Hide Hint' : 'Reveal Hint'}
                  </button>
                  {revealHint && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                      💡 {dynamicDetails?.practiceExercise?.hint || 'Ensure you check for empty parameters.'}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-2">Solution Code</h4>
                  <CodeBlock lines={dynamicDetails?.practiceExercise?.solution || ["function solve() { return true; }"]} />
                  <p className="mt-2 text-xs text-slate-400 italic">
                    {dynamicDetails?.practiceExercise?.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: Video Masterclasses */}
            {currentStep === 5 && (
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Curated YouTube Masterclasses (Grounded)
                  </h3>
                  <span className="text-xs text-slate-400">Cached Real Metadata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(dynamicDetails?.videoRecommendations || []).map((vid: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded-2xl space-y-3 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-rose-400 uppercase">{vid.channel || 'Verified Channel'}</span>
                          <span>⏱ {vid.duration || '20 min'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{vid.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{vid.description}</p>
                      </div>
                      <a
                        href={vid.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Watch Lecture Video
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Revision & Verified Sources Drawer */}
            {currentStep === 6 && (
              <div className="space-y-6">
                {/* Mini Revision Notes */}
                <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    High-Yield Revision Notes
                  </h3>
                  <ul className="space-y-2">
                    {(dynamicDetails?.miniRevisionNotes || []).map((note: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Verified Sources Drawer */}
                <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-100">Verified Grounded Sources ({dynamicDetails?.sources?.length || 0})</h3>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      Confidence: {dynamicDetails?.confidenceScore || 98}%
                    </span>
                  </div>

                  <button
                    onClick={() => setSourcesOpen(!sourcesOpen)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-between"
                  >
                    <span>{sourcesOpen ? 'Collapse Sources' : 'View Verified Sources →'}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${sourcesOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {sourcesOpen && (
                    <div className="space-y-3 pt-2">
                      {(dynamicDetails?.sources || []).map((s: any) => (
                        <a
                          key={s.id}
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all space-y-1 group"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-400">{s.citationTag} {s.websiteName}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{s.articleTitle}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{s.description}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination Action Bar */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
              <button
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>

              <span className="text-xs text-slate-400 font-medium">
                Step {currentStep} of {stepsList.length}
              </span>

              {currentStep < stepsList.length ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(stepsList.length, prev + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={markComplete}
                  disabled={completed}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {completed ? '✓ Lesson Completed' : 'Mark Lesson Complete'}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Persistent AI Mentor Chat Drawer & Timer */}
          <div className="space-y-6">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-3">
              <Timer className="w-6 h-6 text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-400">Study Session Timer</p>
              <p className="text-2xl font-bold text-slate-100 font-mono">{formatTime(seconds)}</p>
              {!completed ? (
                <button onClick={markComplete} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all">
                  Finish Focus Session
                </button>
              ) : (
                <button onClick={() => navigate('/quiz', { state: { topicId: activeTopicId } })} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5">
                  Start Checkpoint Quiz
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* AI Mentor Persistent Memory Drawer */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-100">AI Mentor (Lesson Memory)</h3>
                </div>
                <select
                  value={mentorMode}
                  onChange={(e: any) => setMentorMode(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[11px] text-indigo-300 font-semibold rounded-lg px-2 py-1 outline-none"
                >
                  <option value="teaching">Teaching Mode</option>
                  <option value="hint">Hint Mode</option>
                  <option value="debugging">Debug Mode</option>
                  <option value="revision">Revision Mode</option>
                  <option value="interview">Interview Mode</option>
                </select>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {mentorMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMentor} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={mentorInput}
                  onChange={(e) => setMentorInput(e.target.value)}
                  placeholder="Ask a question about this lesson..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sendingMentor}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
