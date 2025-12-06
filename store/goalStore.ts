import { create } from 'zustand';
import {
  Goal,
  GoalWithProgress,
  GoalEvent,
  CreateGoalInput,
  CreateEventInput,
} from '../types';
import {
  initializeDatabase,
  getAllGoals,
  getGoalById,
  createGoal as dbCreateGoal,
  updateGoal as dbUpdateGoal,
  deleteGoal as dbDeleteGoal,
  getEventsByGoalId,
  getTotalValueForGoal,
  createEvent as dbCreateEvent,
  deleteEvent as dbDeleteEvent,
} from '../db';
import { getDaysRemaining, isOverdue } from '../utils';

interface GoalStore {
  // State
  goals: GoalWithProgress[];
  currentGoal: GoalWithProgress | null;
  currentGoalEvents: GoalEvent[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loadGoals: () => Promise<void>;
  loadGoal: (id: string) => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addEvent: (input: CreateEventInput) => Promise<GoalEvent>;
  deleteEvent: (id: string, goalId: string) => Promise<void>;
  clearError: () => void;
}

async function computeGoalProgress(goal: Goal): Promise<GoalWithProgress> {
  const currentValue = await getTotalValueForGoal(goal.id);
  const progressPercentage = Math.min((currentValue / goal.targetValue) * 100, 100);
  const daysRemaining = getDaysRemaining(goal.endDate);

  return {
    ...goal,
    currentValue,
    progressPercentage,
    daysRemaining,
    isCompleted: currentValue >= goal.targetValue,
    isOverdue: isOverdue(goal.endDate) && currentValue < goal.targetValue,
  };
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  currentGoal: null,
  currentGoalEvents: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });
    try {
      await initializeDatabase();
      await get().loadGoals();
      set({ isInitialized: true });
    } catch (error) {
      set({ error: 'Failed to initialize database' });
      console.error('Initialize error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawGoals = await getAllGoals();
      const goalsWithProgress = await Promise.all(rawGoals.map(computeGoalProgress));
      set({ goals: goalsWithProgress });
    } catch (error) {
      set({ error: 'Failed to load goals' });
      console.error('Load goals error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const goal = await getGoalById(id);
      if (!goal) {
        set({ currentGoal: null, currentGoalEvents: [] });
        return;
      }

      const goalWithProgress = await computeGoalProgress(goal);
      const events = await getEventsByGoalId(id);
      set({ currentGoal: goalWithProgress, currentGoalEvents: events });
    } catch (error) {
      set({ error: 'Failed to load goal' });
      console.error('Load goal error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createGoal: async (input: CreateGoalInput) => {
    set({ error: null });
    try {
      const goal = await dbCreateGoal(input);
      await get().loadGoals();
      return goal;
    } catch (error) {
      set({ error: 'Failed to create goal' });
      console.error('Create goal error:', error);
      throw error;
    }
  },

  updateGoal: async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    set({ error: null });
    try {
      await dbUpdateGoal(id, updates);
      await get().loadGoals();
      if (get().currentGoal?.id === id) {
        await get().loadGoal(id);
      }
    } catch (error) {
      set({ error: 'Failed to update goal' });
      console.error('Update goal error:', error);
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    set({ error: null });
    try {
      await dbDeleteGoal(id);
      await get().loadGoals();
      if (get().currentGoal?.id === id) {
        set({ currentGoal: null, currentGoalEvents: [] });
      }
    } catch (error) {
      set({ error: 'Failed to delete goal' });
      console.error('Delete goal error:', error);
      throw error;
    }
  },

  addEvent: async (input: CreateEventInput) => {
    set({ error: null });
    try {
      const event = await dbCreateEvent(input);
      await get().loadGoals();
      if (get().currentGoal?.id === input.goalId) {
        await get().loadGoal(input.goalId);
      }
      return event;
    } catch (error) {
      set({ error: 'Failed to add event' });
      console.error('Add event error:', error);
      throw error;
    }
  },

  deleteEvent: async (id: string, goalId: string) => {
    set({ error: null });
    try {
      await dbDeleteEvent(id);
      await get().loadGoals();
      if (get().currentGoal?.id === goalId) {
        await get().loadGoal(goalId);
      }
    } catch (error) {
      set({ error: 'Failed to delete event' });
      console.error('Delete event error:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
