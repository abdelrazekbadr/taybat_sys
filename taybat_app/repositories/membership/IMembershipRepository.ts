import type {
  LeaderboardEntry,
  MembershipConfig,
  MembershipTrack,
  PointEventActionKey,
  PointEventReferenceType,
  UserMembership,
} from '@/types';

export interface IMembershipRepository {
  /** Load config + tiers + rules once at app startup. */
  getConfig(): Promise<MembershipConfig>;

  /** Get current rolling-window points and resolved tier for a user. */
  getUserMembership(userId: string): Promise<UserMembership>;

  /**
   * Record a point-earning event.
   * Fire-and-forget: deduplication is enforced server-side via unique indexes.
   * Pass mealRefId for add_daily_meal and share_meal actions so the same
   * meal cannot be counted twice and so events can be deleted if a meal is removed.
   */
  recordEvent(
    userId: string,
    track: MembershipTrack,
    actionKey: PointEventActionKey,
    referenceId?: string,
    referenceType?: PointEventReferenceType,
    mealRefId?: number,
  ): Promise<void>;

  /**
   * Delete the add_daily_meal event for a specific calendar date.
   * Called only when the last meal of that day is deleted, so the day's
   * committed points are removed from the rolling window.
   */
  deleteDayPointEvent(date: string): Promise<void>;

  /** Top-N users per track from the leaderboard cache. */
  getLeaderboard(track: MembershipTrack, limit?: number): Promise<LeaderboardEntry[]>;
}
