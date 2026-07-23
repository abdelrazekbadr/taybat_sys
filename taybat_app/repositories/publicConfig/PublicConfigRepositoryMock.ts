import type {
  IPublicConfigRepository,
  NotificationConfig,
  ShareConfig,
} from './IPublicConfigRepository';
import {
  DEFAULT_MEAL_IMAGE_BASE_URL,
  DEFAULT_NOTIFICATION_CONFIG,
  DEFAULT_RATING_MIN_COMMITMENT_DAYS,
  DEFAULT_SHARE_CONFIG,
} from './IPublicConfigRepository';

export class PublicConfigRepositoryMock implements IPublicConfigRepository {
  async getNotificationConfig(): Promise<NotificationConfig> {
    return { ...DEFAULT_NOTIFICATION_CONFIG };
  }

  async getShareConfig(): Promise<ShareConfig> {
    return { ...DEFAULT_SHARE_CONFIG };
  }

  async getMealImageBaseUrl(): Promise<string> {
    return DEFAULT_MEAL_IMAGE_BASE_URL;
  }

  async getRatingMinCommitmentDays(): Promise<number> {
    return DEFAULT_RATING_MIN_COMMITMENT_DAYS;
  }
}
