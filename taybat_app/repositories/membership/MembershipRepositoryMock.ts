import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import type {
  LeaderboardEntry,
  MembershipConfig,
  MembershipTier,
  MembershipTierKey,
  MembershipTrack,
  PointEventActionKey,
  PointEventReferenceType,
  PointRule,
  UserMembership,
} from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { IMembershipRepository } from './IMembershipRepository';

// ── Static config mirrors the database seed data ──────────────────────────

const MOCK_RESET_WINDOW_DAYS = 30;

const MOCK_RULES: PointRule[] = [
  { actionKey: 'add_daily_meal',          track: 'committed', points: 10, isActive: true },
  { actionKey: 'complete_weekly_rating',  track: 'committed', points: 30, isActive: true },
  { actionKey: 'consecutive_week_streak', track: 'committed', points: 20, isActive: true },
  { actionKey: 'share_meal',              track: 'supporter', points:  5, isActive: true },
  { actionKey: 'share_post',              track: 'supporter', points:  5, isActive: true },
  { actionKey: 'share_stats',             track: 'supporter', points:  8, isActive: true },
  { actionKey: 'share_topic',             track: 'supporter', points:  5, isActive: true },
  { actionKey: 'create_community_post',   track: 'supporter', points:  3, isActive: true },
];

const MOCK_TIERS: MembershipTier[] = [
  { track: 'committed', tierKey: 'starter',  minPoints:   0, labelAr: 'مبتدئ',   iconKey: 'tier_starter',  sortOrder: 1 },
  { track: 'committed', tierKey: 'bronze',   minPoints:  50, labelAr: 'برونزي',  iconKey: 'tier_bronze',   sortOrder: 2 },
  { track: 'committed', tierKey: 'silver',   minPoints: 150, labelAr: 'فضي',     iconKey: 'tier_silver',   sortOrder: 3 },
  { track: 'committed', tierKey: 'gold',     minPoints: 300, labelAr: 'ذهبي',    iconKey: 'tier_gold',     sortOrder: 4 },
  { track: 'committed', tierKey: 'platinum', minPoints: 500, labelAr: 'بلاتيني', iconKey: 'tier_platinum', sortOrder: 5 },
  { track: 'supporter', tierKey: 'starter',  minPoints:   0, labelAr: 'مبتدئ',   iconKey: 'tier_starter',  sortOrder: 1 },
  { track: 'supporter', tierKey: 'bronze',   minPoints:  50, labelAr: 'برونزي',  iconKey: 'tier_bronze',   sortOrder: 2 },
  { track: 'supporter', tierKey: 'silver',   minPoints: 150, labelAr: 'فضي',     iconKey: 'tier_silver',   sortOrder: 3 },
  { track: 'supporter', tierKey: 'gold',     minPoints: 300, labelAr: 'ذهبي',    iconKey: 'tier_gold',     sortOrder: 4 },
  { track: 'supporter', tierKey: 'platinum', minPoints: 500, labelAr: 'بلاتيني', iconKey: 'tier_platinum', sortOrder: 5 },
];

// ── Persisted event shape ─────────────────────────────────────────────────

interface StoredEvent {
  userId: string;
  track: MembershipTrack;
  actionKey: PointEventActionKey;
  eventDate: string;
  occurredAt: string;
  referenceId?: string;
  referenceType?: PointEventReferenceType;
  mealRefId?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function windowStart(windowDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - windowDays);
  return d;
}

function resolveTier(track: MembershipTrack, points: number): MembershipTier {
  const tiers = MOCK_TIERS.filter((t) => t.track === track).sort((a, b) => b.minPoints - a.minPoints);
  return tiers.find((t) => points >= t.minPoints) ?? tiers[tiers.length - 1]!;
}

async function readEvents(): Promise<StoredEvent[]> {
  try {
    const raw = await storageService.get<unknown>(STORAGE_KEYS.MEMBERSHIP_MOCK_EVENTS);
    if (!Array.isArray(raw)) return [];
    return raw as StoredEvent[];
  } catch {
    return [];
  }
}

