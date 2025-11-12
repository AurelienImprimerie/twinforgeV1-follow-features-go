/**
 * Dashboard Types
 * Type definitions for dashboard services and widgets
 */

import type { IconName } from '@/ui/icons/registry';

// ============================================
// TRANSFORMATION SCORE TYPES
// ============================================

export interface ForgeScore {
  score: number; // 0-100
  weight: number; // Pondération dans le score global
  hasData: boolean;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number; // +5, -3, etc.
}

export interface TransformationScore {
  globalScore: number; // 0-100
  level: ScoreLevel;
  levelProgress: number; // 0-100 jusqu'au prochain niveau
  forgeScores: {
    training: ForgeScore;
    nutrition: ForgeScore;
    fasting: ForgeScore;
    body: ForgeScore;
    energy: ForgeScore;
    consistency: ForgeScore;
  };
  timestamp: Date;
  evolution?: {
    daily: number; // Diff vs hier
    weekly: number; // Diff vs il y a 7 jours
    monthly: number; // Diff vs il y a 30 jours
  };
}

export type ScoreLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LevelInfo {
  current: ScoreLevel;
  next: ScoreLevel | null;
  currentThreshold: number;
  nextThreshold: number | null;
  progress: number; // 0-100
  icon: string;
  color: string;
}

export interface ScoreHistory {
  date: Date;
  globalScore: number;
  forgeScores: Record<string, number>;
}

// ============================================
// TIMELINE TYPES
// ============================================

export type EventType =
  | 'training_session'
  | 'training_pr'
  | 'meal_scanned'
  | 'meal_plan_generated'
  | 'fasting_started'
  | 'fasting_completed'
  | 'body_scan'
  | 'morphology_insight'
  | 'activity_synced'
  | 'goal_achieved'
  | 'streak_milestone';

export type ForgeType =
  | 'training'
  | 'nutrition'
  | 'fasting'
  | 'body'
  | 'energy'
  | 'culinary';

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  forgeType: ForgeType;
  eventType: EventType;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  metadata?: Record<string, any>;
}

export interface TimelineFilters {
  forges?: ForgeType[];
  eventTypes?: EventType[];
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================
// TODAY DATA TYPES
// ============================================

export interface TodayStats {
  training: {
    planned: number;
    completed: number;
    nextSession?: {
      discipline: string;
      time?: string;
    };
  };
  nutrition: {
    mealsScanned: number;
    caloriesTotal: number;
    caloriesTarget: number;
    proteinTotal: number;
    proteinTarget: number;
    macrosProgress: {
      protein: number; // 0-100
      carbs: number;
      fat: number;
    };
  };
  fasting: {
    isActive: boolean;
    currentDuration?: number; // minutes
    targetDuration?: number; // minutes
    phase?: string;
    progress?: number; // 0-100
  };
  activity: {
    steps?: number;
    stepsTarget?: number;
    activeMinutes?: number;
    lastSync?: Date;
  };
}

// ============================================
// INSIGHTS TYPES
// ============================================

export interface QuickInsight {
  id: string;
  type: 'pattern' | 'achievement' | 'recommendation' | 'celebration';
  title: string;
  description: string;
  icon: IconName;
  color: string;
  value?: string; // Metric to display
  cta?: {
    label: string;
    action: string;
  };
}

// ============================================
// RECOMMENDATIONS TYPES
// ============================================

export type RecommendationPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface ProactiveRecommendation {
  id: string;
  priority: RecommendationPriority;
  type: 'action' | 'alert' | 'opportunity' | 'celebration';
  forge: ForgeType;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  cta?: {
    label: string;
    route: string;
  };
  dismissible: boolean;
  snoozeMinutes?: number;
  expiresAt?: Date;
}

// ============================================
// GOALS TYPES
// ============================================

export interface ActiveGoal {
  id: string;
  forge: ForgeType;
  type: string; // 'weight_loss', 'strength_gain', etc.
  title: string;
  current: number;
  target: number;
  unit: string;
  progress: number; // 0-100
  startDate: Date;
  targetDate?: Date;
  daysRemaining?: number;
  isOnTrack: boolean;
  trend: 'ahead' | 'on_track' | 'behind';
}

// ============================================
// DASHBOARD LAYOUT TYPES
// ============================================

export interface WidgetConfig {
  id: string;
  component: string;
  title: string;
  span?: number; // Grid span (1-3)
  order?: number;
  visible: boolean;
  minHeight?: number;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  mode: 'default' | 'compact' | 'detailed';
}
