import type {
  User,
  Topic,
  Quiz,
  AnalysisSummary,
  DashboardStat,
} from '../types';

export const mockUser: User = {
  id: 'u_001',
  name: 'Alex Carter',
  email: 'alex@ascend.app',
  avatarUrl: '',
  level: 7,
  xp: 3240,
  streak: 12,
};

export const mockTopics: Topic[] = [
  { id: 't_01', name: 'Algebra Foundations', slug: 'algebra-foundations', progress: 80 },
  { id: 't_02', name: 'Linear Equations', slug: 'linear-equations', progress: 45 },
  { id: 't_03', name: 'Geometry', slug: 'geometry', progress: 20 },
  { id: 't_04', name: 'Calculus Intro', slug: 'calculus-intro', progress: 0 },
];

export interface RoadmapNode {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedMinutes: number;
  mastery: number;
  status: 'completed' | 'current' | 'locked';
  order: number;
  description: string;
  objectives: string[];
  prerequisites: string[];
  aiRecommendation: string;
  xp: number;
}

export const mockRoadmapNodes: RoadmapNode[] = [
  {
    id: 'rn_01',
    title: 'Variables & Expressions',
    topic: 'Algebra Foundations',
    difficulty: 'Beginner',
    estimatedMinutes: 45,
    mastery: 100,
    status: 'completed',
    order: 1,
    description:
      'Understand the building blocks of algebra — variables, constants, and how expressions are formed and simplified.',
    objectives: [
      'Identify variables, constants, and coefficients',
      'Translate word phrases into algebraic expressions',
      'Simplify expressions by combining like terms',
    ],
    prerequisites: ['Basic arithmetic', 'Order of operations'],
    aiRecommendation:
      'You aced this module. Use it as a foundation — revisit combining like terms if multi-step equations feel shaky.',
    xp: 150,
  },
  {
    id: 'rn_02',
    title: 'Solving Linear Equations',
    topic: 'Linear Equations',
    difficulty: 'Beginner',
    estimatedMinutes: 60,
    mastery: 45,
    status: 'current',
    order: 2,
    description:
      'Learn techniques to isolate variables and solve one-step, two-step, and multi-step linear equations.',
    objectives: [
      'Solve one-step and two-step equations',
      'Solve equations with variables on both sides',
      'Apply linear equations to real-world word problems',
    ],
    prerequisites: ['Variables & Expressions'],
    aiRecommendation:
      'Focus on multi-step word problems — your quiz scores show a gap here. A 20-min targeted session can lift mastery by ~8%.',
    xp: 200,
  },
  {
    id: 'rn_03',
    title: 'Graphing Linear Functions',
    topic: 'Linear Equations',
    difficulty: 'Intermediate',
    estimatedMinutes: 75,
    mastery: 0,
    status: 'locked',
    order: 3,
    description:
      'Visualize linear equations on the coordinate plane, understand slope, and master slope-intercept form.',
    objectives: [
      'Plot points on the coordinate plane',
      'Calculate and interpret slope',
      'Graph lines using slope-intercept form',
    ],
    prerequisites: ['Solving Linear Equations'],
    aiRecommendation:
      'This module builds directly on your current topic. Expect a smooth transition once you complete Solving Linear Equations.',
    xp: 250,
  },
  {
    id: 'rn_04',
    title: 'Shapes & Angles',
    topic: 'Geometry',
    difficulty: 'Intermediate',
    estimatedMinutes: 90,
    mastery: 0,
    status: 'locked',
    order: 4,
    description:
      'Explore properties of 2D and 3D shapes, angle relationships, and the foundations of geometric reasoning.',
    objectives: [
      'Classify triangles and quadrilaterals',
      'Apply angle relationships to find unknowns',
      'Calculate perimeter and area of common shapes',
    ],
    prerequisites: ['Graphing Linear Functions', 'Solving Linear Equations'],
    aiRecommendation:
      'Geometry rewards visual thinking. After completing the linear functions module, this will reinforce coordinate skills.',
    xp: 300,
  },
  {
    id: 'rn_05',
    title: 'Limits & Continuity',
    topic: 'Calculus Intro',
    difficulty: 'Advanced',
    estimatedMinutes: 120,
    mastery: 0,
    status: 'locked',
    order: 5,
    description:
      'Step into calculus with the concept of limits — the foundation for derivatives and integrals.',
    objectives: [
      'Evaluate limits graphically and algebraically',
      'Understand one-sided limits and continuity',
      'Apply the squeeze theorem',
    ],
    prerequisites: ['Shapes & Angles', 'Graphing Linear Functions'],
    aiRecommendation:
      'This is an advanced milestone. Ensure strong algebra fluency before starting — limits reward precise symbolic manipulation.',
    xp: 500,
  },
  {
    id: 'rn_06',
    title: 'Derivatives & Applications',
    topic: 'Calculus Intro',
    difficulty: 'Expert',
    estimatedMinutes: 150,
    mastery: 0,
    status: 'locked',
    order: 6,
    description:
      'Master the derivative — the heart of differential calculus — and apply it to optimization and motion.',
    objectives: [
      'Apply the power, product, and quotient rules',
      'Find derivatives of composite functions (chain rule)',
      'Solve optimization and related-rates problems',
    ],
    prerequisites: ['Limits & Continuity'],
    aiRecommendation:
      'The capstone module. Consistent daily practice here will compound — aim for 20 min/day rather than long weekend sessions.',
    xp: 700,
  },
];

