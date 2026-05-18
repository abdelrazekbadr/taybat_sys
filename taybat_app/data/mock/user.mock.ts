import type { User } from '@/types';

export const MOCK_USER: User = Object.freeze({
  id: 1,
  subscriber_id: 100,
  name: 'عبد الرازق',
  email: 'user@example.com',
  avatar_url: null,
  avatar_config: null,
  plan_start_date: '2026-04-01',
  language: 'ar',
  theme: 'light',
  post_visibility: 'public',
  follow_permission: 'everyone',
}) as unknown as User;
