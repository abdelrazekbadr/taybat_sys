import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
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
import type { IMembershipRepository } from './IMembershipRepository';

// ── Row shapes returned from Supabase ────────────────────────────────────

interface ConfigRow  { key: string; value: string }
interface TierRow    { track: string; tier_key: string; min_points: number; label_ar: string; icon_key: string; sort_order: number }
interface RuleRow    { action_key: string; track: string; points: number; is_active: boolean }
interface CacheRow   { rank: number; user_id: string; points: number; tier_key: string }

interface MembershipRpcResult {
  committed_points:     number;
  supporter_points:     number;
  committed_tier_key:   string;
  committed_tier_label: string;
  committed_tier_icon:  string;
  supporter_tier_key:   string;
  supporter_tier_label: string;
  supporter_tier_icon:  string;
  window_start:         string;
}

// ── Repository ────────────────────────────────────────────────────────────

export class MembershipRepositorySupabase implements IMembershipRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getConfig(): Promise<MembershipConfig> {
    const [configRes, tiersRes, rulesRes] = await Promise.all([
      this.client.from('membership_config').select('key, value'),
      this.client.from('membership_tiers').select('track, tier_key, min_points, label_ar, icon_key, sort_order'),
      this.client.from('membership_point_rules').select('action_key, track, points, is_active').eq('is_active', true),
    ]);

    if (configRes.error) throw new ServerError(configRes.error);
    if (tiersRes.error)  throw new ServerError(tiersRes.error);
    if (rulesRes.error)  throw new ServerError(rulesRes.error);

    const configMap = new Map((configRes.data as ConfigRow[]).map((r) => [r.key, r.value]));

    const tiers: MembershipTier[] = (tiersRes.data as TierRow[]).map((r) => ({
      track:      r.track as MembershipTrack,
      tierKey:    r.tier_key as MembershipTierKey,
      minPoints:  r.min_points,
      labelAr:    r.label_ar,
      iconKey:    r.icon_key,
      sortOrder:  r.sort_order,
    }));

    const rules: PointRule[] = (rulesRes.data as RuleRow[]).map((r) => ({
      actionKey:  r.action_key as PointEventActionKey,
      track:      r.track as MembershipTrack,
      points:     r.points,
      isActive:   r.is_active,
    }));

    return {
      resetWindowDays:    parseInt(configMap.get('reset_window_days')     ?? '30', 10),
      maxDailyMealEvents: parseInt(configMap.get('max_daily_meal_events') ?? '1',  10),
      adCooldownHours:    parseInt(configMap.get('ad_cooldown_hours')     ?? '6',  10),
      tiers,
      rules,
    };
  }

  async getUserMembership(userId: string): Promise<UserMembership> {
    const { data, error } = await this.client.rpc('get_user_membership', { p_user_id: userId });
    if (error) throw new ServerError(error);

    const r = data as MembershipRpcResult;

    const makeTier = (
      track: MembershipTrack,
      tierKey: string,
      labelAr: string,
      iconKey: string,
    ): MembershipTier => ({
      track,
      tierKey:   tierKey as MembershipTierKey,
      minPoints: 0, // exact threshold not needed at display layer
      labelAr,
      iconKey,
      sortOrder: 0,
    });

    return {
      userId,
      committedPoints: r.committed_points,
      supporterPoints: r.supporter_points,
      committedTier:   makeTier('committed', r.committed_tier_key, r.committed_tier_label, r.committed_tier_icon),
      supporterTier:   makeTier('supporter', r.supporter_tier_key, r.supporter_tier_label, r.supporter_tier_icon),
      windowStart:     r.window_start,
    };
  }

  async recordEvent(
    _userId: string,
    track: MembershipTrack,
    actionKey: PointEventActionKey,
    referenceId?: string,
    referenceType?: PointEventReferenceType,
    mealRefId?: number,
  ): Promise<void> {
    // auth.uid() is resolved server-side; _userId is unused here
    const { error } = await this.client.rpc('record_point_event', {
      p_track:          track,
      p_action_key:     actionKey,
      p_reference_id:   referenceId   ?? null,
      p_reference_type: referenceType ?? null,
      p_meal_ref_id:    mealRefId     ?? null,
    });
    if (error) throw new ServerError(error);
  }

  async deleteDayPointEvent(date: string): Promise<void> {
    const { error } = await this.client.rpc('delete_day_point_event', {
      p_event_date: date,
    });
    if (error) throw new ServerError(error);
  }

  async getLeaderboard(track: MembershipTrack, limit = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.client
      .from('membership_leaderboard_cache')
      .select('rank, user_id, points, tier_key')
      .eq('track', track)
      .order('rank')
      .limit(limit);

    if (error) throw new ServerError(error);

    return (data as CacheRow[]).map((r) => ({
      rank:    r.rank,
      userId:  r.user_id,
      points:  r.points,
      tierKey: r.tier_key as MembershipTierKey,
    }));
  }
}
