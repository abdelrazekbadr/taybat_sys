import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type MD3Theme } from 'react-native-paper';

import {
  AlertTriangle,
  Apple,
  BarChart2,
  Bean,
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Drumstick,
  Ear,
  FileBarChart,
  Flame,
  GlassWater,
  Globe,
  HandPlatter,
  Heart,
  HeartPulse,
  Layers,
  Leaf,
  Milk,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Shuffle,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { useTopicsStore } from '@/stores/topics.store';

const defaultTopicImage = require('../../assets/images/onboarding2_woman_heart.png');
const imageMobileApp = require('../../assets/topics/mobile_app.png');
const imageMobileApp2 = require('../../assets/topics/mobile_app2.png');
const imageAllowed = require('../../assets/topics/allowed.png');
const imageForbidden = require('../../assets/topics/forbidden.png');
const imageRating = require('../../assets/topics/rating.png');

const ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  Apple,
  BarChart2,
  Bean,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Drumstick,
  Ear,
  FileBarChart,
  Flame,
  GlassWater,
  Globe,
  HandPlatter,
  Heart,
  HeartPulse,
  Layers,
  Leaf,
  Milk,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Shuffle,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Wheat,
};

function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}

function resolveAccentColor(theme: MD3Theme, code: string, accentColor: string) {
  if (accentColor && accentColor.startsWith('#')) return accentColor;
  switch (code) {
    case 'forbidden-foods': return theme.colors.error;
    default: return theme.colors.primary;
  }
}

function resolveTopicImage(code: string, imageUrl: string) {
  if (imageUrl.trim().length > 0) return { uri: imageUrl };
  switch (code) {
    case 'allowed-foods':   return imageAllowed;
    case 'forbidden-foods': return imageForbidden;
    case 'weekly-rating':   return imageRating;
    case 'system-intro':    return imageMobileApp2;
    case 'app-goals':       return imageMobileApp;
    default:                return defaultTopicImage;
  }
}

export default function TopicDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const { topicCode } = useLocalSearchParams<{ topicCode?: string }>();
  const sheetEntrance = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height / 2;

  const fetchTopics    = useTopicsStore((s) => s.fetchTopics);
  const getTopicByCode = useTopicsStore((s) => s.getTopicByCode);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const code = Array.isArray(topicCode) ? topicCode[0] : topicCode;
  const topic = code ? getTopicByCode(code) : undefined;

  const accentColor = topic ? resolveAccentColor(theme, topic.code, topic.accent_color) : theme.colors.primary;
  const imageSource  = topic ? resolveTopicImage(topic.code, topic.image_url) : defaultTopicImage;

  useEffect(() => {
    if (!topic) return;
    sheetEntrance.setValue(0);
    Animated.timing(sheetEntrance, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetEntrance, topic]);

  const sheetAnimatedStyle = {
    opacity: sheetEntrance,
    transform: [
      {
        translateY: sheetEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        }),
      },
    ],
  };

  if (!topic) {
    return (
      <View className="flex-1 bg-app-background" style={{ paddingTop: insets.top + 12 }}>
        <TouchableOpacity
          className="mx-[22px] h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface shadow-lg shadow-black/10"
          style={{ elevation: 5 }}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          {isRTL ? (
            <ChevronRight size={24} color={theme.colors.onSurface} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={24} color={theme.colors.onSurface} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-[22px]">
          <AppText variant="bold" className="text-[16px] leading-6 text-app-textSoft">
            المحتوى غير موجود
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <View style={{ paddingTop: insets.top }}>
        <View className="relative h-[260px] bg-app-background">
          <View className="absolute inset-0 px-[14px] pb-2">
            <View className="h-full rounded-[22px] border border-app-lineSoft bg-white">
              <Image source={imageSource} className="h-full w-full" resizeMode="contain" />
            </View>
          </View>

          <View
            className="absolute left-[22px] right-[22px] flex-row justify-between"
            style={{ top: 12, flexDirection: rowDir }}
          >
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface shadow-lg shadow-black/10"
              style={{ elevation: 5 }}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              {isRTL ? (
                <ChevronRight size={25} color={theme.colors.onSurface} strokeWidth={2.5} />
              ) : (
                <ChevronLeft size={25} color={theme.colors.onSurface} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
            <View className="w-11" />
          </View>
        </View>
      </View>

      <Animated.View className="-mt-7 flex-1 bg-app-background" style={sheetAnimatedStyle}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        >
          <View className="px-[22px] pt-4">
            <AppText variant="bold" className="text-[22px] leading-[35px] text-app-navy">
              {topic.title}
            </AppText>
            <AppText className="mt-2 text-[13.5px] leading-6 text-app-textSoft">
              {topic.description}
            </AppText>

            <View className="mt-6 gap-2.5">
              {topic.items.map((item) => {
                const ItemIcon = resolveIcon(item.icon);
                return (
                  <View
                    key={item.code}
                    className="flex-row items-start gap-3 rounded-[18px] border border-app-lineSoft bg-app-surface p-4"
                    style={{ flexDirection: rowDir }}
                  >
                    <View className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-app-surfaceAlt">
                      <ItemIcon size={20} color={accentColor} strokeWidth={2.5} />
                    </View>
                    <View className="flex-1 gap-1" style={{ minWidth: 0 }}>
                      <AppText variant="bold" className="text-[14px] text-app-navy">
                        {item.title}
                      </AppText>
                      <AppText className="text-[12.5px] leading-5 text-app-textSoft">
                        {item.description}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
