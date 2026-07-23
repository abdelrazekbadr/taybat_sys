import type { SupabaseClient } from '@supabase/supabase-js';

import { ServerError } from '@/shared/errors/AppError';

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

interface ConfigRow {
  key: string;
  value: string | null;
}

function parseHour(raw: string | null | undefined, fallback: number): number {
  const n = parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n >= 0 && n <= 23 ? n : fallback;
}

function parseMinute(raw: string | null | undefined, fallback: number): number {
  const n = parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n >= 0 && n <= 59 ? n : fallback;
}

export class PublicConfigRepositorySupabase implements IPublicConfigRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getNotificationConfig(): Promise<NotificationConfig> {
    const { data, error } = await this.client
      .from('public_config')
      .select('key, value')
      .like('key', 'app_%');

    if (error) throw new ServerError(error);

    const rows: ConfigRow[] = data ?? [];
    const val = (key: string) => rows.find((r) => r.key === key)?.value ?? null;

    const d = DEFAULT_NOTIFICATION_CONFIG;
    return {
      fastReminderHour: parseHour(
        val('app_fast_reminder_hour'),
        d.fastReminderHour,
      ),
      fastReminderMinute: parseMinute(
        val('app_fast_reminder_minute'),
        d.fastReminderMinute,
      ),
      mealReminderHour: parseHour(
        val('app_meal_reminder_hour'),
        d.mealReminderHour,
      ),
      mealReminderMinute: parseMinute(
        val('app_meal_reminder_minute'),
        d.mealReminderMinute,
      ),
      ratingReminderHour: parseHour(
        val('app_rating_reminder_hour'),
        d.ratingReminderHour,
      ),
      ratingReminderMinute: parseMinute(
        val('app_rating_reminder_minute'),
        d.ratingReminderMinute,
      ),
    };
  }

  async getShareConfig(): Promise<ShareConfig> {
    const { data, error } = await this.client
      .from('public_config')
      .select('key, value')
      .in('key', ['url_web', 'community_hash_tags']);

    if (error) throw new ServerError(error);

    const rows: ConfigRow[] = data ?? [];
    const val = (key: string) => rows.find((r) => r.key === key)?.value ?? null;

    const webUrl = val('url_web') || DEFAULT_SHARE_CONFIG.webUrl;
    // community_hash_tags is a single comma-separated string in public_config —
    // flatten it into a string array, trimming whitespace around each tag.
    const rawHashtags = val('community_hash_tags');
    const hashtags = rawHashtags
      ? rawHashtags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : DEFAULT_SHARE_CONFIG.hashtags;

    return { webUrl, hashtags };
  }

  async getMealImageBaseUrl(): Promise<string> {
    const { data, error } = await this.client
      .from('public_config')
      .select('value')
      .eq('key', 'meal_img_url')
      .maybeSingle();

    if (error) throw new ServerError(error);
    return data?.value || DEFAULT_MEAL_IMAGE_BASE_URL;
  }

  async getRatingMinCommitmentDays(): Promise<number> {
    const { data, error } = await this.client
      .from('public_config')
      .select('value')
      .eq('key', 'rating_max_allowed_commitment')
      .maybeSingle();

    if (error) throw new ServerError(error);
    const n = parseInt(data?.value ?? '', 10);
    return Number.isFinite(n) && n >= 0 && n <= 7
      ? n
      : DEFAULT_RATING_MIN_COMMITMENT_DAYS;
  }
}