export const mockRoadmapStats = {
  completionPct: 24,
  xpEarned: 350,
  xpTotal: 2100,
  totalMinutes: 540,
};

export const mockQuiz: Quiz = {
  id: 'q_01',
  title: 'Linear Equations — Checkpoint',
  topicId: 't_02',
  questions: [
    {
      id: 'qg_01',
      question: 'Solve for x: 2x + 3 = 11',
      options: ['x = 3', 'x = 4', 'x = 5', 'x = 7'],
      correctIndex: 1,
      explanation: 'Subtract 3 from both sides, then divide by 2.',
    },
    {
      id: 'qg_02',
      question: 'What is the slope of y = 2x + 5?',
      options: ['2', '5', '7', '10'],
      correctIndex: 0,
      explanation: 'In slope-intercept form y = mx + b, m is the slope.',
    },
  ],
};

export const mockAnalysis: AnalysisSummary[] = [
  {
    id: 'a_01',
    topicId: 't_01',
    topicName: 'Algebra Foundations',
    score: 88,
    mastery: 80,
    weakAreas: ['Fraction operations'],
    strongAreas: ['Variable isolation', 'Simplifying expressions'],
    lastAttempt: '2026-07-15T10:30:00Z',
  },
  {
    id: 'a_02',
    topicId: 't_02',
    topicName: 'Linear Equations',
    score: 64,
    mastery: 45,
    weakAreas: ['Multi-step equations', 'Word problems'],
    strongAreas: ['Slope identification'],
    lastAttempt: '2026-07-16T14:00:00Z',
  },
];

export const mockDashboardStats: DashboardStat[] = [
  { id: 's_01', label: 'Topics Mastered', value: '3', trend: 'up', delta: '+1' },
  { id: 's_02', label: 'Quizzes Taken', value: '24', trend: 'up', delta: '+5' },
  { id: 's_03', label: 'Avg. Score', value: '76%', trend: 'flat', delta: '0' },
  { id: 's_04', label: 'Day Streak', value: '12', trend: 'up', delta: '+2' },
];

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  trend: 'up' | 'down' | 'flat';
  delta: string;
  icon: 'mastery' | 'xp' | 'streak' | 'lessons';
  accent: string;
}

