import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  BookOpen,
  Video,
  Code,
  Zap,
  Book,
  Users,
  ExternalLink,
  Clock,
  Award,
  Bookmark,
  Compass,
  Filter
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Programming',
  'AI',
  'Machine Learning',
  'Data Science',
  'Cloud',
  'Cybersecurity',
  'Business',
  'Marketing',
  'Design',
  'Web Development',
  'Mobile Development',
  'DevOps'
];

function getResourceIcon(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('video') || t.includes('youtube')) return <Video className="w-5 h-5 text-accent-600" />;
  if (t.includes('code') || t.includes('github')) return <Code className="w-5 h-5 text-slate-700" />;
  if (t.includes('practice') || t.includes('playground') || t.includes('lab')) return <Zap className="w-5 h-5 text-amber-500" />;
  if (t.includes('book')) return <Book className="w-5 h-5 text-emerald-500" />;
  if (t.includes('community') || t.includes('forum')) return <Users className="w-5 h-5 text-sky-500" />;
  return <BookOpen className="w-5 h-5 text-accent-600" />;
}

export default function Resources() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';

  const { fetchWithAuth } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialTopic);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'generated' | 'fallback' | 'initial'>('initial');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const fetchResources = async (topicToSearch: string, category: string) => {
    const term = topicToSearch.trim() || 'Frontend Developer';
    setLoading(true);
    try {
      const res = await fetchWithAuth('/resources/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: term, category: category === 'All' ? 'Programming' : category })
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
        setSource(data.source || 'generated');
      } else {
        throw new Error('Failed to fetch resources');
      }
    } catch (err) {
      console.error('Resource fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(initialTopic || 'Frontend Developer', activeCategory);
  }, [initialTopic]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(searchQuery, activeCategory);
  };

  const toggleBookmark = (title: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 border border-accent-400/30 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-accent-300" />
              AI Resource Recommendation Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Curated Masterclasses & Practice Playground
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Discover official documentation, interactive labs, video playlists, open-source repos, and research papers tailored to your active learning goals.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search any skill, tool, or roadmap topic (e.g. React Flexbox, PyTorch, Kubernetes)..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-medium rounded-2xl shadow-lg shadow-accent-500/25 transition-all flex items-center justify-center gap-2 text-sm shrink-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find Resources
                </>
              )}
            </button>
          </form>
        </div>

        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter by Domain
            </span>
            <span>{CATEGORIES.length} Categories</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  fetchResources(searchQuery || 'Frontend Developer', cat);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-accent-600 text-white shadow-md shadow-accent-500/20'
                    : 'bg-base-800 text-slate-600 hover:bg-base-700 border border-base-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        {source === 'fallback' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
            <Compass className="w-4 h-4 shrink-0 text-amber-600" />
            <span>AI service offline — serving curated smart fallback search links for <strong>{searchQuery || 'Frontend Developer'}</strong>.</span>
          </div>
        )}

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse p-6 space-y-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {resources.map((item, idx) => {
                const isSaved = bookmarked.has(item.title);
                return (
                  <motion.div
                    key={item.title + idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative flex flex-col justify-between card rounded-3xl hover:border-accent-300 shadow-sm hover:shadow-xl transition-all p-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-accent-50 border border-accent-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {getResourceIcon(item.type)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold tracking-wide">
                            {item.type || 'Resource'}
                          </span>
                          <button
                            onClick={() => toggleBookmark(item.title)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-accent-600 transition-colors"
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-accent-600 text-accent-600' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-accent-600 transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Award className="w-3 h-3 text-accent-500" />
                          {item.difficulty || 'All Levels'}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.estimatedTime || '2 hours'}
                        </span>
                      </div>

                      {item.tags && Array.isArray(item.tags) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.tags.slice(0, 3).map((t: string) => (
                            <span key={t} className="px-2 py-0.5 rounded-md bg-accent-50 text-accent-700 text-[10px] font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-accent-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                      >
                        Visit Resource
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
