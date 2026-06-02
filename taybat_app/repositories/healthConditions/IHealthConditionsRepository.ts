import type { HealthCondition } from '@/types';

export interface IHealthConditionsRepository {
  listActiveConditions(): Promise<HealthCondition[]>;
}
