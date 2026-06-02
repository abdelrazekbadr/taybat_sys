import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, Award, CheckCircle, UserCheck, UserPlus, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import { useCommunityStore } from '@/stores/community.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import { useWeeklyRatingStore } from '@/stores/weeklyRating.store';
import { toArabicNumerals } from '@/utils/zoneUtils';

const BADGE_MILESTONES = [
  { id: 1, label: 'بداية جيدة', minDays: 7 },
  { id: 2, label: 'أسبوعان ملتزم', minDays: 14 },
  { id: 3, label: 'شهر صحي', minDays: 30 },
  { id: 4, label: 'التزام راسخ', minDays: 60 },
  { id: 5, label: 'عائلة الطيبات', minDays: 90 },
] as const;

const IMPROVEMENT_KEYS = [
  'pain_reduced',
  'energy_improved',
  'sleep_improved',
  'digestion_improved',
  'mood_improved',
  'mental_health_improved',
] as const;

type ImprovementKey = (typeof IMPROVEMENT_KEYS)[number];

const IMPROVEMENT_LABELS: Record<ImprovementKey, string> = {
  pain_reduced: 'تقلص الألم',
  energy_improved: 'طاقة أفضل',
  sleep_improved: 'نوم أفضل',
  digestion_improved: 'هضم أفضل',
  mood_improved: 'مزاج أحسن',
  mental_health_improved: 'صحة ذهنية',
};

