export interface NotificationConfig {
  fastReminderHour: number;
  fastReminderMinute: number;
  mealReminderHour: number;
  mealReminderMinute: number;
  ratingReminderHour: number;
  ratingReminderMinute: number;
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  fastReminderHour: 23,
  fastReminderMinute: 0,
  mealReminderHour: 22,
  mealReminderMinute: 0,
  ratingReminderHour: 20,
  ratingReminderMinute: 0,
};

export interface ShareConfig {
  webUrl: string;
  hashtags: string[];
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  webUrl: 'https://al-tayabat.com',
  hashtags: ['#الطيبات', '#نظام_الطيبات', '#حياة_صحية'],
};

// Fallback when public_config.meal_img_url is missing/empty — same bucket
// path currently used in production, kept here so the app still resolves
// meal images if the config row is ever deleted.
export const DEFAULT_MEAL_IMAGE_BASE_URL =
  'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/meals/';

export interface IPublicConfigRepository {
  getNotificationConfig(): Promise<NotificationConfig>;
  getShareConfig(): Promise<ShareConfig>;
  /** Base URL meal images are served from: {baseUrl}{meal.code}.png */
  getMealImageBaseUrl(): Promise<string>;
}
