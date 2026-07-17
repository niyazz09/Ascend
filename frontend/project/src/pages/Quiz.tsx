import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Flame,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

type Phase = 'intro' | 'question' | 'feedback' | 'summary';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTION_TIME = 45;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="card p-5"
    >
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
    </motion.div>
  );
}

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchWithAuth } = useAuth();

  const [phase, setPhase] = useState<Phase>('intro');
  const [topicId, setTopicId] = useState('html-basics');
  const [topicTitle, setTopicTitle] = useState('HTML Basics');
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high' | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [loading, setLoading] = useState(true);

  // Extract topicId from router state if redirected
  useEffect(() => {
    const passedTopicId = location.state?.topicId;
    if (passedTopicId) {
      setTopicId(passedTopicId);
      // Derive pretty title
      const title = passedTopicId.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      setTopicTitle(title);
    }
  }, [location.state]);

  // Load quiz from backend
  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          difficulty: 60,
          questionCount: 3
        })
      });

      if (res.ok) {
        const json = await res.ok ? await res.json() : null;
        if (json && json.questions) {
          setQuestions(json.questions);
        }
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [topicId]);

  const total = questions.length;
  const current = questions[currentIndex];

  const handleTimeout = useCallback(() => {
    setSelectedIndex(null);
    setConfidence(null);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: current?.id || 'timeout',
        selectedIndex: null,
        correct: false,
        confidence: null,
        timeTaken: QUESTION_TIME,
      },
    ]);
    setPhase('feedback');
  }, [current]);

  useEffect(() => {
    if (phase !== 'question') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, handleTimeout]);

  const startQuiz = () => {
    setPhase('question');
    setCurrentIndex(0);
    setSelectedIndex(null);
    setConfidence(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  const submitAnswer = async () => {
    if (selectedIndex === null || !current) return;
    const correct = selectedIndex === current.correctIndex;
    const timeTaken = QUESTION_TIME - timeLeft;

    // Submit individual question result to backend for mastery Elo update
    try {
      await fetchWithAuth('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          questionResult: {
            difficulty: 70,
            correct,
            questionType: 'mcq',
            timestamp: Date.now()
          }
        })
      });
    } catch (err) {
      console.error('Failed to submit question result:', err);
    }

    setAnswers((prev) => [
      ...prev,
      {
        questionId: current.id,
        selectedIndex,
        correct,
        confidence,
        timeTaken,
      },
    ]);
    setPhase('feedback');
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= total) {
      setPhase('summary');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setConfidence(null);
    setTimeLeft(QUESTION_TIME);
    setPhase('question');
  };

  const restart = () => {
    setPhase('intro');
    setCurrentIndex(0);
    setSelectedIndex(null);
    setConfidence(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  const score = answers.filter((a) => a.correct).length;
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const xpEarned = score * 30; // base points

  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 20 ? 'text-success-600' : timeLeft > 10 ? 'text-warning-600' : 'text-danger-600';
  const timerBar = timeLeft > 20 ? 'bg-success-500' : timeLeft > 10 ? 'bg-warning-500' : 'bg-danger-500';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageLayout
      title="Adaptive Checkpoint"
      description="Probes your active understanding with immediate Elo-mastery engine feedback."
    >
      <AnimatePresence mode="wait">
        {/* INTRO */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="max-w-3xl mx-auto"
          >
            <div className="card p-8 md:p-10">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center">
                  <HelpCircle className="w-4.5 h-4.5 text-accent-600" />
                </div>
                <span className="text-xs font-medium text-accent-700 bg-accent-50 border border-accent-200 px-3 py-1 rounded-full">
                  AI-driven Quiz
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {topicTitle} — Checkpoint
              </h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-xl">
                This quiz dynamically verifies your retention for {topicTitle}. 
                Correct responses will lift your mastery rating while wrong answers adjust recommendations.
              </p>

              <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: BookOpen, label: 'Questions', value: `${total}` },
                  { icon: Clock, label: 'Per question', value: `${QUESTION_TIME}s` },
                  { icon: Zap, label: 'Target XP', value: `${total * 30}` },
                  { icon: Target, label: 'Domain', value: topicId },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-50 border border-base-600 rounded-lg p-3"
                  >
                    <s.icon className="w-4 h-4 text-accent-600" />
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <button onClick={startQuiz} className="mt-7 btn-primary">
                Start Quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* QUESTION + FEEDBACK */}
        {(phase === 'question' || phase === 'feedback') && current && (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-slate-500">
                  Question{' '}
                  <span className="text-slate-900 font-medium">{currentIndex + 1}</span> / {total}
                </span>
                <div className={`flex items-center gap-1.5 font-medium ${timerColor}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${timerBar}`}
                  style={{ width: `${timerPct}%`, transition: 'width 1s linear' }}
                />
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight leading-snug">
                {current.question}
              </h3>

              <div className="mt-6 space-y-2.5">
                {current.options.map((option, idx) => {
                  const isSelected = selectedIndex === idx;
                  const showCorrect = phase === 'feedback' && idx === current.correctIndex;
                  const showIncorrect = phase === 'feedback' && isSelected && idx !== current.correctIndex;

                  return (
                    <button
                      key={idx}
                      disabled={phase === 'feedback'}
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border text-left text-sm transition-all ${
                        showCorrect
                          ? 'border-success-300 bg-success-50/50 text-success-900 font-medium'
                          : showIncorrect
                            ? 'border-rose-300 bg-rose-50/50 text-danger-900'
                            : isSelected
                              ? 'border-accent-500 bg-accent-50/30 text-accent-900 font-medium'
                              : 'border-base-600 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {phase === 'question' && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={submitAnswer}
                    disabled={selectedIndex === null}
                    className="btn-primary"
                  >
                    Submit Answer
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {phase === 'feedback' && (
                <div className="mt-8 border-t border-base-600 pt-6">
                  <div
                    className={`p-4 rounded-lg border ${
                      selectedIndex === current.correctIndex
                        ? 'bg-success-50 border-success-200 text-success-800'
                        : 'bg-rose-50 border-rose-200 text-danger-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 font-semibold text-sm">
                      {selectedIndex === current.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Correct Response
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Incorrect Response
                        </>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {current.explanation}
                    </p>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button onClick={nextQuestion} className="btn-primary">
                      {currentIndex + 1 >= total ? 'Finish Quiz' : 'Next Question'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SUMMARY */}
        {phase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="card p-8 md:p-10 mb-6">
              <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trophy className="w-8 h-8 text-accent-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Quiz Complete!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Nice work! Your mastery score and progress roadmap have been updated.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
                <StatTile icon={Trophy} label="Score" value={`${score}/${total}`} delay={0.2} />
                <StatTile icon={Target} label="Accuracy" value={`${accuracy}%`} delay={0.25} />
                <StatTile icon={Zap} label="XP Earned" value={`+${xpEarned}`} delay={0.3} />
                <StatTile icon={Flame} label="Topic" value={topicId.toUpperCase()} delay={0.35} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button onClick={restart} className="btn-primary">
                <RefreshCw className="w-4 h-4" />
                Retake Quiz
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
