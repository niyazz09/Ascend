import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Target,
  Sparkles,
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  Zap,
  Award,
  Users,
  Code2,
  Globe2,
  Check,
  Github,
  Mail,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Cpu,
  X,
  Info
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';

export default function AboutAscend() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showNotice, setShowNotice] = useState<string | null>(null);

  const coreFeatures = [
    {
      icon: Compass,
      title: "AI Learning Roadmaps",
      description: "Generates structured, prerequisite-validated Directed Acyclic Graph (DAG) roadmaps for any learning goal."
    },
    {
      icon: BrainCircuit,
      title: "Context-Aware AI Mentor",
      description: "24/7 intelligent coach aware of your study streak, completed topics, quiz performance, and weak areas."
    },
    {
      icon: BookOpen,
      title: "Smart Resource Hub",
      description: "Curates documentation, video playlists, open-source repos, books, interactive playgrounds, and communities."
    },
    {
      icon: Zap,
      title: "Personalized Quizzes",
      description: "Dynamic exam engine evaluating your grasp with multiple choice and true/false questions tailored to your level."
    },
    {
      icon: Award,
      title: "XP & Gamified Missions",
      description: "Earn experience points, maintain daily streaks, complete missions, and unlock achievement badges."
    },
    {
      icon: Code2,
      title: "AI Project Generator",
      description: "Generates hands-on portfolio mini-project blueprints complete with folder structures, features, and code steps."
    }
  ];

  const techStack = [
    { name: "React 18", category: "Frontend", desc: "Component-driven single page application" },
    { name: "TypeScript", category: "Language", desc: "Type-safe robust developer experience" },
    { name: "Tailwind CSS", category: "Styling", desc: "Custom responsive design system" },
    { name: "Express.js", category: "Backend", desc: "High-throughput Node.js API gateway" },
    { name: "Prisma ORM", category: "Database", desc: "Type-safe database mapping & queries" },
    { name: "OpenRouter LLMs", category: "AI Layer", desc: "Multi-model fallback chain for zero-downtime AI" }
  ];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Notice Modal / Toast */}
        {showNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{showNotice}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thank you for your interest in ASCEND Pro & Enterprise tiers! Payment processing will be available in the upcoming production deployment.
              </p>
              <button
                onClick={() => setShowNotice(null)}
                className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-400/30 text-xs font-semibold backdrop-blur-md">
              <Rocket className="w-4 h-4 text-accent-400" />
              Empowering Every Learner Everywhere
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Empowering Every Learner with a <span className="bg-gradient-to-r from-accent-400 to-sky-400 bg-clip-text text-transparent">Personalized AI Companion</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              ASCEND transforms scattered educational resources into an adaptive, structured journey tailored to your specific pace, background, and career goals.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div className="card rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-accent-600 font-bold text-xs uppercase tracking-wider">
            <Target className="w-4 h-4" /> Our Mission
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Democratizing World-Class Personalized Education</h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            We believe high-quality education should adapt to the student, not the other way around. ASCEND combines state-of-the-art OpenRouter artificial intelligence with graph algorithms and mastery evidence tracking to create a world where anyone can master any subject efficiently.
          </p>
        </div>

        {/* Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/30 p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-slate-900">The Problem</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Students today face an overwhelming amount of scattered videos, articles, and courses without clear guidance on what to learn first or how to verify true mastery.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-2">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Scattered, unvetted online resources with no logical sequence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Lack of 24/7 personalized tutoring when getting stuck</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>One-size-fits-all linear curriculums that ignore prior knowledge</span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-900/30 p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
              💡
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Solution</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              ASCEND generates dynamic learning roadmaps, context-aware AI mentoring, interactive quizzes, project ideas, and curated resources for any requested topic.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant curriculum DAGs with prerequisite validation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Context-aware AI tutor tracking your weak areas and study streak</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Gamified XP, daily missions, and verifiable project blueprints</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core Features */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Core Platform Features</h2>
            <p className="text-sm text-slate-600">Everything you need to master any subject from scratch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="card rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-xl transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 border border-accent-100 flex items-center justify-center text-accent-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Model & Plans */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">Flexible Revenue & Plans</h2>
            <p className="text-sm text-slate-600">Free forever for basic study, with affordable upgrades for power learners and organizations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="card rounded-3xl p-8 space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Tier</div>
                <h3 className="text-2xl font-bold text-slate-900">Starter Plan</h3>
                <div className="text-4xl font-extrabold text-slate-900">$0</div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> AI Roadmaps & DAG Builder</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Basic AI Mentor Support</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Community Resource Hub</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Quizzes & Streak Tracking</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/roadmap')}
                className="w-full py-3 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Premium */}
            <div className="bg-slate-900 text-white rounded-3xl border border-accent-500/50 p-8 space-y-6 shadow-2xl relative flex flex-col justify-between transform md:-translate-y-2">
              <div className="space-y-4">
                <div className="text-xs font-bold text-accent-400 uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-bold">ASCEND Pro</h3>
                <div className="text-4xl font-extrabold">$14 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-400" /> Unlimited AI Roadmaps</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-400" /> Advanced Context-Aware AI Mentor</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-400" /> AI Portfolio Project Generator</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-400" /> Resume & Career Guidance</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-400" /> Priority OpenRouter LLM Execution</li>
                </ul>
              </div>
              <button
                onClick={() => setShowNotice('ASCEND Pro Upgrade')}
                className="w-full py-3 rounded-2xl bg-accent-600 hover:bg-accent-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20"
              >
                Upgrade (Coming Soon)
              </button>
            </div>

            {/* Enterprise */}
            <div className="card rounded-3xl p-8 space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional</div>
                <h3 className="text-2xl font-bold text-slate-900">Enterprise</h3>
                <div className="text-4xl font-extrabold text-slate-900">Custom</div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Universities & Schools</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Corporate Upskilling Cohorts</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Admin Analytics Dashboard</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Organization Accounts</li>
                </ul>
              </div>
              <a
                href="mailto:support@ascend.app?subject=ASCEND%20Enterprise%20Inquiry"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Contact Team
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Future Vision */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-4 shadow-xl border border-slate-800">
          <div className="flex items-center gap-2 text-accent-300 text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-4 h-4" /> Future Vision
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">The AI Lifelong Learning Ecosystem</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            Our vision is to become the ultimate AI-powered lifelong learning ecosystem connecting students, educators, and industry leaders through verified mastery, personalized tutoring, and automated portfolio generation.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Production Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map(t => (
              <div key={t.name} className="card rounded-2xl p-4 text-center space-y-1 shadow-sm">
                <div className="text-[10px] font-bold text-accent-600 uppercase tracking-wider">{t.category}</div>
                <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                <p className="text-[10px] text-slate-500 line-clamp-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="card rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">ASCEND Engineering & Product</h2>
              <p className="text-xs text-slate-500">Built for national hackathon excellence.</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 text-xs font-semibold"
              >
                <Github className="w-4 h-4" /> GitHub Project
              </a>
              <a
                href="mailto:support@ascend.app"
                className="p-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white transition-colors flex items-center gap-2 text-xs font-semibold"
              >
                <Mail className="w-4 h-4" /> Contact Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
