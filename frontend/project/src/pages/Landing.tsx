import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Check } from 'lucide-react';

const features = [
  'Adaptive roadmap tuned to your pace',
  'Quizzes that target your weak areas',
  'Mastery tracking across every topic',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 h-14 border-b border-base-600">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Ascend
          </span>
        </div>
        <Link
          to="/login"
          className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-700 bg-accent-50 border border-accent-200 px-3 py-1 rounded-full">
          Adaptive learning, built for mastery
        </span>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.1]">
          Learn smarter, rise faster.
        </h1>
        <p className="mt-4 text-base md:text-lg text-slate-500 max-w-xl leading-relaxed">
          A personalized learning platform that maps your path, probes your
          understanding, and keeps you climbing — one focused step at a time.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg border border-base-600 hover:bg-slate-50 transition-colors"
          >
            Try a quiz
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left">
          {features.map((f) => (
            <div
              key={f}
              className="flex items-start gap-2 text-[13px] text-slate-600 bg-slate-50 border border-base-600 rounded-lg px-3 py-3"
            >
              <Check className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-[12px] text-slate-400 border-t border-base-600">
        © {new Date().getFullYear()} Ascend. All rights reserved.
      </footer>
    </div>
  );
}
