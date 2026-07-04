/** UUID of the system/admin account ("فريق الطيبات"). Posts from this user
 *  are treated as official announcements: no follow button, non-tappable avatar. */
export const SYSTEM_ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';

/** Meal code for the Sunnah-fasting "meal" (no items, no hunger state) —
 *  logged like a regular meal so fasting days can be analyzed later, but
 *  the UI treats it as a distinct entry, not a meal with ingredients. */
export const FASTING_MEAL_CODE = 'M001';
