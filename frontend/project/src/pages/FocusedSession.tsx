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
  Beginner: 'bg-success-50 text-success-600 border-success-200',
  Intermediate: 'bg-accent-50 text-accent-700 border-accent-200',
  Advanced: 'bg-warning-50 text-warning-600 border-warning-200',
  Expert: 'bg-rose-50 text-danger-600 border-rose-200',
};

// Course contents configuration mapped dynamically per topic ID
const courseMaterials: Record<string, {
  objectives: string[];
  keyConcepts: string[];
  lessonTitle: string;
  lessonContent: string;
  codeSnippet: string[];
}> = {
  'html-basics': {
    lessonTitle: 'Declaring Semantic HTML5 Elements',
    lessonContent: 'HTML is the structure behind every web application. Modern HTML5 introduces semantic tags like <header>, <nav>, <main>, <section>, and <footer>. Using semantic tags makes documents accessible, crawlable by search engines (SEO), and clean for collaborative styling.',
    objectives: [
      'Declare standard HTML5 boilerplate definitions',
      'Organize text nodes with headings, paragraphs, and lists',
      'Link external assets and document pages using anchor tags'
    ],
    keyConcepts: [
      'HTML tags are enclosed in angle brackets (< >)',
      'Attributes specify target paths, classes, and styles',
      'Semantic tags convey raw structural purpose'
    ],
    codeSnippet: [
      '<!DOCTYPE html>',
      '<html>',
      '  <head>',
      '    <title>Ascend Academy</title>',
      '  </head>',
      '  <body>',
      '    <header>',
      '      <h1>Welcome to Semantic HTML</h1>',
      '    </header>',
      '    <main>',
      '      <p>Semantic layouts improve SEO and accessibility.</p>',
      '    </main>',
      '  </body>',
      '</html>'
    ]
  },
  'css-basics': {
    lessonTitle: 'Styling with Selectors and the Box Model',
    lessonContent: 'CSS controls the presentation layer. The document flow is governed by the Box Model: margins separate boxes, borders surround boxes, padding is the empty breathing space inside borders, and content sits in the center. Flexible sizing is achieved using Flexbox and CSS Grid alignments.',
    objectives: [
      'Target elements precisely using CSS classes and IDs',
      'Control spacing using padding, borders, and margins',
      'Construct a responsive multi-column alignment using Flexbox'
    ],
    keyConcepts: [
      'Cascading rules allow parent styles to trickle down',
      'Specificity govern which styling overrides prevail',
      'Margin collapses occur on vertical overlaps'
    ],
    codeSnippet: [
      '.card {',
      '  background-color: #f8fafc;',
      '  border: 1px solid #e2e8f0;',
      '  border-radius: 8px;',
      '  padding: 16px;',
      '  margin: 12px 0;',
      '}',
      '.container {',
      '  display: flex;',
      '  gap: 16px;',
      '}'
    ]
  },
  'javascript-basics': {
    lessonTitle: 'JavaScript Control Flow and Data Types',
    lessonContent: 'JavaScript adds logical reactivity. We use let and const for block-scoped variables. Control flow executes conditional logic checks via if-statements, while loops perform repetitions, and functions encapsulate statements for dynamic reuse.',
    objectives: [
      'Declare variables using block-scoped operators',
      'Evaluate Boolean conditions using logic structures',
      'Construct functional routines with typed return properties'
    ],
    keyConcepts: [
      'Functions encapsulate reusable execution statements',
      'Array variables store collections sequentially',
      'Strict equality (===) prevents implicit conversions'
    ],
    codeSnippet: [
      'const threshold = 80;',
      'let currentMastery = 45;',
      '',
      'function evaluateCompletion(score) {',
      '  if (score >= threshold) {',
      '    return "Goal Accomplished!";',
      '  }',
      '  return "Keep practicing!";',
      '}',
      'console.log(evaluateCompletion(currentMastery));'
    ]
  },
  'dom-manipulation': {
    lessonTitle: 'Selecting Nodes and Listening to User Events',
    lessonContent: 'The Document Object Model (DOM) is an object-based tree of HTML nodes. We select targets using querySelector and attach events using addEventListener. Javascript dynamically modifies classes and content to provide responsive layouts.',
    objectives: [
      'Retrieve single or collection nodes from the document',
      'Attach event listeners representing clicks or user inputs',
      'Append, remove, or insert nodes into active layout flow'
    ],
    keyConcepts: [
      'The DOM represents your HTML file as an interactive tree',
      'Event bubbling propagates triggers up through ancestors',
      'Class List helpers add/remove design configurations'
    ],
    codeSnippet: [
      'const submitBtn = document.querySelector("#submit-btn");',
      'const feedbackText = document.querySelector(".feedback");',
      '',
      'submitBtn.addEventListener("click", () => {',
      '  feedbackText.textContent = "Answer submitted successfully!";',
      '  feedbackText.classList.add("text-success-600");',
      '});'
    ]
  },
  'web-apis': {
    lessonTitle: 'Asynchronous Requests and the Fetch API',
    lessonContent: 'Modern web apps exchange data with backend services asynchronously. We use the native Fetch API to perform GET and POST queries. Async and Await keywords resolve Promises cleanly without blocking the browser thread.',
    objectives: [
      'Construct fetch endpoints with custom request headers',
      'Handle async promises securely with try-catch blocks',
      'Translate JSON strings back into readable object models'
    ],
    keyConcepts: [
      'Async tasks execute non-blockingly in the background',
      'JSON forms structured payloads for HTTP networks',
      'Status codes determine response validation results'
    ],
    codeSnippet: [
      'async function loadDashboardData() {',
      '  try {',
      '    const response = await fetch("/api/dashboard", {',
      '      headers: { "Authorization": "Bearer token" }',
      '    });',
      '    const data = await response.json();',
      '    console.log("Stats loaded:", data.stats);',
      '  } catch (err) {',
      '    console.error("Dashboard fetch error:", err);',
      '  }',
      '}'
    ]
  }
};

