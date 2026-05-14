import { Heart, Share2, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import type { CommunityPost } from '@/types';
import { toRelativeArabicTime } from '@/utils/communityTime';

interface PostCardProps {
  post: CommunityPost;
  isLoved: boolean;
  onLovePress: () => void;
}

export function PostCard({ post, isLoved, onLovePress }: PostCardProps) {
  const theme = useTheme();
  const timeLabel = useMemo(() => toRelativeArabicTime(post.created_at), [post.created_at]);

  return (
    <View className="overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface px-4 py-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full border border-app-lineSoft bg-app-background"
          style={{ borderColor: theme.colors.outlineVariant }}
        >
          <Users size={18} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
        </View>
        <View className="flex-1">
          <AppText variant="bold" className="text-[13.5px] leading-6 text-app-navy">
            {post.author_name}
          </AppText>
          <AppText className="text-[11.5px] leading-5 text-app-textMuted">{timeLabel}</AppText>
        </View>
      </View>

      <AppText className="mt-3 text-[13px] leading-6 text-app-text">{post.content}</AppText>

      {post.image_url ? (
        <View className="mt-3 overflow-hidden rounded-2xl border border-app-lineSoft bg-app-background">
          <Image source={{ uri: post.image_url }} resizeMode="cover" className="h-[180px] w-full" />
        </View>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        <Pressable onPress={onLovePress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <View className="flex-row items-center gap-2 rounded-full border border-app-lineSoft bg-app-background px-3 py-2">
            <Heart
              size={18}
              color={isLoved ? theme.colors.error : theme.colors.onSurfaceVariant}
              fill={isLoved ? theme.colors.error : 'transparent'}
              strokeWidth={2.4}
            />
            <AppText variant="semibold" className="text-[12px] leading-5 text-app-text">
              {post.love_count}
            </AppText>
          </View>
        </Pressable>

        <Pressable disabled style={({ pressed }) => [{ opacity: pressed ? 0.85 : 0.45 }]}>
          <View className="flex-row items-center gap-2 rounded-full border border-app-lineSoft bg-app-background px-3 py-2">
            <Share2 size={18} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
            <AppText variant="semibold" className="text-[12px] leading-5 text-app-textMuted">
              مشاركة
            </AppText>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

