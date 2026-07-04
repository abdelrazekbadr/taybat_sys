import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  logEvent,
  logScreenView,
  setAnalyticsCollectionEnabled,
  setUserId,
  setUserProperties,
} from '@react-native-firebase/analytics';

import { createLogger } from '@/lib/logger';

const log = createLogger('Analytics');

// Single Firebase Analytics instance, lazily resolved so a missing/late
// native config never crashes JS at import time.
function analytics() {
  return getAnalytics(getApp());
}

/**
 * Typed event names — keep every tracked event here so analytics stays
 * discoverable and we never ship typo'd event keys to Firebase.
 * Firebase rule: name ≤ 40 chars, letters/digits/underscore, must start with a letter.
 */
export type AnalyticsEvent =
  | 'app_open'
  | 'login'
  | 'sign_up'
  | 'logout'
  | 'guest_mode_enter'
  | 'meal_selected'
  | 'meal_logged'
  | 'meal_favorited'
  | 'weekly_rating_submitted'
  | 'community_post_created'
  | 'community_reaction'
  | 'profile_completed';

type EventParams = Record<string, string | number | boolean | undefined>;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Enable/disable collection at runtime (e.g. a privacy toggle).
 * Collection is on by default once the native module is configured.
 */
export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  try {
    await setAnalyticsCollectionEnabled(analytics(), enabled);
  } catch (error: unknown) {
    log.error('setAnalyticsEnabled failed', error);
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

/** Fire-and-forget — analytics must never block or break a user flow. */
export async function trackEvent(
  event: AnalyticsEvent,
  params?: EventParams,
): Promise<void> {
  try {
    // Our AnalyticsEvent union is the authoring guardrail. Some recommended
    // names (login, sign_up) are "reserved" in RNFB's generic logEvent overload,
    // so cast at this single boundary to keep the canonical GA event names.
    await logEvent(analytics(), event as string, params);
    log.debug('event', event, params ?? '');
  } catch (error: unknown) {
    log.error('trackEvent failed', event, error);
  }
}

/** Call when a screen becomes focused (see useScreenTracking). */
export async function trackScreen(
  screenName: string,
  screenClass?: string,
): Promise<void> {
  try {
    await logScreenView(analytics(), {
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    });
  } catch (error: unknown) {
    log.error('trackScreen failed', screenName, error);
  }
}

// ─── Identity ─────────────────────────────────────────────────────────────────

/** Associate events with a user id after login. Pass null to clear on logout. */
export async function setAnalyticsUser(userId: string | null): Promise<void> {
  try {
    await setUserId(analytics(), userId);
  } catch (error: unknown) {
    log.error('setAnalyticsUser failed', error);
  }
}

/** Set durable, low-cardinality user properties (e.g. plan day bucket, language). */
export async function setAnalyticsUserProps(
  props: Record<string, string | null>,
): Promise<void> {
  try {
    await setUserProperties(analytics(), props);
  } catch (error: unknown) {
    log.error('setAnalyticsUserProps failed', error);
  }
}
