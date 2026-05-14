import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import { CommunityStatsTab } from '@/components/community/CommunityStatsTab';
import { EmptyFeed } from '@/components/community/EmptyFeed';
import { PostCard } from '@/components/community/PostCard';
import { AppTabBar } from '@/components/common/AppTabBar';
import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { useCommunityStore } from '@/stores/community.store';

type CommunityTab = 'posts' | 'stats';

export default function CommunityScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir } = useRTL();

  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');
  const { posts, stats, userReactions, isLoading, isLoadingMore, hasMore, errorMessage, initializeCommunity, loadMorePosts, refreshPosts, toggleReaction } =
    useCommunityStore();

  useEffect(() => {
    initializeCommunity();
  }, [initializeCommunity]);

  return (
    <View className="flex-1 bg-app-background">
      <View className="px-[22px]" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
          <View className="w-11" />
          <AppText variant="bold" className="text-[17px] leading-6 text-app-navy">
            عائلة الطيبات
          </AppText>
          <View className="w-11" />
        </View>

        <View className="mt-4 flex-row justify-center gap-3" style={{ flexDirection: rowDir }}>
          <Pressable onPress={() => setActiveTab('posts')} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            {activeTab === 'posts' ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 }}
              >
                <AppText variant="bold" className="text-[13px] text-white">
                  المنشورات
                </AppText>
              </LinearGradient>
            ) : (
              <View className="rounded-full border border-app-lineSoft bg-app-surface px-[18px] py-[10px]">
                <AppText variant="bold" className="text-[13px] text-app-textMuted">
                  المنشورات
                </AppText>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => setActiveTab('stats')} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            {activeTab === 'stats' ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 }}
              >
                <AppText variant="bold" className="text-[13px] text-white">
                  إحصاءات المجتمع
                </AppText>
              </LinearGradient>
            ) : (
              <View className="rounded-full border border-app-lineSoft bg-app-surface px-[18px] py-[10px]">
                <AppText variant="bold" className="text-[13px] text-app-textMuted">
                  إحصاءات المجتمع
                </AppText>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {activeTab === 'stats' ? (
        <CommunityStatsTab stats={stats} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 16,
            paddingBottom: insets.bottom + 110,
            gap: 12,
          }}
          onRefresh={refreshPosts}
          refreshing={isLoading}
          onEndReached={() => {
            if (hasMore) loadMorePosts();
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            isLoading ? (
              <View className="py-10">
                <ActivityIndicator />
              </View>
            ) : (
              <EmptyFeed />
            )
          }
          ListHeaderComponent={
            errorMessage ? (
              <View className="mb-2 rounded-2xl border border-app-lineSoft bg-app-surface px-4 py-3">
                <AppText className="text-[12.5px] leading-6 text-app-textMuted">{errorMessage}</AppText>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard post={item} isLoved={userReactions.includes(item.id)} onLovePress={() => toggleReaction(item.id)} />
          )}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-6">
                <ActivityIndicator />
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

