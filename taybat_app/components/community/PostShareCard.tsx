import React, { forwardRef } from 'react';
import { Image, View, Text } from 'react-native';
import { Users, User } from 'lucide-react-native';

import type { CommunityPost } from '@/types';
import { toRelativeArabicTime } from '@/utils/communityTime';

const APP_PRIMARY = '#10B981';
const NAVY = '#1e293b';
const TEXT_MUTED = '#64748b';
const SURFACE = '#ffffff';
const BG = '#f1f5f9';
const OUTLINE = '#e2e8f0';

const CAIRO_REGULAR = 'Cairo_400Regular';
const CAIRO_SEMIBOLD = 'Cairo_600SemiBold';
const CAIRO_BOLD = 'Cairo_700Bold';

interface Props {
  post: CommunityPost;
  width: number;
}

/**
 * Off-screen capture target for sharing. Must be rendered with collapsable={false}.
 * Uses inline styles + explicit font families so the capture is font-correct.
 */
export const PostShareCard = forwardRef<View, Props>(({ post, width }, ref) => {
  const isSystemPost = post.post_type === 'system';
  const timeLabel = toRelativeArabicTime(post.created_at);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width, backgroundColor: SURFACE }}
    >
      {/* ── Brand header ── */}
      <View
        style={{
          backgroundColor: APP_PRIMARY,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Image
          source={require('@/assets/images/app_icon.png')}
          style={{ width: 28, height: 28, borderRadius: 6 }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontFamily: CAIRO_BOLD,
            fontSize: 16,
            color: '#ffffff',
            writingDirection: 'rtl',
          }}
        >
          عائلة الطيبات
        </Text>
      </View>

      {/* ── Content area ── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, backgroundColor: SURFACE }}>
        {/* Author row */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#d1fae5',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {post.author_avatar ? (
              <Image source={{ uri: post.author_avatar }} style={{ width: 40, height: 40 }} resizeMode="cover" />
            ) : isSystemPost ? (
              <Users size={18} color={APP_PRIMARY} strokeWidth={2.2} />
            ) : (
              <User size={18} color={APP_PRIMARY} strokeWidth={2.2} />
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text
              style={{ fontFamily: CAIRO_BOLD, fontSize: 13.5, color: NAVY, writingDirection: 'rtl', textAlign: 'right' }}
            >
              {post.author_name}
            </Text>
            <Text
              style={{ fontFamily: CAIRO_REGULAR, fontSize: 11, color: TEXT_MUTED, marginTop: 1, textAlign: 'right' }}
            >
              {timeLabel}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: OUTLINE, marginBottom: 12 }} />

        {/* Post text */}
        <Text
          style={{
            fontFamily: CAIRO_REGULAR,
            fontSize: 14,
            lineHeight: 26,
            color: NAVY,
            writingDirection: 'rtl',
            textAlign: 'right',
          }}
        >
          {post.content}
        </Text>
      </View>

      {/* ── Post image ── */}
      {post.image_url ? (
        <Image
          source={{ uri: post.image_url }}
          resizeMode="cover"
          style={{ width, aspectRatio: 16 / 9 }}
        />
      ) : null}

      {/* ── Footer watermark ── */}
      <View
        style={{
          backgroundColor: BG,
          paddingVertical: 8,
          paddingHorizontal: 16,
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          borderTopWidth: 1,
          borderTopColor: OUTLINE,
        }}
      >
        <Text
          style={{ fontFamily: CAIRO_SEMIBOLD, fontSize: 11, color: TEXT_MUTED, writingDirection: 'rtl' }}
        >
          تطبيق الطيبات
        </Text>
        <Text style={{ fontSize: 11, color: APP_PRIMARY }}>🌿</Text>
      </View>
    </View>
  );
});

PostShareCard.displayName = 'PostShareCard';
