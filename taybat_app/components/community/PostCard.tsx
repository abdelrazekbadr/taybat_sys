import { Heart, Pin, Share2, User, UserCheck, UserPlus, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import type { CommunityPost } from '@/types';
import { toRelativeArabicTime } from '@/utils/communityTime';

interface PostCardProps {
  post: CommunityPost;
  isLoved: boolean;
  onLovePress: () => void;
  /** Pass only for non-system, non-own posts to show the follow button */
  isFollowing?: boolean;
  onFollowPress?: () => void;
}

const LOVE_COLOR = '#E11D48';

export function PostCard({ post, isLoved, onLovePress, isFollowing, onFollowPress }: PostCardProps) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const timeLabel = useMemo(() => toRelativeArabicTime(post.created_at), [post.created_at]);
  const heartColor = isLoved ? LOVE_COLOR : theme.colors.onSurfaceVariant;
  const showFollow = onFollowPress !== undefined;

  const handleAuthorPress = () => {
    router.push({
      pathname: '/(main)/user-profile',
      params: { userId: String(post.user_id), name: post.author_name },
    });
  };

  return (
    <View className="bg-app-surface">
      {/* Pinned indicator */}
      {post.is_pinned && (
        <View
          className="flex-row items-center gap-1.5 bg-app-background px-4 py-1.5"
          style={{ flexDirection: rowDir }}
        >
          <Pin size={11} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
          <AppText className="text-[11px] leading-5 text-app-textMuted">منشور مثبت</AppText>
        </View>
      )}

      {/* Author row — single flat row, all layout in inline style to avoid NativeWind conflicts */}
      <View
        style={{
          flexDirection: rowDir,
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          gap: 8,
        }}
      >
        {/* Avatar + name: TouchableOpacity so flex:1 + flexDirection apply without function-style issues */}
        <TouchableOpacity
          onPress={handleAuthorPress}
          activeOpacity={0.75}
          style={{ flex: 1, flexDirection: rowDir, alignItems: 'center', gap: 12 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {post.author_avatar ? (
              <Image source={{ uri: post.author_avatar }} style={{ width: 44, height: 44 }} resizeMode="cover" />
            ) : post.user_id === 'system' ? (
              <Users size={20} color={theme.colors.primary} strokeWidth={2.2} />
            ) : (
              <User size={20} color={theme.colors.primary} strokeWidth={2.2} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <AppText variant="bold" className="text-[14px] leading-5 text-app-navy">
              {post.author_name}
            </AppText>
            <AppText className="mt-0.5 text-[11.5px] leading-4 text-app-textMuted">
              {timeLabel}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* Follow / Unfollow */}
        {showFollow && (
          <Pressable
            onPress={onFollowPress}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              style={{
                flexDirection: rowDir,
                alignItems: 'center',
                gap: 4,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                ...(isFollowing
                  ? { backgroundColor: theme.colors.primaryContainer }
                  : { borderWidth: 1, borderColor: theme.colors.primary }),
              }}
            >
              {isFollowing ? (
                <UserCheck size={13} color={theme.colors.primary} strokeWidth={2.2} />
              ) : (
                <UserPlus size={13} color={theme.colors.primary} strokeWidth={2.2} />
              )}
              <AppText
                variant="semibold"
                style={{ fontSize: 11, lineHeight: 16, color: theme.colors.primary }}
              >
                {isFollowing ? 'تتابعه' : 'متابعة'}
              </AppText>
            </View>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <AppText className="px-4 pb-3 text-[14px] leading-7 text-app-text">{post.content}</AppText>

      {/* Image */}
      {post.image_url ? (
        <Image
          source={{ uri: post.image_url }}
          resizeMode="cover"
          style={{ width: '100%', aspectRatio: 16 / 9 }}
        />
      ) : null}

      {/* Reaction count */}
      {post.love_count > 0 && (
        <View
          className="flex-row items-center gap-1.5 px-4 py-2"
          style={{ flexDirection: rowDir }}
        >
          <View
            className="h-[18px] w-[18px] items-center justify-center rounded-full"
            style={{ backgroundColor: LOVE_COLOR }}
          >
            <Heart size={9} color="white" fill="white" strokeWidth={2} />
          </View>
          <AppText className="text-[12px] text-app-textMuted">{post.love_count}</AppText>
        </View>
      )}

      {/* Divider */}
      <View className="mx-4 h-px bg-app-lineSoft" />

      {/* Action row */}
      <View style={{ flexDirection: rowDir }}>
        <Pressable
          onPress={onLovePress}
          className="flex-1 items-center justify-center py-3"
          style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
        >
          <Heart
            size={18}
            color={heartColor}
            fill={isLoved ? heartColor : 'transparent'}
            strokeWidth={2.2}
          />
        </Pressable>

        <View className="my-2 w-px bg-app-lineSoft" />

        <Pressable
          disabled
          className="flex-1 items-center justify-center py-3"
          style={{ opacity: 0.35 }}
        >
          <Share2 size={18} color={theme.colors.onSurfaceVariant} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}
