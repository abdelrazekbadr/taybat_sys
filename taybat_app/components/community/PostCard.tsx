import { ExternalLink, Heart, Link, Pin, Share2, User, UserCheck, UserPlus, Users } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';

import { AppText } from '@/components/common/AppText';
import { FullScreenImageModal } from '@/components/common/FullScreenImageModal';
import { useRTL } from '@/hooks/useRTL';
import { buildPostTopic, shareContent } from '@/services/sharing';
import { useMembershipStore } from '@/stores/membership.store';
import { useUserStore } from '@/stores/user.store';
import type { CommunityPost } from '@/types';
import { toRelativeArabicTime } from '@/utils/communityTime';
import { SYSTEM_ADMIN_USER_ID } from '@/utils/constants';
import { daysOnPlan } from '@/utils/statsUtils';

interface PostCardProps {
  post: CommunityPost;
  isLoved: boolean;
  onLovePress: () => void;
  /** Pass only for non-system, non-own posts to show the follow button */
  isFollowing?: boolean;
  onFollowPress?: () => void;
}

const LOVE_COLOR = '#E11D48';
const COLLAPSED_LINES = 4;
// ~50 Arabic chars per line × 4 lines = 200 chars threshold
const LONG_CONTENT_THRESHOLD = 200;


function extractLinkDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function PostCard({ post, isLoved, onLovePress, isFollowing, onFollowPress }: PostCardProps) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const { user } = useUserStore();
  const dayNo = daysOnPlan(user?.plan_start_date);

  const timeLabel = useMemo(() => toRelativeArabicTime(post.created_at), [post.created_at]);
  const heartColor = isLoved ? LOVE_COLOR : theme.colors.onSurfaceVariant;
  const showFollow = onFollowPress !== undefined;
  const isSystemPost = post.post_type === 'system' || post.user_id === SYSTEM_ADMIN_USER_ID;
  const linkDomain = useMemo(() => (post.link_url ? extractLinkDomain(post.link_url) : null), [post.link_url]);

  // "See more" — character-count threshold avoids onTextLayout+numberOfLines bug
  const isLongContent = post.content.length > LONG_CONTENT_THRESHOLD;
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), []);

  // Sharing state
  const [isSharing, setIsSharing] = useState(false);

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleAuthorPress = useCallback(() => {
    if (isSystemPost) return;
    router.push({
      pathname: '/(main)/user-profile',
      params: { userId: String(post.user_id), name: post.author_name },
    });
  }, [isSystemPost, post.user_id, post.author_name]);

  const handleLinkPress = useCallback(() => {
    if (post.link_url) Linking.openURL(post.link_url);
  }, [post.link_url]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      // Deliberately text-only — post.image_url/link_url are never included.
      // A bare image/link URL in the shared text gets unfurled by WhatsApp/
      // iMessage/Telegram into a rich preview card, turning this into an
      // image share instead of a text share.
      const topic = buildPostTopic(post.author_name, post.content);
      const { shared } = await shareContent(topic, dayNo);
      if (shared) {
        void useMembershipStore.getState().recordEvent('supporter', 'share_post', undefined, 'post', post.id);
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, post.author_name, post.content, post.id, dayNo]);

  return (
    <View className="bg-app-surface">
      {/* ── Pinned indicator ── */}
      {post.is_pinned && (
        <View
          className="flex-row items-center gap-1.5 bg-app-background px-4 py-1.5"
          style={{ flexDirection: rowDir }}
        >
          <Pin size={11} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
          <AppText className="text-[11px] leading-5 text-app-textMuted">منشور مثبت</AppText>
        </View>
      )}

      {/* ── Author row ── */}
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
        <TouchableOpacity
          onPress={handleAuthorPress}
          activeOpacity={isSystemPost ? 1 : 0.75}
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
            ) : isSystemPost ? (
              <Users size={20} color={theme.colors.primary} strokeWidth={2.2} />
            ) : (
              <User size={20} color={theme.colors.primary} strokeWidth={2.2} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
              {post.author_name}
            </AppText>
            <AppText className="mt-0.5 text-[11.5px] leading-5 text-app-textMuted">
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
                {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
              </AppText>
            </View>
          </Pressable>
        )}
      </View>

      {/* ── Content with see-more ── */}
      <View className="px-4">
        <Pressable onPress={isLongContent ? toggleExpanded : undefined} style={({ pressed }) => ({ opacity: pressed && isLongContent ? 0.85 : 1 })}>
          <AppText
            className="text-[14px] leading-7 text-app-text"
            numberOfLines={isLongContent && !isExpanded ? COLLAPSED_LINES : undefined}
          >
            {post.content}
          </AppText>
        </Pressable>

        {isLongContent ? (
          <View style={{ flexDirection: rowDir, paddingTop: 2, paddingBottom: 10 }}>
            <Pressable
              onPress={toggleExpanded}
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <AppText variant="semibold" style={{ fontSize: 12.5, color: theme.colors.primary }}>
                {isExpanded ? 'أقل' : 'إقرأ المزيد ...'}
              </AppText>
            </Pressable>
          </View>
        ) : (
          <View className="h-3" />
        )}
      </View>

      {/* ── Image (tap to view full screen) ── */}
      {post.image_url ? (
        <Pressable onPress={() => setViewingImage(post.image_url)}>
          <Image
            source={{ uri: post.image_url }}
            resizeMode="cover"
            style={{ width: '100%', aspectRatio: 16 / 9 }}
          />
        </Pressable>
      ) : null}

      <FullScreenImageModal uri={viewingImage} onClose={() => setViewingImage(null)} />

      {/* ── Link preview ── */}
      {post.link_url ? (
        <Pressable
          onPress={handleLinkPress}
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        >
          <View
            style={{
              flexDirection: rowDir,
              alignItems: 'center',
              gap: 10,
              marginHorizontal: 16,
              marginBottom: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: theme.colors.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Link size={15} color={theme.colors.primary} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="semibold" className="text-[12.5px] leading-5 text-app-navy" numberOfLines={1}>
                {linkDomain}
              </AppText>
              <AppText className="text-[11px] leading-4 text-app-textMuted" numberOfLines={1}>
                {post.link_url}
              </AppText>
            </View>
            <ExternalLink size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
          </View>
        </Pressable>
      ) : null}

      {/* ── Divider ── */}
      <View className="mx-4 h-px bg-app-lineSoft" />

      {/* ── Action row (love with count + share) ── */}
      <View style={{ flexDirection: rowDir }}>
        <Pressable
          onPress={onLovePress}
          className="flex-1 items-center justify-center py-3"
          style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
        >
          <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 5 }}>
            <Heart
              size={18}
              color={heartColor}
              fill={isLoved ? heartColor : 'transparent'}
              strokeWidth={2.2}
            />
            {post.love_count > 0 && (
              <AppText variant="semibold" style={{ fontSize: 12.5, color: heartColor, lineHeight: 18 }}>
                {post.love_count}
              </AppText>
            )}
          </View>
        </Pressable>

        <View className="my-2 w-px bg-app-lineSoft" />

        <Pressable
          onPress={handleShare}
          disabled={isSharing}
          className="flex-1 items-center justify-center py-3"
          style={{ opacity: isSharing ? 0.5 : 1 }}
        >
          {isSharing ? (
            <ActivityIndicator size={16} color={theme.colors.onSurfaceVariant} />
          ) : (
            <Share2 size={18} color={theme.colors.onSurfaceVariant} strokeWidth={2.2} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
