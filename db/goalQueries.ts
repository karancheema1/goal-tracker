import { getDatabase } from './connection';
import { Goal, CreateGoalInput } from '../types';
import { generateUUID } from '../utils';

const GOAL_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#22C55E', // Green
];

function getRandomColor(): string {
  return GOAL_COLORS[Math.floor(Math.random() * GOAL_COLORS.length)];
}

export async function getAllGoals(): Promise<Goal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    type: string;
    target_value: number;
    end_date: string;
    created_at: string;
    color: string;
  }>('SELECT * FROM goals ORDER BY created_at DESC');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as 'count' | 'time',
    targetValue: row.target_value,
    endDate: row.end_date,
    createdAt: row.created_at,
    color: row.color,
  }));
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    type: string;
    target_value: number;
    end_date: string;
    created_at: string;
    color: string;
  }>('SELECT * FROM goals WHERE id = ?', [id]);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    type: row.type as 'count' | 'time',
    targetValue: row.target_value,
    endDate: row.end_date,
    createdAt: row.created_at,
    color: row.color,
  };
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const db = await getDatabase();
  const id = generateUUID();
  const createdAt = new Date().toISOString();
  const color = input.color || getRandomColor();

  await db.runAsync(
    `INSERT INTO goals (id, name, type, target_value, end_date, created_at, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, input.type, input.targetValue, input.endDate, createdAt, color]
  );

  return {
    id,
    name: input.name,
    type: input.type,
    targetValue: input.targetValue,
    endDate: input.endDate,
    createdAt,
    color,
  };
}

export async function updateGoal(
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.targetValue !== undefined) {
    fields.push('target_value = ?');
    values.push(updates.targetValue);
  }
  if (updates.endDate !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.endDate);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}
