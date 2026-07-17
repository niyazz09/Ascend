export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'in-progress' | 'completed';
  order: number;
  topicId: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  progress: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topicId: string;
  questions: QuizQuestion[];
}

export interface AnalysisSummary {
  id: string;
  topicId: string;
  topicName: string;
  score: number;
  mastery: number;
  weakAreas: string[];
  strongAreas: string[];
  lastAttempt: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  delta: string;
}