async function writeEvents(events: StoredEvent[]): Promise<void> {
  await storageService.set(STORAGE_KEYS.MEMBERSHIP_MOCK_EVENTS, events);
}

// ── Repository ────────────────────────────────────────────────────────────

export class MembershipRepositoryMock implements IMembershipRepository {
  async getConfig(): Promise<MembershipConfig> {
    await mockDelay(100);
    return {
      resetWindowDays:     MOCK_RESET_WINDOW_DAYS,
      maxDailyMealEvents:  1,
      adCooldownHours:     6,
      tiers:               MOCK_TIERS,
      rules:               MOCK_RULES,
    };
  }

  async getUserMembership(userId: string): Promise<UserMembership> {
    await mockDelay(200);
    const cutoff = windowStart(MOCK_RESET_WINDOW_DAYS);
    const events = (await readEvents()).filter(
      (e) => e.userId === userId && new Date(e.occurredAt) >= cutoff,
    );

    const ruleMap = new Map(MOCK_RULES.map((r) => [r.actionKey, r]));
    let committedPoints = 0;
    let supporterPoints = 0;

    for (const e of events) {
      const rule = ruleMap.get(e.actionKey);
      if (!rule || !rule.isActive) continue;
      if (rule.track === 'committed') committedPoints += rule.points;
      else supporterPoints += rule.points;
    }

    return {
      userId,
      committedPoints,
      supporterPoints,
      committedTier: resolveTier('committed', committedPoints),
      supporterTier: resolveTier('supporter', supporterPoints),
      windowStart:   cutoff.toISOString(),
    };
  }

  async recordEvent(
    userId: string,
    track: MembershipTrack,
    actionKey: PointEventActionKey,
    referenceId?: string,
    referenceType?: PointEventReferenceType,
    mealRefId?: number,
  ): Promise<void> {
    const events = await readEvents();
    const now    = new Date().toISOString();
    const today  = now.slice(0, 10);

    // Dedup: add_daily_meal — once per calendar day (mirrors uidx_upe_daily_meal)
    if (actionKey === 'add_daily_meal') {
      const exists = events.some(
        (e) => e.userId === userId && e.actionKey === 'add_daily_meal' && e.eventDate === today,
      );
      if (exists) return;
    }

    // Dedup: share events keyed by mealRefId (mirrors uidx_upe_action_meal)
    if (mealRefId !== undefined && actionKey !== 'add_daily_meal') {
      const exists = events.some(
        (e) => e.userId === userId && e.actionKey === actionKey && e.mealRefId === mealRefId,
      );
      if (exists) return;
    }

    events.push({ userId, track, actionKey, eventDate: today, occurredAt: now, referenceId, referenceType, mealRefId });
    await writeEvents(events);
  }

  async deleteDayPointEvent(date: string): Promise<void> {
    const events   = await readEvents();
    const filtered = events.filter(
      (e) => !(e.actionKey === 'add_daily_meal' && e.eventDate === date),
    );
    await writeEvents(filtered);
  }

  async getLeaderboard(track: MembershipTrack, limit = 10): Promise<LeaderboardEntry[]> {
    await mockDelay(200);
    const cutoff  = windowStart(MOCK_RESET_WINDOW_DAYS);
    const events  = (await readEvents()).filter((e) => new Date(e.occurredAt) >= cutoff);
    const ruleMap = new Map(MOCK_RULES.map((r) => [r.actionKey, r]));

    const totals = new Map<string, number>();
    for (const e of events) {
      if (e.track !== track) continue;
      const rule = ruleMap.get(e.actionKey);
      if (!rule || !rule.isActive) continue;
      totals.set(e.userId, (totals.get(e.userId) ?? 0) + rule.points);
    }

    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, points], i) => ({
        rank:    i + 1,
        userId,
        points,
        tierKey: resolveTier(track, points).tierKey as MembershipTierKey,
      }));
  }
}
