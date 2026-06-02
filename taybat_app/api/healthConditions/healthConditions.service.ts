import { healthConditionsRepository } from '@/repositories/healthConditions';
import { toUserMessage } from '@/shared/errors/AppError';
import type { HealthCondition } from '@/types';

class HealthConditionsService {
  async listActiveConditions(): Promise<HealthCondition[]> {
    try {
      return await healthConditionsRepository.listActiveConditions();
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }
}

export const healthConditionsService = new HealthConditionsService();