export default function UserProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();
  const { userId, name: paramName } = useLocalSearchParams<{ userId?: string; name?: string }>();

  const { user } = useUserStore();
  const { userMeals } = useUserMealsStore();
  const { ratings } = useWeeklyRatingStore();
  const { userFollows, toggleFollow } = useCommunityStore();

  const targetUserId: string = userId !== undefined ? userId : (user?.id ?? '');
  const isSystemUser = targetUserId === 'system';
  const isOwnProfile = userId === undefined || (user !== null && targetUserId === user?.id);
  const displayName = isOwnProfile ? (user?.name ?? '') : (paramName ?? '');

  const planDays = useMemo(() => {
    if (!isOwnProfile || !user?.plan_start_date) return 0;
    const start = new Date(user.plan_start_date).getTime();
    return Math.max(0, Math.floor((Date.now() - start) / 86400000));
  }, [isOwnProfile, user]);

  const totalMeals = isOwnProfile ? userMeals.length : 0;

  const earnedBadges = BADGE_MILESTONES.filter((b) => planDays >= b.minDays);
  const nextBadge = BADGE_MILESTONES.find((b) => planDays < b.minDays);

  const nextBadgePct = nextBadge
    ? (`${Math.min(100, Math.round((planDays / nextBadge.minDays) * 100))}%` as `${number}%`)
    : ('100%' as `${number}%`);

  const latestRating = useMemo(() => {
    if (!ratings.length) return null;
    return ratings.reduce((latest, r) =>
      new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
    );
  }, [ratings]);

  const improvements = useMemo(() => {
    if (!latestRating) return [];
    return IMPROVEMENT_KEYS.filter((key) => latestRating[key] === true).map(
      (key) => IMPROVEMENT_LABELS[key],
    );
  }, [latestRating]);

  const isFollowing = userFollows.includes(targetUserId);
  const canFollow = !isOwnProfile && !isSystemUser;

  // Android RTL mirrors gradient; swap start/end to keep visual direction correct
  const androidRTL = Platform.OS === 'android' && isRTL;
  const gradStart = androidRTL ? { x: 1, y: 0 } : { x: 0, y: 0 };
  const gradEnd = androidRTL ? { x: 0, y: 1 } : { x: 1, y: 1 };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

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
          <View
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: 'rgba(255,255,255,0.07)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: 'rgba(255,255,255,0.07)',
            }}
          />

          {/* Back button row */}
          <View
            className="mb-5 px-4"
            style={{ flexDirection: rowDir, alignItems: 'center' }}
          >
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
              <View
                className="mb-3 h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}
              >
                <Users size={36} color="white" strokeWidth={1.8} />
              </View>
            ) : (
              <View
                className="mb-3 h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}
              >
                <AppText variant="bold" style={{ fontSize: 34, lineHeight: 40, color: 'white' }}>
                  {displayName.slice(0, 1)}
                </AppText>
              </View>
            )}

            <AppText variant="bold" className="text-[20px] leading-7 text-white">
              {displayName || (isSystemUser ? 'فريق الطيبات' : '')}
            </AppText>

            {isOwnProfile && user?.plan_start_date && (
              <View className="mt-2 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <AppText className="text-[12px] leading-5 text-white">
                  في الرحلة منذ {toArabicNumerals(planDays)} يوم
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
                style={({ pressed }) => [
                  {
                    flexDirection: rowDir,
                    opacity: pressed ? 0.85 : 1,
                    backgroundColor: isFollowing ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.95)',
                  },
                ]}
              >
                {isFollowing ? (
                  <UserCheck size={16} color="white" strokeWidth={2.2} />
                ) : (
                  <UserPlus size={16} color={theme.colors.primary} strokeWidth={2.2} />
                )}
                <AppText
                  variant="bold"
                  className="text-[13px] leading-5"
                  style={{ color: isFollowing ? 'white' : theme.colors.primary }}
                >
                  {isFollowing ? 'تتابعه' : 'متابعة'}
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
              { value: planDays, label: 'يوم في الرحلة' },
              { value: totalMeals, label: 'وجبة مسجلة' },
              { value: earnedBadges.length, label: 'krhx مكتسبة' },
            ] as const).map((stat, i) => (
              <React.Fragment key={i}>
                <View className="flex-1 items-center py-4">
                  <AppText variant="bold" className="text-[22px] leading-0  text-app-navy">
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

        {isOwnProfile && user !== null && !isSystemUser ? (
          <View className="mx-5 mt-4">
            <PrimaryButton title="Complete profile" onPress={() => router.push('/(auth)/complete-profile' as never)} />
          </View>
        ) : null}

        {/* ── Badges ── */}
        {isOwnProfile && (
          <View className="mx-5 mt-6">
            <AppText variant="bold" className="mb-3 text-[15px] leading-6 text-app-navy">
              الشارات المكتسبة
            </AppText>

            {earnedBadges.length > 0 ? (
              <View className="flex-row flex-wrap gap-2" style={{ flexDirection: rowDir }}>
                {earnedBadges.map((badge) => (
                  <View
                    key={badge.id}
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                    style={{ flexDirection: rowDir, backgroundColor: theme.colors.primaryContainer }}
                  >
                    <CheckCircle size={13} color={theme.colors.primary} strokeWidth={2.2} />
                    <AppText
                      variant="semibold"
                      className="text-[12px] leading-5"
                      style={{ color: theme.colors.primary }}
                    >
                      {badge.label}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : (
              <View className="rounded-2xl border border-app-lineSoft bg-app-surface px-4 py-3">
                <AppText className="text-[12.5px] leading-5 text-app-textMuted">
                  سجّل وجباتك يومياً لتكسب أولى شاراتك
                </AppText>
              </View>
            )}

            {nextBadge && (
              <View className="mt-3 rounded-2xl border border-app-lineSoft bg-app-surface p-4">
                <View
                  className="mb-2.5 flex-row items-center justify-between"
                  style={{ flexDirection: rowDir }}
                >
                  <View
                    className="flex-row items-center gap-1.5"
                    style={{ flexDirection: rowDir }}
                  >
                    <Award size={14} color={theme.colors.primary} strokeWidth={2} />
                    <AppText variant="semibold" className="text-[12.5px] leading-5 text-app-navy">
                      الشارة القادمة: {nextBadge.label}
                    </AppText>
                  </View>
                  <AppText className="text-[11px] leading-5 text-app-textMuted">
                    {toArabicNumerals(Math.max(0, nextBadge.minDays - planDays))} يوم متبقي
                  </AppText>
                </View>
                <View className="h-1.5 overflow-hidden rounded-full bg-app-background">
                  <LinearGradient
                    colors={[theme.colors.secondary, theme.colors.primary]}
                    style={{ height: '100%', width: nextBadgePct, borderRadius: 999 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
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
              <View
                className="flex-row items-center justify-between px-4 py-3.5"
                style={{ flexDirection: rowDir }}
              >
                <AppText className="text-[13px] leading-5 text-app-text">الصحة العامة</AppText>
                <StarRating value={latestRating.health_score} size={14} gap={3} />
              </View>

              <View className="mx-4 h-px bg-app-lineSoft" />

              <View
                className="flex-row items-center justify-between px-4 py-3.5"
                style={{ flexDirection: rowDir }}
              >
                <AppText className="text-[13px] leading-5 text-app-text">الالتزام الغذائي</AppText>
                <StarRating value={latestRating.adherence_score} size={14} gap={3} />
              </View>

              {improvements.length > 0 && (
                <>
                  <View className="mx-4 h-px bg-app-lineSoft" />
                  <View className="px-4 py-3.5">
                    <AppText className="mb-2 text-[12px] leading-5 text-app-textMuted">
                      تحسينات ملحوظة
                    </AppText>
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
      </ScrollView>
    </View>
  );
}
