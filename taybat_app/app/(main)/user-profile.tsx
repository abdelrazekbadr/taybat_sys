import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, CheckCircle, Share2, Trophy, UserCheck, UserPlus, Users } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDefaultAvatarSource } from '@/utils/avatarUtils';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import { useAuthStore } from '@/stores/auth.store';
import { useCommunityStore } from '@/stores/community.store';
import { useHealthGoalsStore } from '@/stores/healthGoals.store';
import { useMembershipStore } from '@/stores/membership.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import { useUserRatingStore } from '@/stores/userRating.store';
import type { MembershipTier, MembershipTierKey } from '@/types';
import { toArabicNumerals } from '@/utils/zoneUtils';

// ── Tier color map ────────────────────────────────────────────────────────

const TIER_COLOR: Record<MembershipTierKey, string> = {
  starter:  '#94a3b8',
  bronze:   '#b45309',
  silver:   '#64748b',
  gold:     '#d97706',
  platinum: '#4f46e5',
};

// ── Membership card ───────────────────────────────────────────────────────

interface MembershipCardProps {
  tier: MembershipTier | null;
  points: number;
  nextTierPoints: number | null;
  trackLabel: string;
  Icon: React.ElementType;
  rowDir: 'row' | 'row-reverse';
}

function MembershipCard({ tier, points, nextTierPoints, trackLabel, Icon, rowDir }: MembershipCardProps) {
  const tierKey  = tier?.tierKey ?? 'starter';
  const color    = TIER_COLOR[tierKey];
  const pct      = nextTierPoints ? Math.min(1, points / nextTierPoints) : 1;
  const pctStr   = `${Math.round(pct * 100)}%` as `${number}%`;
  // iOS uses explicit CSS for RTL (no native coordinate flip), so the progress
  // bar fill direction must be manually mirrored. Android's native flip handles it.
  const flipBar  = Platform.OS === 'ios' && rowDir === 'row-reverse';

  return (
    <View
      className="flex-1 overflow-hidden rounded-2xl border border-app-lineSoft bg-app-surface p-4"
      style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
    >
      {/* Header row */}
      <View className="mb-3 items-center gap-2" style={{ flexDirection: rowDir }}>
        <View
          className="h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon size={16} color={color} strokeWidth={2.2} />
        </View>
        <AppText variant="semibold" className="flex-1 text-[12.5px] leading-5 text-app-textMuted">
          {trackLabel}
        </AppText>
      </View>

      {/* Tier + points */}
      <View className="mb-2 items-center gap-1.5" style={{ flexDirection: rowDir }}>
        <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
          {tier?.labelAr ?? 'مبتدئ'}
        </AppText>
        <View className="flex-1" />
        <AppText variant="semibold" className="text-[13px] leading-5" style={{ color }}>
          {toArabicNumerals(points)}
        </AppText>
        <AppText className="text-[11px] leading-5 text-app-textMuted"> نقطة</AppText>
      </View>

      {/* Progress bar — scaleX(-1) on OUTER container flips the clipped fill on iOS RTL */}
      <View
        className="h-1.5 overflow-hidden rounded-full bg-app-background"
        style={{ transform: [{ scaleX: flipBar ? -1 : 1 }] }}
      >
        <View className="h-full rounded-full" style={{ width: pctStr, backgroundColor: color }} />
      </View>

      {/* Next tier hint */}
      {nextTierPoints !== null && (
        <AppText className="mt-1.5 text-[10.5px] leading-5 text-app-textMuted">
          {toArabicNumerals(Math.max(0, nextTierPoints - points))} نقطة للمستوى التالي
        </AppText>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────

export default function UserProfileScreen() {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();
  const { userId, name: paramName } = useLocalSearchParams<{ userId?: string; name?: string }>();

  const { user }       = useUserStore();
  const isGuest        = useAuthStore((s) => s.status) === 'guest';
  const { userMeals }  = useUserMealsStore();
  const { ratings }    = useUserRatingStore();
  const goals          = useHealthGoalsStore((s) => s.goals);
  const { userFollows, toggleFollow } = useCommunityStore();

  const committedPoints = useMembershipStore((s) => s.committedPoints);
  const supporterPoints = useMembershipStore((s) => s.supporterPoints);
  const committedTier   = useMembershipStore((s) => s.committedTier);
  const supporterTier   = useMembershipStore((s) => s.supporterTier);
  const membershipConfig = useMembershipStore((s) => s.config);
  const fetchMembership  = useMembershipStore((s) => s.fetchMembership);

  const targetUserId: string = userId !== undefined ? userId : (user?.id ?? '');
  const isSystemUser  = targetUserId === 'system';
  const isOwnProfile  = userId === undefined || (user !== null && targetUserId === user?.id);
  const displayName   = isOwnProfile
    ? (isGuest ? 'زائر' : (user?.name || user?.email?.split('@')[0] || ''))
    : (paramName ?? '');

  // Refresh membership when viewing own profile (guests have no membership data)
  useEffect(() => {
    if (isOwnProfile && !isGuest) void fetchMembership();
  }, [isOwnProfile, isGuest, fetchMembership]);

  const planDays = useMemo(() => {
    if (!isOwnProfile || !user?.plan_start_date) return 0;
    const start = new Date(user.plan_start_date).getTime();
    return Math.max(0, Math.floor((Date.now() - start) / 86400000));
  }, [isOwnProfile, user]);

  const totalMeals = isOwnProfile ? userMeals.length : 0;

  // Derive point-hint rows from live config so they reflect any admin changes
  const pointHints = useMemo(() => {
    if (!membershipConfig) return [];
    const pts = (key: string) =>
      toArabicNumerals(membershipConfig.rules.find((r) => r.actionKey === key)?.points ?? 0);
    return [
      { Icon: CheckCircle, color: TIER_COLOR.gold,   text: `سجّل وجبة يومية (+${pts('add_daily_meal')} نقطة)` },
      { Icon: CheckCircle, color: TIER_COLOR.gold,   text: `أكمل التقييم الأسبوعي (+${pts('complete_weekly_rating')} نقطة)` },
      { Icon: Share2,      color: TIER_COLOR.bronze, text: `شارك وجبة أو منشوراً (+${pts('share_meal')} نقطة)` },
    ];
  }, [membershipConfig]);

  // Resolve next tier threshold for progress bar
  const nextCommittedPoints = useMemo(() => {
    if (!membershipConfig) return null;
    const next = membershipConfig.tiers
      .filter((t) => t.track === 'committed' && t.minPoints > committedPoints)
      .sort((a, b) => a.minPoints - b.minPoints)[0];
    return next?.minPoints ?? null;
  }, [membershipConfig, committedPoints]);

  const nextSupporterPoints = useMemo(() => {
    if (!membershipConfig) return null;
    const next = membershipConfig.tiers
      .filter((t) => t.track === 'supporter' && t.minPoints > supporterPoints)
      .sort((a, b) => a.minPoints - b.minPoints)[0];
    return next?.minPoints ?? null;
  }, [membershipConfig, supporterPoints]);

  const latestRating = useMemo(() => {
    if (!ratings.length) return null;
    return ratings.reduce((latest, r) =>
      new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
    );
  }, [ratings]);

  const improvements = useMemo(() => {
    if (!latestRating || !latestRating.improvement_goals_codes) return [];
    const ids = new Set(latestRating.improvement_goals_codes.split(',').map(Number).filter(Boolean));
    return goals.filter((g) => ids.has(g.id)).map((g) => g.name);
  }, [latestRating, goals]);

  const isFollowing = userFollows.includes(targetUserId);
  const canFollow   = !isOwnProfile && !isSystemUser;

  const androidRTL = Platform.OS === 'android' && isRTL;
  const gradStart  = androidRTL ? { x: 1, y: 0 } : { x: 0, y: 0 };
  const gradEnd    = androidRTL ? { x: 0, y: 1 } : { x: 1, y: 1 };
  const BackIcon   = isRTL ? ArrowRight : ArrowLeft;

  // Tier color for stats row accent
  const committedColor = TIER_COLOR[committedTier?.tierKey ?? 'starter'];

  return (
    <View className="flex-1 bg-app-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

        {/* ── Hero ── */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={gradStart}
          end={gradEnd}
          style={{ paddingTop: insets.top + 8, paddingBottom: 68 }}
        >
          <View style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <View style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.07)' }} />

          {/* Back */}
          <View className="mb-5 px-4" style={{ flexDirection: rowDir, alignItems: 'center' }}>
            <Pressable
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, backgroundColor: 'rgba(255,255,255,0.2)' }]}
            >
              <BackIcon size={20} color="white" strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Avatar + name */}
          <View className="items-center px-6">
            {isSystemUser ? (
              <View className="mb-3 h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}>
                <Users size={36} color="white" strokeWidth={1.8} />
              </View>
            ) : (
              <View className="mb-3 h-20 w-20 overflow-hidden rounded-full" style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}>
                <Image source={getDefaultAvatarSource(isOwnProfile ? (user?.gender ?? null) : null)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
            )}

            <AppText variant="bold" className="text-[18px] leading-7 text-white">
              {displayName || (isSystemUser ? 'فريق الطيبات' : '')}
            </AppText>

            {/* Tier badge under name — own profile only */}
            {isOwnProfile && committedTier && committedTier.tierKey !== 'starter' && (
              <View className="mt-1.5 flex-row items-center gap-1.5 rounded-full px-3 py-1" style={{ flexDirection: rowDir, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: committedColor }} />
                <AppText className="text-[12px] leading-5 text-white">
                  عضو {committedTier.labelAr}
                </AppText>
              </View>
            )}

            {isSystemUser && (
              <View className="mt-2 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <AppText className="text-[12px] leading-5 text-white">الفريق الرسمي لتطبيق الطيبات</AppText>
              </View>
            )}

            {canFollow && (
              <Pressable
                onPress={() => void toggleFollow(targetUserId)}
                className="mt-4 flex-row items-center gap-2 rounded-full px-6 py-2.5"
                style={({ pressed }) => [{ flexDirection: rowDir, opacity: pressed ? 0.85 : 1, backgroundColor: isFollowing ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.95)' }]}
              >
                {isFollowing ? (
                  <UserCheck size={16} color="white" strokeWidth={2.2} />
                ) : (
                  <UserPlus size={16} color={theme.colors.primary} strokeWidth={2.2} />
                )}
                <AppText variant="bold" className="text-[13px] leading-5" style={{ color: isFollowing ? 'white' : theme.colors.primary }}>
                  {isFollowing ? 'متابَع' : 'متابعة'}
                </AppText>
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* ── Stats row — floats over hero ── */}
        {isOwnProfile && (
          <View
            className="mx-5 -mt-9 flex-row overflow-hidden rounded-2xl bg-app-surface"
            style={{ flexDirection: rowDir, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
          >
            {([
              { value: planDays,     label: 'يوم في الرحلة' },
              { value: totalMeals,   label: 'وجبة مسجلة' },
              { value: committedPoints, label: 'نقطة الالتزام' },
            ] as const).map((stat, i) => (
              <React.Fragment key={i}>
                <View className="flex-1 items-center py-4">
                  <AppText
                    variant="bold"
                    className="text-[22px] leading-8 text-app-navy"
                    style={i === 2 ? { color: committedColor } : undefined}
                  >
                    {toArabicNumerals(stat.value)}
                  </AppText>
                  <AppText className="mt-0.5 text-center text-[10.5px] leading-4 text-app-textMuted">
                    {stat.label}
                  </AppText>
                </View>
                {i < 2 && <View className="my-3 w-px bg-app-lineSoft" />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* ── Membership section ── */}
        {isOwnProfile && (
          <View className="mx-5 mt-6">
            <View className="mb-3 items-center gap-1.5" style={{ flexDirection: rowDir }}>
              <AppText variant="bold" className="flex-1 text-[15px] leading-6 text-app-navy">
                عضويتي
              </AppText>
              <AppText className="text-[11px] leading-5 text-app-textMuted">آخر ٣٠ يوماً</AppText>
            </View>

            <View className="gap-3" style={{ flexDirection: rowDir }}>
              <MembershipCard
                tier={committedTier}
                points={committedPoints}
                nextTierPoints={nextCommittedPoints}
                trackLabel="عضو ملتزم"
                Icon={Trophy}
                rowDir={rowDir}
              />
              <MembershipCard
                tier={supporterTier}
                points={supporterPoints}
                nextTierPoints={nextSupporterPoints}
                trackLabel="عضو داعم"
                Icon={Share2}
                rowDir={rowDir}
              />
            </View>

            {/* How to earn points — values come from live config */}
            {pointHints.length > 0 && (
              <View className="mt-3 rounded-2xl border border-app-lineSoft bg-app-surface px-4 py-3">
                <AppText variant="semibold" className="mb-2 text-[12px] leading-5 text-app-navy">
                  كيف تكسب النقاط؟
                </AppText>
                {pointHints.map(({ Icon, color, text }, i) => (
                  <View key={i} className="mb-1 items-center gap-2" style={{ flexDirection: rowDir }}>
                    <Icon size={13} color={color} strokeWidth={2.2} />
                    <AppText className="text-[11.5px] leading-5 text-app-textMuted">{text}</AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Weekly commitment ── */}
        {isOwnProfile && latestRating && (
          <View className="mx-5 mt-6">
            <AppText variant="bold" className="mb-3 text-[15px] leading-6 text-app-navy">
              آخر تقييم أسبوعي
            </AppText>
            <View className="gap-0 overflow-hidden rounded-2xl border border-app-lineSoft bg-app-surface">
              <View className="flex-row items-center justify-between px-4 py-3.5" style={{ flexDirection: rowDir }}>
                <AppText className="text-[13px] leading-5 text-app-text">الصحة العامة</AppText>
                <StarRating value={latestRating.health_score} size={14} gap={3} />
              </View>
              {improvements.length > 0 && (
                <>
                  <View className="mx-4 h-px bg-app-lineSoft" />
                  <View className="px-4 py-3.5">
                    <AppText className="mb-2 text-[12px] leading-5 text-app-textMuted">تحسينات ملحوظة</AppText>
                    <View className="flex-row flex-wrap gap-1.5" style={{ flexDirection: rowDir }}>
                      {improvements.map((label) => (
                        <View key={label} className="rounded-full bg-app-background px-2.5 py-1">
                          <AppText className="text-[11px] leading-4 text-app-text">{label}</AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* ── Other user empty state ── */}
        {!isOwnProfile && !isSystemUser && (
          <View className="mx-5 mt-6 items-center rounded-2xl border border-app-lineSoft bg-app-surface py-10">
            <AppText className="text-center text-[13px] leading-6 text-app-textMuted">
              ملف هذا العضو خاص في الوقت الحالي
            </AppText>
          </View>
        )}

        {isOwnProfile && !isSystemUser && (
          isGuest ? (
            <View className="mx-5 mt-6">
              <PrimaryButton title="تسجيل الدخول" onPress={() => router.push('/(auth)/login' as never)} />
            </View>
          ) : !user?.profile_completed ? (
            <View className="mx-5 mt-6">
              <PrimaryButton title="استكمال الملف الشخصي" onPress={() => router.push('/(auth)/complete-profile' as never)} />
            </View>
          ) : null
        )}

      </ScrollView>
    </View>
  );
}
