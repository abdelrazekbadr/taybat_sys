import { BadgeCheck, BarChart2, Clock, Heart, Star, Trophy, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PREVIEW_CARDS = [
  { icon: Users,      label: 'المستخدمون\nالنشطون',      color: '#10B981' },
  { icon: Heart,      label: 'متوسط\nالالتزام',          color: '#F43F5E' },
  { icon: BarChart2,  label: 'مؤشرات\nالصحة',            color: '#06B6D4' },
  { icon: BadgeCheck, label: 'الأعضاء\nالملتزمون',       color: '#8B5CF6' },
  { icon: Star,       label: 'الأعضاء\nالداعمون',        color: '#F59E0B' },
  { icon: Trophy,     label: 'لوحة\nالشرف',              color: '#EC4899' },
] as const;

export function CommunityStatsTab() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: insets.bottom + 120,
        gap: 20,
      }}
    >
      {/* ── Hero card ── */}
      <LinearGradient
        colors={['#10B981', '#06B6D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 28, alignItems: 'center' }}
      >
        {/* Decorative rings */}
        <View style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <View style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)' }} />

        <View
          style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: 'rgba(255,255,255,0.22)',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Clock size={30} color="#fff" strokeWidth={1.8} />
        </View>

        <AppText variant="bold" style={{ fontSize: 22, color: '#fff', textAlign: 'center', lineHeight: 32 }}>
          لوحة المعلومات
        </AppText>

        <View
          style={{
            marginTop: 8,
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 5,
          }}
        >
          <AppText variant="semibold" style={{ fontSize: 12, color: '#fff', letterSpacing: 0.3 }}>
            قريباً بعد المرحلة التجريبية
          </AppText>
        </View>

        <AppText style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, marginTop: 14 }}>
          إحصائيات دورية مجمّعة من الأعضاء الملتزمين بالنظام الغذائي
        </AppText>
      </LinearGradient>

      {/* ── Preview section label ── */}
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.outlineVariant }} />
        <AppText variant="semibold" style={{ fontSize: 11.5, color: theme.colors.onSurfaceVariant }}>
          ما ستجده هنا
        </AppText>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.outlineVariant }} />
      </View>

      {/* ── Preview cards grid (3 × 2) ── */}
      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 }}>
        {PREVIEW_CARDS.map(({ icon: Icon, label, color }) => (
          <View
            key={label}
            style={{
              flex: 1,
              minWidth: '28%',
              aspectRatio: 1,
              borderRadius: 18,
              backgroundColor: theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: theme.colors.outlineVariant,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 40, height: 40, borderRadius: 14,
                backgroundColor: `${color}18`,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon size={19} color={color} strokeWidth={2} />
            </View>
            <AppText
              variant="semibold"
              style={{ fontSize: 11, color: theme.colors.onSurface, textAlign: 'center', lineHeight: 17 }}
            >
              {label}
            </AppText>
          </View>
        ))}
      </View>

      {/* ── Thank-you footer ── */}
      <View
        style={{
          borderRadius: 18,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          paddingHorizontal: 20,
          paddingVertical: 16,
          alignItems: 'center',
          gap: 4,
        }}
      >
        <AppText style={{ fontSize: 18 }}>💚</AppText>
        <AppText
          variant="semibold"
          style={{ fontSize: 13, color: theme.colors.onSurface, textAlign: 'center', lineHeight: 22 }}
        >
          شكراً لتعاونكم ودعمكم
        </AppText>
        <AppText
          style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 }}
        >
          معاً نعمّم نهجاً غذائياً صحياً للمجتمع
        </AppText>
      </View>
    </ScrollView>
  );
}
