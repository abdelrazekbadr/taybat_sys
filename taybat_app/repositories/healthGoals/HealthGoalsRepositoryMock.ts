import type { HealthGoal } from '@/types';
import { mockDelay } from '@/utils/mockDelay';

import type { IHealthGoalsRepository } from './IHealthGoalsRepository';

const MOCK_GOALS: HealthGoal[] = [
  { id: 1, code: 'HG01', name: 'تقليل الالتهاب', name_en: 'Reduce inflammation', active: true, image: 'dish' },
  { id: 2, code: 'HG02', name: 'تحسين الهضم', name_en: 'Improve digestion', active: true, image: 'dish' },
  { id: 3, code: 'HG03', name: 'فقدان الوزن', name_en: 'Weight loss', active: true, image: 'dish' },
  { id: 4, code: 'HG04', name: 'تحسين الطاقة', name_en: 'Improve energy', active: true, image: 'dish' },
  { id: 5, code: 'HG05', name: 'تحسين النوم', name_en: 'Improve sleep', active: true, image: 'dish' },
  { id: 6, code: 'HG06', name: 'التخلص من التوتر', name_en: 'Reduce stress', active: true, image: 'dish' },
];

export class HealthGoalsRepositoryMock implements IHealthGoalsRepository {
  async listActiveGoals(): Promise<HealthGoal[]> {
    await mockDelay(150);
    return MOCK_GOALS.filter((g) => g.active);
  }
}
