import type { UserMeal, ZoneColor } from '@/types';

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const isoDateDaysAgo = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toIsoDate(d);
};

const makeIsoDatetime = (isoDate: string, time: string) => `${isoDate}T${time}:00.000Z`;

const today = isoDateDaysAgo(0);

const records: UserMeal[] = [
  {
    id: 1,
    user_id: 1,
    meal_id: 1,
    meal_item_ids: '1001,1006,1008',
    datetime: makeIsoDatetime(isoDateDaysAgo(6), '08:10'),
    date: isoDateDaysAgo(6),
    zone_summary: 1,
  },
  {
    id: 2,
    user_id: 1,
    meal_id: 2,
    meal_item_ids: '3002,1003',
    datetime: makeIsoDatetime(isoDateDaysAgo(6), '13:20'),
    date: isoDateDaysAgo(6),
    zone_summary: 3,
  },
  {
    id: 3,
    user_id: 1,
    meal_id: 3,
    meal_item_ids: '2025,2030',
    datetime: makeIsoDatetime(isoDateDaysAgo(5), '20:15'),
    date: isoDateDaysAgo(5),
    zone_summary: 2,
  },
  {
    id: 4,
    user_id: 1,
    meal_id: 1,
    meal_item_ids: '1001,1006,1008',
    datetime: makeIsoDatetime(isoDateDaysAgo(4), '07:55'),
    date: isoDateDaysAgo(4),
    zone_summary: 1,
  },
  {
    id: 5,
    user_id: 1,
    meal_id: 2,
    meal_item_ids: '3002,1003',
    datetime: makeIsoDatetime(isoDateDaysAgo(4), '13:05'),
    date: isoDateDaysAgo(4),
    zone_summary: 3,
  },
  {
    id: 6,
    user_id: 1,
    meal_id: 3,
    meal_item_ids: '2025,2030',
    datetime: makeIsoDatetime(isoDateDaysAgo(4), '19:40'),
    date: isoDateDaysAgo(4),
    zone_summary: 2,
  },
  {
    id: 7,
    user_id: 1,
    meal_id: 2,
    meal_item_ids: '3002,1003',
    datetime: makeIsoDatetime(isoDateDaysAgo(3), '12:35'),
    date: isoDateDaysAgo(3),
    zone_summary: 3,
  },
  {
    id: 8,
    user_id: 1,
    meal_id: 1,
    meal_item_ids: '1001,1006,1008',
    datetime: makeIsoDatetime(isoDateDaysAgo(2), '08:25'),
    date: isoDateDaysAgo(2),
    zone_summary: 1,
  },
  {
    id: 9,
    user_id: 1,
    meal_id: 3,
    meal_item_ids: '2025,2030',
    datetime: makeIsoDatetime(isoDateDaysAgo(2), '20:05'),
    date: isoDateDaysAgo(2),
    zone_summary: 2,
  },
  {
    id: 10,
    user_id: 1,
    meal_id: 1,
    meal_item_ids: '1001,1006,1008',
    datetime: makeIsoDatetime(isoDateDaysAgo(1), '08:00'),
    date: isoDateDaysAgo(1),
    zone_summary: 1,
  },
  {
    id: 11,
    user_id: 1,
    meal_id: 2,
    meal_item_ids: '3002,1003',
    datetime: makeIsoDatetime(isoDateDaysAgo(1), '13:10'),
    date: isoDateDaysAgo(1),
    zone_summary: 3,
  },
  {
    id: 12,
    user_id: 1,
    meal_id: 3,
    meal_item_ids: '2025,2030',
    datetime: makeIsoDatetime(today, '20:00'),
    date: today,
    zone_summary: 2,
  },
];

export const MOCK_USER_MEALS: UserMeal[] = Object.freeze(
  records.map((r) => ({ ...r, zone_summary: r.zone_summary as ZoneColor })),
) as unknown as UserMeal[];