export const mockDashboardMetrics: DashboardMetric[] = [
  {
    id: 'm_01',
    label: 'Mastery',
    value: '76%',
    rawValue: 76,
    trend: 'up',
    delta: '+4%',
    icon: 'mastery',
    accent: 'from-accent-500/20 to-accent-500/5',
  },
  {
    id: 'm_02',
    label: 'XP Earned',
    value: '3,240',
    rawValue: 3240,
    trend: 'up',
    delta: '+320',
    icon: 'xp',
    accent: 'from-success-500/20 to-success-500/5',
  },
  {
    id: 'm_03',
    label: 'Learning Streak',
    value: '12 days',
    rawValue: 12,
    trend: 'up',
    delta: '+2',
    icon: 'streak',
    accent: 'from-warning-500/20 to-warning-500/5',
  },
  {
    id: 'm_04',
    label: 'Lessons Completed',
    value: '48',
    rawValue: 48,
    trend: 'up',
    delta: '+6',
    icon: 'lessons',
    accent: 'from-accent-400/20 to-accent-400/5',
  },
];

export interface WeeklyProgressPoint {
  day: string;
  minutes: number;
  goal: number;
}

export const mockWeeklyProgress: WeeklyProgressPoint[] = [
  { day: 'Mon', minutes: 45, goal: 60 },
  { day: 'Tue', minutes: 75, goal: 60 },
  { day: 'Wed', minutes: 30, goal: 60 },
  { day: 'Thu', minutes: 90, goal: 60 },
  { day: 'Fri', minutes: 60, goal: 60 },
  { day: 'Sat', minutes: 105, goal: 60 },
  { day: 'Sun', minutes: 50, goal: 60 },
];

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'lesson' | 'milestone' | 'streak';
  title: string;
  detail: string;
  timestamp: string;
}

export const mockRecentActivity: ActivityItem[] = [
  {
    id: 'act_01',
    type: 'quiz',
    title: 'Completed Linear Equations Quiz',
    detail: 'Scored 8/10 · +120 XP',
    timestamp: '2h ago',
  },
  {
    id: 'act_02',
    type: 'lesson',
    title: 'Finished "Slope-Intercept Form"',
    detail: 'Linear Equations · 15 min',
    timestamp: '5h ago',
  },
  {
    id: 'act_03',
    type: 'milestone',
    title: 'Reached Level 7',
    detail: 'Unlocked new achievement badge',
    timestamp: 'Yesterday',
  },
  {
    id: 'act_04',
    type: 'streak',
    title: '12-day learning streak',
    detail: 'Keep it going tomorrow!',
    timestamp: 'Yesterday',
  },
];

export interface UpcomingTask {
  id: string;
  title: string;
  topic: string;
  due: string;
  type: 'quiz' | 'lesson' | 'review';
}

export const mockUpcomingTasks: UpcomingTask[] = [
  {
    id: 'ut_01',
    title: 'Multi-step Equations',
    topic: 'Linear Equations',
    due: 'Today',
    type: 'lesson',
  },
  {
    id: 'ut_02',
    title: 'Geometry Checkpoint',
    topic: 'Geometry',
    due: 'Tomorrow',
    type: 'quiz',
  },
  {
    id: 'ut_03',
    title: 'Review: Fraction Operations',
    topic: 'Algebra Foundations',
    due: 'Wed',
    type: 'review',
  },
];

export const mockAiRecommendation = {
  title: 'Focus on Multi-step Equations',
  reason:
    'Your recent quiz scores show a gap in word problems involving multi-step equations. A short targeted session can lift your mastery by an estimated 8%.',
  action: 'Start focused session',
  estimatedGain: '+8% mastery',
  topic: 'Linear Equations',
};

export const mockContinueLearning = {
  topicId: 't_02',
  topicName: 'Linear Equations',
  lessonTitle: 'Solving Linear Equations',
  progress: 45,
  nextLesson: 'Multi-step Equations',
  estimatedMinutes: 20,
};
