// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces for the Study Planner Domain
// ─────────────────────────────────────────────────────────────────────────────

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface StudyPlanRequest {
  subject: string;
  timeframeDays: number;
  currentLevel: DifficultyLevel;
}

export interface DailyTask {
  taskId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  resourceType: 'reading' | 'video' | 'practice' | 'project' | 'review';
  priority: 'high' | 'medium' | 'low';
}

export interface DailyPlan {
  day: number;
  date: string;
  theme: string;
  tasks: DailyTask[];
  dailyGoal: string;
  totalEstimatedMinutes: number;
}

export interface StudyPlan {
  subject: string;
  timeframeDays: number;
  currentLevel: DifficultyLevel;
  overallGoal: string;
  weeklyMilestones: string[];
  dailyPlans: DailyPlan[];
  tips: string[];
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
