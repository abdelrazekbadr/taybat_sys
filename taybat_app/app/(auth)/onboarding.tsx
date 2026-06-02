import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Image, Platform, Pressable, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';

import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components/common/AppText';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import { useAppStore } from '@/stores/app.store';
import slidesJson from '@/data/onboarding/onboardingSlides.json';

const onboarding1_img = require('../../assets/images/onboarding1_woman_listen.png');
const onboarding2_img = require('../../assets/images/onboarding2_woman_heart.png');
const onboarding3_img = require('../../assets/images/onboarding3_man_wellness.jpg');
const onboarding4_img = require('../../assets/images/onboarding4_family.png');

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type SlideImageKey = 'onboarding1' | 'onboarding2' | 'onboarding3' | 'welcome';

type LocalizedText = {
  ar: string;
  en: string;
};

type SlideFeature = {
  icon: IconName;
  tone?: 'default' | 'error';
  text: LocalizedText;
};

type SlideFooter = {
  action: 'login';
  label: LocalizedText;
  route: '/(main)';
};

type SlideConfig = {
  id: SlideImageKey;
  image: SlideImageKey;
  title: LocalizedText;
  description: LocalizedText;
  features?: SlideFeature[];
  footer?: SlideFooter;
};

function resolveLocalizedText(value: LocalizedText, language: string) {
  return language === 'ar' ? value.ar : value.en;
}

function resolveSlideImage(key: SlideImageKey): ImageSourcePropType {
  switch (key) {
    case 'onboarding1':
      return onboarding1_img;
    case 'onboarding2':
      return onboarding2_img;
    case 'onboarding3':
      return onboarding3_img;
    case 'welcome':
      return onboarding4_img;
  }
}

function withAlpha(color: string, alpha: number) {
  const clamped = Math.max(0, Math.min(1, alpha));
  const value = color.trim();

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => `${c}${c}`)
            .join('')
        : hex.length >= 6
          ? hex.slice(0, 6)
          : '';
    if (normalized.length === 6) {
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${clamped})`;
    }
  }

  const rgbMatch = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${clamped})`;
  }

  return value;
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const language = useAppStore((s) => s.language);
  const listRef = React.useRef<FlatList<SlideConfig>>(null);
  const slides = React.useMemo(() => slidesJson as unknown as SlideConfig[], []);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const shouldRTL = language === 'ar';
  const shouldInvertSwipe = shouldRTL && Platform.OS === 'ios';
  const shouldReverseFeatureRow = shouldRTL && Platform.OS === 'ios';
  const invertRef = React.useRef(false);
  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 });
  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      const rawIndex = viewableItems.find((v) => typeof v.index === 'number')?.index;
      if (typeof rawIndex !== 'number') {
        return;
      }

      const mappedIndex = invertRef.current ? slides.length - 1 - rawIndex : rawIndex;
      const nextIndex = Math.max(0, Math.min(slides.length - 1, mappedIndex));
      setActiveIndex(nextIndex);
    },
  );

  React.useEffect(() => {
    invertRef.current = shouldInvertSwipe;
  }, [shouldInvertSwipe]);

  const renderProgressDots = React.useCallback(() => {
    return (
      <View className="flex-row items-center justify-center gap-2">
        {slides.map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <View
              key={idx}
              className={`${isActive ? 'w-8 bg-app-primary' : 'w-2 bg-app-muted'} h-2 rounded-full`}
            />
          );
        })}
      </View>
    );
  }, [activeIndex, slides]);

  const renderFeatureRow = React.useCallback(
    (params: { icon: IconName; text: string; tone?: 'default' | 'error' }, key: string) => {
      const isError = params.tone === 'error';
      const iconColor = isError ? theme.colors.error : theme.colors.primary;
      const iconBgColor = withAlpha(iconColor, 0.14);
      const textColor = isError ? theme.colors.error : theme.colors.onSurface;
      return (
        <View
          key={key}
          className={`w-full items-center gap-3 rounded-xl bg-app-surface px-4 py-3 ${
            shouldReverseFeatureRow ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: iconBgColor }}>
            <MaterialCommunityIcons name={params.icon} size={18} color={iconColor} />
          </View>
          <AppText className="flex-1 text-[13px] leading-5 text-app-text" style={{ color: textColor }}>
            {params.text}
          </AppText>
        </View>
      );
    },
    [
      shouldReverseFeatureRow,
      theme.colors.error,
      theme.colors.onSurface,
      theme.colors.primary,
    ],
  );

  const renderSlideShell = React.useCallback(
    (params: {
      imageSource: ImageSourcePropType;
      title: string;
      description: string;
      features?: { icon: IconName; text: string; tone?: 'default' | 'error' }[];
      headerLeft?: React.ReactNode;
      headerRight?: React.ReactNode;
      footer?: React.ReactNode;
    }) => {
      return (
        <View style={{ width }} className="flex-1 bg-app-background px-6">
          <View className="pt-6">
            <View className="flex-row items-center justify-between">
              {params.headerLeft ?? <View className="w-12" />}
              {params.headerRight ?? <View className="w-12" />}
            </View>
          </View>

          <View className="flex-1 pt-4">
            <View className="items-center">
              <View className="h-48 w-full max-w-sm overflow-hidden rounded-3xl bg-app-card">
                <Image source={params.imageSource} className="h-full w-full" resizeMode="cover" fadeDuration={0} />
              </View>

              <View className="mt-4 w-full max-w-xl">
                <AppText variant="bold" className="text-[24px] tracking-tight text-app-text">
                  {params.title}
                </AppText>
                <AppText className="mt-2 text-[14px] leading-6 text-app-muted">{params.description}</AppText>

                {params.features?.length ? (
                  <View className="mt-5 gap-3">
                    {params.features.map((f, idx) => renderFeatureRow(f, `${f.icon}-${idx}`))}
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="pb-8 pt-4">
            {renderProgressDots()}
            {params.footer ? <View className="mt-4">{params.footer}</View> : null}
          </View>
        </View>
      );
    },
    [renderFeatureRow, renderProgressDots, width],
  );

  return (
    <SafeAreaView className="flex-1 bg-app-background" edges={['top', 'bottom']}>
      <FlatList
        key={shouldInvertSwipe ? 'rtl-inverted-v2' : 'ltr-normal-v2'}
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        removeClippedSubviews={false}
        inverted={shouldInvertSwipe}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        onMomentumScrollEnd={(event) => {
          const rawIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          const mappedIndex = shouldInvertSwipe ? slides.length - 1 - rawIndex : rawIndex;
          const nextIndex = Math.max(0, Math.min(slides.length - 1, mappedIndex));
          setActiveIndex(nextIndex);
        }}
        renderItem={({ item }) => {
          return renderSlideShell({
            imageSource: resolveSlideImage(item.image),
            title: resolveLocalizedText(item.title, language),
            description: resolveLocalizedText(item.description, language),
            features: item.features?.map((f) => ({
              icon: f.icon,
              tone: f.tone,
              text: resolveLocalizedText(f.text, language),
            })),
            footer:
              item.footer?.action === 'login' ? (
                <View className="gap-3">
                  <Pressable
                    onPress={async () => {
                      await storageService.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
                      router.replace('/(auth)/login' as never);
                    }}
                    className="h-12 w-full items-center justify-center rounded-xl border-2 border-app-muted/30 bg-transparent"
                  >
                    <AppText variant="semibold" className="text-[16px] text-app-primary">
                      {resolveLocalizedText(item.footer.label, language)}
                    </AppText>
                  </Pressable>
                </View>
              ) : null,
          });
        }}
      />
    </SafeAreaView>
  );
}
