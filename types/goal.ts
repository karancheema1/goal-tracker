export type GoalType = 'count' | 'time';

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetValue: number; // count or seconds
  endDate: string; // ISO date string
  createdAt: string; // ISO date string
  color: string; // hex color for UI
}

export interface GoalWithProgress extends Goal {
  currentValue: number; // computed from events
  progressPercentage: number;
  daysRemaining: number;
  isCompleted: boolean;
  isOverdue: boolean;
}

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetValue: number;
  endDate: string;
  color?: string;
}
