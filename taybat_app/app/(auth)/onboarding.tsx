import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Image, Platform, Pressable, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';

import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components/common/AppText';
import { useAppStore } from '@/stores/app.store';

const onboarding1_img = require('../../assets/images/onboarding1_woman_listen.png');
const onboarding2_img = require('../../assets/images/onboarding2_woman_heart.png');
const onboarding3_img = require('../../assets/images/onboarding3_man_wellness.jpg');
const onboarding4_img = require('../../assets/images/onboarding4_family.png');



type SlideId = 'onboarding1' | 'onboarding2' | 'onboarding3' | 'welcome';

type Slide = {
  id: SlideId;
};

const slides: Slide[] = [
  { id: 'onboarding1' },
  { id: 'onboarding2' },
  { id: 'onboarding3' },
  { id: 'welcome' },
];

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const language = useAppStore((s) => s.language);
  const listRef = React.useRef<FlatList<Slide>>(null);
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
  }, [activeIndex]);

  const renderFeatureRow = React.useCallback(
    (params: { icon: IconName; text: string }, key: string) => {
      return (
        <View
          key={key}
          className={`w-full items-center gap-3 rounded-xl bg-app-surface px-4 py-3 ${
            shouldReverseFeatureRow ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <View className="h-8 w-8 items-center justify-center rounded-full bg-app-primary/10">
            <MaterialCommunityIcons name={params.icon} size={18} color={theme.colors.primary} />
          </View>
          <AppText className="flex-1 text-[13px] leading-5 text-app-text">{params.text}</AppText>
        </View>
      );
    },
    [shouldReverseFeatureRow, theme.colors.primary],
  );

  const renderSlideShell = React.useCallback(
    (params: {
      imageSource: ImageSourcePropType;
      title: string;
      description: string;
      features?: { icon: IconName; text: string }[];
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
          if (item.id === 'onboarding1') {
            return renderSlideShell({
              imageSource: onboarding1_img,
              title: t('onboarding_1_title'),
              description: t('onboarding_1_description'),
              features: [
                { icon: 'check-circle', text: t('onboarding_1_feature_1') },
                { icon: 'check-circle', text: t('onboarding_1_feature_2') },
                { icon: 'check-circle', text: t('onboarding_1_feature_3') },
              ],
            });
          }
          if (item.id === 'onboarding2') {
            return renderSlideShell({
              imageSource: onboarding2_img,
              title: t('onboarding_2_title'),
              description: t('onboarding_2_description'),
              features: [
                { icon: 'check-bold', text: t('onboarding_2_feature_1') },
                { icon: 'check-bold', text: t('onboarding_2_feature_2') },
                { icon: 'check-bold', text: t('onboarding_2_feature_3') },
              ],
            });
          }
          if (item.id === 'onboarding3') {
            return renderSlideShell({
              imageSource: onboarding3_img,
              title: t('onboarding_3_title'),
              description: t('onboarding_3_description'),
              features: [
                { icon: 'check-bold', text: t('onboarding_3_feature_1') },
                { icon: 'check-bold', text: t('onboarding_3_feature_2') },
                { icon: 'check-bold', text: t('onboarding_3_feature_3') },
              ],
            });
          }
          return renderSlideShell({
            imageSource: onboarding4_img,
            title: t('welcome_title'),
            description: t('welcome_description'),
            features: [
              { icon: 'silverware-fork-knife', text: `${t('welcome_card_1_title')}\n${t('welcome_card_1_desc')}` },
              { icon: 'brain', text: `${t('welcome_card_2_title')}\n${t('welcome_card_2_desc')}` },
              { icon: 'account-group', text: `${t('welcome_card_3_title')}\n${t('welcome_card_3_desc')}` },
            ],
            footer: (
              <View className="gap-3">
                <Pressable
                  onPress={() => router.replace('/(main)')}
                  className="h-12 w-full items-center justify-center rounded-xl border-2 border-app-muted/30 bg-transparent"
                >
                  <AppText variant="semibold" className="text-[16px] text-app-primary">
                    {t('welcome_login')}
                  </AppText>
                </Pressable>
              </View>
            ),
          });
        }}
      />
    </SafeAreaView>
  );
}
