import type { HealthGoal } from '@/types';
import { mockDelay } from '@/utils/mockDelay';

import type { IHealthGoalsRepository } from './IHealthGoalsRepository';

const MOCK_GOALS: HealthGoal[] = [
  { id: 1, name: 'تقليل الالتهاب', name_en: 'Reduce inflammation', active: true, image: 'dish' },
  { id: 2, name: 'تحسين الهضم', name_en: 'Improve digestion', active: true, image: 'dish' },
  { id: 3, name: 'فقدان الوزن', name_en: 'Weight loss', active: true, image: 'dish' },
  { id: 4, name: 'تحسين الطاقة', name_en: 'Improve energy', active: true, image: 'dish' },
  { id: 5, name: 'تحسين النوم', name_en: 'Improve sleep', active: true, image: 'dish' },
  { id: 6, name: 'التخلص من التوتر', name_en: 'Reduce stress', active: true, image: 'dish' },
];

export class HealthGoalsRepositoryMock implements IHealthGoalsRepository {
  async listActiveGoals(): Promise<HealthGoal[]> {
    await mockDelay(150);
    return MOCK_GOALS.filter((g) => g.active);
  }
}

