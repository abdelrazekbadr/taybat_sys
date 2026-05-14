import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type MD3Theme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { AppTabBar } from '@/components/common/AppTabBar';
import { useRTL } from '@/hooks/useRTL';
import topicsJson from '@/data/topics/topics.json';

const defaultTopicImage = require('../../assets/images/onboarding2_woman_heart.png');
const imageMobileApp = require('../../assets/topics/mobile_app.png');
const imageMobileApp2 = require('../../assets/topics/mobile_app2.png');
const imageAllowed = require('../../assets/topics/allowed.png');
const imageForbidden = require('../../assets/topics/forbidden.png');
const imageRating = require('../../assets/topics/rating.png');

type JsonTopicItem = {
  id: number;
  code: string;
  icon: string;
  title: string;
  description: string;
};

type JsonTopic = {
  id: number;
  code: string;
  sequence: number;
  title: string;
  description: string;
  image_url: string;
  accent_color: string;
  icon: string;
  items: JsonTopicItem[];
};

function resolveAccentColor(theme: MD3Theme, code: string) {
  switch (code) {
    case 'app-goals':
      return theme.colors.primary;
    case 'system-intro':
      return theme.colors.secondary;
    case 'weekly-rating':
      return theme.colors.primary;
    case 'allowed-foods':
      return theme.colors.primary;
    case 'forbidden-foods':
      return theme.colors.error;
    default:
      return theme.colors.primary;
  }
}

function resolveTopicImage(code: string, imageUrl?: string) {
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    return { uri: imageUrl };
  }
  switch (code) {
    case 'allowed-foods':
      return imageAllowed;
    case 'forbidden-foods':
      return imageForbidden;
    case 'weekly-rating':
      return imageRating;
    case 'system-intro':
      return imageMobileApp2;
    case 'app-goals':
      return imageMobileApp;
    default:
      return defaultTopicImage;
  }
}

export default function TopicsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();

  const topics = useMemo(() => {
    const parsed = topicsJson as unknown as JsonTopic[];
    return [...parsed].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }, []);

  return (
    <View className="flex-1 bg-app-background">
      <View
        className="flex-row items-center justify-between px-[20px] pb-2"
        style={{ paddingTop: insets.top + 12, flexDirection: rowDir }}
      >
        <View className="w-10" />
        <View className="items-center gap-0.5">
          <AppText variant="bold" className="text-center text-[17px] leading-6 text-app-navy">
            المكتبة
          </AppText>
        </View>
        <View className="w-10" />
      </View>

      <FlatList
        key={isRTL ? 'rtl' : 'ltr'}
        data={topics}
        keyExtractor={(item) => item.code}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 96, paddingTop: 8 }}
        columnWrapperStyle={{ gap: 12, flexDirection: rowDir }}
        renderItem={({ item }) => {
          const accentColor = resolveAccentColor(theme, item.code);
          const imageSource = resolveTopicImage(item.code, item.image_url);
          return (
            <TouchableOpacity
              className="flex-1 overflow-hidden rounded-[22px] border border-app-lineSoft bg-app-surface shadow-xl shadow-black/20"
              style={{ elevation: 6, height: 210 }}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/(main)/topic-detail',
                  params: { topicCode: item.code },
                })
              }
            >
              <View style={{ height: 4, backgroundColor: accentColor }} />
              <View className="overflow-hidden bg-app-surface" style={{ height: 122 }}>
                <Image source={imageSource} className="h-full w-full" resizeMode="contain" />
              </View>
              <View className="flex-1 bg-app-surfaceAlt px-3.5 py-3">
                <AppText variant="bold" className="text-[14.5px] leading-5 text-app-navy" numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText className="mt-1 text-[11.5px] leading-4 text-app-textSoft" numberOfLines={2}>
                  {item.description}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View className="absolute bottom-0 left-0 right-0">
        <AppTabBar active="library" />
      </View>
    </View>
  );
}
