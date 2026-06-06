import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MealSpinner } from '@/components/common/MealSpinner';

import { CommunityStatsTab } from '@/components/community/CommunityStatsTab';
import { EmptyFeed } from '@/components/community/EmptyFeed';
import { PostCard } from '@/components/community/PostCard';
import { AppTabBar } from '@/components/common/AppTabBar';
import { AppText } from '@/components/common/AppText';
import { GradientTabs } from '@/components/common/GradientTabs';
import { useRTL } from '@/hooks/useRTL';
import { useCommunityStore } from '@/stores/community.store';
import { useUserStore } from '@/stores/user.store';

type CommunityTab = 'posts' | 'stats';

const COMMUNITY_TABS = [
  { key: 'posts', label: 'المنشورات' },
  { key: 'stats', label: 'لوحة المعلومات' },
] as const;

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { rowDir } = useRTL();

  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');
  const { user } = useUserStore();
  const { posts, userReactions, userFollows, isLoading, isLoadingMore, hasMore, errorMessage, initializeCommunity, loadMorePosts, refreshPosts, toggleReaction, toggleFollow } =
    useCommunityStore();

  useEffect(() => {
    initializeCommunity();
  }, [initializeCommunity]);

  return (
    <View className="flex-1 bg-app-background">
      <View className="px-[22px]" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
          <View className="w-11" />
          <AppText variant="bold" className="text-[17px] text-app-navy">
            عائلة الطيبات
          </AppText>
          <View className="w-11" />
        </View>

        <View className="mt-4">
          <GradientTabs options={COMMUNITY_TABS} value={activeTab} onChange={setActiveTab} />
        </View>
      </View>

      {activeTab === 'stats' ? (
        <CommunityStatsTab />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + 110,
          }}
          ItemSeparatorComponent={() => <View className="h-2 bg-app-background" />}
          onRefresh={refreshPosts}
          refreshing={isLoading}
          onEndReached={() => {
            if (hasMore) loadMorePosts();
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            isLoading ? (
              <View className="py-10 items-center">
                <MealSpinner size={120} />
              </View>
            ) : (
              <EmptyFeed />
            )
          }
          ListHeaderComponent={
            errorMessage ? (
              <View className="mb-2 bg-app-surface px-4 py-3">
                <AppText className="text-[12.5px] leading-6 text-app-textMuted">{errorMessage}</AppText>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isFollowable = item.user_id !== (user?.id ?? '');
            return (
              <PostCard
                post={item}
                isLoved={userReactions.includes(item.id)}
                onLovePress={() => toggleReaction(item.id)}
                isFollowing={isFollowable ? userFollows.includes(item.user_id) : undefined}
                onFollowPress={isFollowable ? () => toggleFollow(item.user_id) : undefined}
              />
            );
          }}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-6 items-center">
                <MealSpinner variant="arc" size={80} />
              </View>
            ) : (
              <View className="h-2" />
            )
          }
        />
      )}

      <AppTabBar active="community" />
    </View>
  );
}
