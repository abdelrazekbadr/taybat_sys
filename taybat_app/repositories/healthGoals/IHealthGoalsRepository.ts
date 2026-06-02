import type { HealthGoal } from '@/types';

export interface IHealthGoalsRepository {
  listActiveGoals(): Promise<HealthGoal[]>;
}

