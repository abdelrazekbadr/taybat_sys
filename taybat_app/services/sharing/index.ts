import { Share } from 'react-native';

import { publicConfigRepository } from '@/repositories/publicConfig';
import type { ShareConfig } from '@/repositories/publicConfig';
import { toArabicNumerals } from '@/utils/zoneUtils';

export interface ShareResult {
  shared: boolean;
}

// ─── Config cache (public_config rarely changes — 1h TTL is plenty) ─────────

const CACHE_TTL_MS = 60 * 60 * 1000;
let cachedConfig: ShareConfig | null = null;
let cachedAt = 0;

async function getShareConfig(): Promise<ShareConfig> {
  if (cachedConfig && Date.now() - cachedAt < CACHE_TTL_MS) return cachedConfig;
  cachedConfig = await publicConfigRepository.getShareConfig();
  cachedAt = Date.now();
  return cachedConfig;
}

// ─── Header — universal, identical on every share type ──────────────────────

function buildHeader(dayNo: number): string {
  return `اليوم ${toArabicNumerals(dayNo)} في رحلتي مع تطبيق الطيبات 🌿`;
}

// ─── Footer — universal, hashtags + link sourced from public_config ─────────
// community_hash_tags is stored as a single comma-separated string — already
// flattened into ShareConfig.hashtags (string[]) by the repository layer.

function buildFooter(config: ShareConfig): string {
  return [config.hashtags.join(' '), config.webUrl].join('\n');
}

// ─── Composition — header + topic + footer, always in this order ───────────

export function buildShareMessage(topic: string, dayNo: number, config: ShareConfig): string {
  return [buildHeader(dayNo), topic, buildFooter(config)].filter(Boolean).join('\n\n');
}

/**
 * Single entry point for every share action in the app. Fetches (cached)
 * footer config, assembles header + topic + footer, and opens the OS share
 * sheet. Returns whether the user actually completed the share (vs. cancelled)
 * so callers can gate point-award events correctly.
 */
export async function shareContent(topic: string, dayNo: number): Promise<ShareResult> {
  const config = await getShareConfig();
  const message = buildShareMessage(topic, dayNo, config);
  const result = await Share.share({ message });
  return { shared: result.action === Share.sharedAction };
}

// ─── Topic builders — return ONLY the type-specific line(s), never header/footer ─

export function buildDayStreakTopic(): string {
  return 'ملتزم بنظام صحي متوازن خطوة بخطوة! 💪';
}

export function buildMealTopic(mealName: string): string {
  return `سجّلت وجبة "${mealName}" اليوم 🍽️`;
}

export function buildFastingTopic(): string {
  return 'الحمد لله، حافظت على صيامي اليوم 🌙';
}

// Deliberately takes ONLY authorName + content — never post.image_url or
// post.link_url. Embedding a bare URL in the shared text causes WhatsApp/
// iMessage/Telegram to unfurl it into a rich image/link card, turning a
// text share into an image share.
export function buildPostTopic(authorName: string, content: string): string {
  return `${authorName} يشارك من عائلة الطيبات:\n\n"${content}"`;
}

export function buildStatsTopic(healthScore: number, weekLabel: string): string {
  return `نتيجتي الصحية هذا الأسبوع (${weekLabel}): ${healthScore}/10 🌟`;
}

export function buildTopicTopic(title: string, description: string): string {
  return `هل تعلم؟ 💡 ${title}\n${description}`;
}