function HeaderStat({
  icon: Icon,
  label,
  value,
  accent = 'text-accent-600',
  bg = 'bg-accent-50',
}: {
  icon: typeof Target;
  label: string;
  value: string;
  accent?: string;
  bg?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${accent}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] text-slate-500">{label}</p>
          <p className="text-base font-semibold text-slate-900 tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-lg border border-base-600 bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700/60">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <Code2 className="w-3.5 h-3.5" />
          syntax-highlight
        </span>
      </div>
      <pre className="px-4 py-3.5 text-[13px] leading-relaxed text-slate-100 font-mono overflow-x-auto">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="select-none text-slate-600">{String(i + 1).padStart(2, '0')}</span>
            <span className={l.startsWith('//') || l.startsWith('  //') ? 'text-slate-500' : ''}>{l}</span>
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

  const loadDashboard = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load focused session metrics');
        return res.json();
      })
      .then(json => {
        setDashboardData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard for focused session:', err);
        setError(err.message || 'Error communicating with server.');
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

  const activeTopicId = dashboardData?.recommendations?.nextTopic || 'html-basics';
  const activeTopicNode = dashboardData?.roadmap?.roadmap?.find((n: any) => n.topicId === activeTopicId) 
    || dashboardData?.roadmap?.roadmap?.[0]
    || { title: 'HTML Basics' };

  const activeMastery = activeTopicNode 
    ? (dashboardData?.mastery?.find((m: any) => m.topicId === activeTopicId)?.score || 0)
    : 0;

  const activeMaterial = courseMaterials[activeTopicId] || courseMaterials['html-basics'];

  const sessionDetails = {
    topic: activeTopicNode.title,
    title: activeMaterial.lessonTitle,
    difficulty: 'Intermediate' as Difficulty,
    estimatedMinutes: 20,
    mastery: activeMastery,
    xp: 100,
    aiExplanation: dashboardData?.recommendations?.reviewTopics?.includes(activeTopicId)
      ? 'The AI Analyzer identifies previous gaps in this domain. Take time reviewing syntax logic and layout patterns.'
      : 'You are on track to master this topic! Follow the material below to solidify your mental model.',
    objectives: activeMaterial.objectives,
    keyConcepts: activeMaterial.keyConcepts,
    codeSnippet: activeMaterial.codeSnippet,
    lessonContent: activeMaterial.lessonContent,
  };

  const markComplete = () => {
    if (completed) return;
    setCompleted(true);
    setRunning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <PageLayout title="Focused Session" description="Immersive topic practice and timer checks.">
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6 border-rose-200 bg-rose-50/20">
            <h2 className="text-lg font-semibold text-danger-600">Failed to load Focused Session</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
            <button onClick={loadDashboard} className="btn-primary mx-auto">
              Retry Load
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const hasRoadmap = dashboardData?.roadmap && dashboardData?.roadmap.goal && dashboardData?.roadmap.roadmap.length > 0;

  if (!hasRoadmap) {
    return (
      <PageLayout title="Focused Session" description="Immersive topic practice and timer checks.">
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">No Learning Path Active</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Create a learning goal on the Roadmap page first to begin focused study sessions.
            </p>
            <button onClick={() => navigate('/roadmap')} className="btn-primary mx-auto">
              Go to Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Focused Session"
      description="A targeted study session recommended by your AI tutor."
      actions={
        <button
          onClick={() => navigate('/roadmap')}
          className="btn-ghost"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmap
        </button>
      }
    >
      <div className="space-y-6">
        {/* Header stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <HeaderStat
            icon={BookOpen}
            label="Current Topic"
            value={sessionDetails.topic}
            bg="bg-accent-50"
          />
          <HeaderStat
            icon={Target}
            label="Difficulty"
            value={sessionDetails.difficulty}
            accent="text-warning-600"
            bg="bg-warning-50"
          />
          <HeaderStat
            icon={Clock}
            label="Elapsed Time"
            value={formatTime(seconds)}
            accent="text-success-600"
            bg="bg-success-50"
          />
          <HeaderStat
            icon={Zap}
            label="Current Mastery"
            value={`${sessionDetails.mastery}%`}
            accent="text-accent-600"
            bg="bg-accent-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{sessionDetails.topic}</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900 tracking-tight">
                    {sessionDetails.title}
                  </h2>
                </div>
                <span className={`badge ${difficultyStyles[sessionDetails.difficulty]}`}>
                  {sessionDetails.difficulty}
                </span>
              </div>

              {/* AI Explanation */}
              <div className="mt-5 bg-accent-50 border border-accent-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    AI Tutor Notes
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {sessionDetails.aiExplanation}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-accent-600" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Learning Objectives
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {sessionDetails.objectives.map((obj, i) => (
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
                <div className="bg-slate-50 border border-base-600 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <Clock className="w-5 h-5 text-accent-600" />
                  <p className="mt-1.5 text-2xl font-semibold text-slate-900">
                    {sessionDetails.estimatedMinutes}
                  </p>
                  <p className="text-[11px] text-slate-500">estimated minutes</p>
                </div>
              </div>
            </div>

            {/* Rich Lesson Content */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Lesson Content
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Overview & Concepts
                  </h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {sessionDetails.lessonContent}
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-3">
                    Interactive Code Sample
                  </h4>
                  <CodeBlock lines={sessionDetails.codeSnippet} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: concepts + panel */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Key Concepts
              </h3>
              <ul className="space-y-3">
                {sessionDetails.keyConcepts.map((concept, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                    <span className="text-accent-500 font-bold">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6 text-center">
              <Timer className="w-8 h-8 text-accent-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Focused Timer</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">{formatTime(seconds)}</p>
              
              {!completed ? (
                <button
                  onClick={markComplete}
                  className="btn-primary w-full mt-4 justify-center"
                >
                  Mark Session Complete
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-3 mt-4">
                  <p className="text-xs text-success-600 font-semibold">
                    ✓ Focus session complete! Run checkpoint.
                  </p>
                  <button
                    onClick={() => navigate('/quiz', { state: { topicId: activeTopicId } })}
                    className="btn-primary w-full justify-center"
                  >
                    Start Checkpoint Quiz
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
