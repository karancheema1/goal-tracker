import { getDatabase } from './connection';
import { GoalEvent, CreateEventInput } from '../types';
import { generateUUID } from '../utils';

export async function getEventsByGoalId(goalId: string): Promise<GoalEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    goal_id: string;
    value: number;
    note: string | null;
    created_at: string;
  }>('SELECT * FROM events WHERE goal_id = ? ORDER BY created_at DESC', [goalId]);

  return rows.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    value: row.value,
    note: row.note || undefined,
    createdAt: row.created_at,
  }));
}

export async function getTotalValueForGoal(goalId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(value) as total FROM events WHERE goal_id = ?',
    [goalId]
  );
  return result?.total || 0;
}

export async function createEvent(input: CreateEventInput): Promise<GoalEvent> {
  const db = await getDatabase();
  const id = generateUUID();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO events (id, goal_id, value, note, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, input.goalId, input.value, input.note || null, createdAt]
  );

  return {
    id,
    goalId: input.goalId,
    value: input.value,
    note: input.note,
    createdAt,
  };
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM events WHERE id = ?', [id]);
}

export async function deleteEventsByGoalId(goalId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM events WHERE goal_id = ?', [goalId]);
}
