export interface GoalEvent {
  id: string;
  goalId: string;
  value: number; // count added or seconds added
  note?: string;
  createdAt: string; // ISO date string
}

export interface CreateEventInput {
  goalId: string;
  value: number;
  note?: string;
}
