import type { User } from '@/types';

export const MOCK_USER_ID = 'mock-user-1';

export const MOCK_USER: User = Object.freeze({
  id: MOCK_USER_ID,
  email: 'user@example.com',
  name: 'عبد الرازق',
  gender: null,
  avatar_url: null,
  avatar_config: null,
  plan_start_date: '2026-04-01',
  language: 'ar',
  theme: 'light',
  post_visibility: 'public',
  follow_permission: 'everyone',
  profile_completed: true,
});
