import type { User } from '@/types';

export const MOCK_USER: User = Object.freeze({
  id: 1,
  subscriber_id: 100,
  name: 'عبد الرازق',
  avatar_url: null,
  plan_start_date: '2026-04-01',
  language: 'ar',
  theme: 'light',
}) as unknown as User;
