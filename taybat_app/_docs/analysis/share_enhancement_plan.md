# Share Content Enhancement — Technical Plan

**Date:** 2026-06-20
**Scope:** Unify and expand all `Share.share()` entry points in the Al-Tayebat app with richer static + dynamic marketing copy, in Arabic, while keeping the share mechanism itself unchanged (`react-native` `Share` API).

---

## 1. Audit — Current Share Surfaces

A full scan (`grep` for `Share.share`, `expo-sharing`, `Share2` icon, `شارك`/`مشاركة`) found **two** functional share actions and **two** already-modeled-but-unimplemented ones (point rules exist in the DB but no UI triggers them).

### 1.1 Implemented

| # | File | Trigger | Current message | Points event |
|---|---|---|---|---|
| 1 | [app/(main)/meal-detail.tsx:96-107](../../app/(main)/meal-detail.tsx#L96-L107) | Share icon in meal detail header + footer button | `` `وجبة ${meal.name} من نظام الطيّبات - ${zoneMeta.emoji} منطقة ${zoneMeta.label}` `` | `recordEvent('supporter', 'share_meal', ..., 'meal', meal.id)` — **only** if `result.action === Share.sharedAction` |
| 2 | [components/community/PostCard.tsx:71-83](../../components/community/PostCard.tsx#L71-L83) | Share2 icon in post action row | `${author_name}\n\n${content}` + `image_url` + `link_url` (joined by `\n\n`) | `recordEvent('supporter', 'share_post', ..., 'post', post.id)` — **unconditional**, fires even if the user cancels the share sheet |

  ⚠️ **Root cause of the "share turns into an image" report:** `parts.push(post.image_url)` appends the **raw Supabase Storage image URL** directly into the `message` string passed to `Share.share()`. Target apps (WhatsApp, iMessage, Telegram, etc.) detect a bare image URL inside shared text and **unfurl it into a rich image-link preview**, visually replacing the text content with an image card. The fix (§4.2/§4.3 below) is to **never put `post.image_url` (or any other bare URL except the deliberate footer `url_web`) inside the shared text** — the topic builder for posts must stay pure text.

### 1.2 Modeled but not wired to any UI (gap)

These `PointEventActionKey` values and `membership_point_rules` rows already exist (verified live in Supabase: `share_stats` → 8 pts, `share_topic` → 5 pts, both `supporter` track, `is_active = true`) but **no screen calls them**:

| Action key | Likely source screen | Notes |
|---|---|---|
| `share_stats` | [app/(main)/stats.tsx](../../app/(main)/stats.tsx) | Weekly rating screen has `health_score` / `adherence_score` (see `UserRating` in [types/index.ts:93](../../types/index.ts#L93)) — natural content for a "my health score this week" share |
| `share_topic` | [app/(main)/topic-detail.tsx](../../app/(main)/topic-detail.tsx) | `LibraryTopic.title` / `description` ([types/index.ts:121](../../types/index.ts#L121)) — natural content for "did you know" educational shares |

### 1.3 Day-streak content already exists, but isn't shareable

[components/home/CommitmentCard.tsx:134](../../components/home/CommitmentCard.tsx#L134) already renders **"اليوم {N} من رحلتك"** (day N of your journey) on the home screen, computed via `daysOnPlan()` in [app/(main)/index.tsx:213](../../app/(main)/index.tsx#L213). This is exactly the "day_no" milestone the product wants to share — there is currently no share button attached to it at all. This is the highest-value gap to close.

### 1.4 Inconsistencies found during the audit

- **Post share unintentionally becomes an image share**: see the root-cause callout under §1.1 row 2 — `post.image_url` embedded in the message text gets unfurled into an image card by most messaging apps. **Required fix, not optional**: the post topic builder must only ever use `author_name` + `content` (plain text), never `image_url` or `link_url`.
- **Unconditional point award**: `PostCard.handleShare` calls `recordEvent` regardless of whether `Share.share()` actually completed (no `result.action` check), unlike `meal-detail.tsx` which checks correctly. Should be fixed when this is refactored into a shared utility.
- **No i18n**: all current share strings are hardcoded Arabic literals in the component, bypassing `useTranslation()` (project convention per `CLAUDE.md`). Acceptable today since the app is Arabic-only, but the new shared builder should still centralize strings in one place so they can move to `localization/translations/*.json` later without touching call sites.
- **No app/website link or hashtags in any share message today.** This is the main marketing gap this plan addresses.

---

## 2. New Config Inputs (already added to `public_config`)

Two keys were added to Supabase `public_config` to support this feature, sourced at runtime so marketing copy/links can change without an app release:

| key | value | purpose |
|---|---|---|
| `url_web` | `https://al-tayabat.com` | Canonical link appended to every share message |
| `community_hash_tags` | `#الطيبات,#نظام_الطيبات,#حياة_صحية` | CSV of hashtags appended to every share message |

These are **not yet wired into the app's typed config layer** ([repositories/publicConfig](../../repositories/publicConfig)) — see §4.1.

---

## 3. Goals

1. Every share message — **with no exception** — is composed of exactly **three parts, in this order**:

   | Part | Scope | Content |
   | --- | --- | --- |
   | **Header** | Universal — identical structure on every share, regardless of content type | `"اليوم {day_no} في رحلتي مع تطبيق الطيبات 🌿"` — day count computed from `user.plan_start_date` via the existing `daysOnPlan()` helper |
   | **Topic** | Per content type — the only part that varies between meal / post / stats / topic / streak shares | The dynamic line(s) specific to what's being shared (meal name, post text, health score, topic tip, streak caption) |
   | **Footer** | Universal — identical structure on every share | Hashtags line + website URL, both read from `public_config` (`community_hash_tags`, `url_web`) via `getShareConfig()` |

   This confirms the requested scope: **header (day-in-journey) + topic (type-specific) + footer (hashtags + url from config)** applies to *all* share surfaces — meal, post, stats, topic, and the new streak share — not just the day-streak one. See §4.2 for the composition function and §5 for the full assembled examples.
2. Add a share action to the two **unimplemented** points hooks (`share_stats`, `share_topic`) and the **new** day-streak milestone share, instead of leaving the DB rules orphaned.
3. Centralize message composition (header + footer) so hashtags/link/day-line changes apply everywhere without touching individual screens.
4. Fix the unconditional point-award bug in `PostCard` while touching this code.
5. Keep the underlying share mechanism (`react-native` `Share.share`) — no new native dependency needed for this phase.
6. **All shared messages must render as plain text in the recipient's share sheet** — no message may contain a bare URL other than the deliberate footer `url_web` link, since target apps unfurl bare URLs into rich image/link cards (this is what caused post sharing to render as an image instead of text — see §1.1/§1.4). `post.image_url` and `post.link_url` are excluded from the post topic builder for this reason.

---

## 4. Implementation Plan

### 4.1 Extend `publicConfig` repository

Add a second typed getter alongside `getNotificationConfig()`:

```ts
// IPublicConfigRepository.ts
export interface ShareConfig {
  webUrl: string;
  hashtags: string[]; // parsed from CSV
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  webUrl: 'https://al-tayabat.com',
  hashtags: ['#الطيبات', '#نظام_الطيبات', '#حياة_صحية'],
};

export interface IPublicConfigRepository {
  getNotificationConfig(): Promise<NotificationConfig>;
  getShareConfig(): Promise<ShareConfig>;
}
```

`PublicConfigRepositorySupabase.getShareConfig()` reads `key in ('url_web', 'community_hash_tags')` (no prefix filter needed since these aren't `app_%`-namespaced) and splits `community_hash_tags` on `,`, trimming whitespace. `PublicConfigRepositoryMock` returns `DEFAULT_SHARE_CONFIG`.

### 4.2 New shared module: `services/sharing/` — header + topic + footer composition

Mirrors the existing `services/notifications/` pattern (stateless, no Zustand dependency, called by stores/screens). The module owns **header** and **footer** composition centrally; call sites only ever supply the **topic** line(s).

```ts
// services/sharing/index.ts
export interface ShareResult { shared: boolean }

// ── Header — universal, identical on every share type ──────────────────────
function buildHeader(dayNo: number): string {
  return `اليوم ${toArabicNumerals(dayNo)} في رحلتي مع تطبيق الطيبات 🌿`;
}

// ── Footer — universal, sourced from public_config ──────────────────────────
function buildFooter(config: ShareConfig): string {
  return [config.hashtags.join(' '), config.webUrl].join('\n');
}

// ── Composition — header + topic + footer, always in this order ────────────
export function buildShareMessage(topic: string, dayNo: number, config: ShareConfig): string {
  return [buildHeader(dayNo), topic, buildFooter(config)].filter(Boolean).join('\n\n');
}

export async function shareContent(topic: string, dayNo: number, config: ShareConfig): Promise<ShareResult> {
  const message = buildShareMessage(topic, dayNo, config);
  const result = await Share.share({ message });
  return { shared: result.action === Share.sharedAction };
}
```

Content-specific builder functions return **only the topic line(s)** — never the header or footer, so every call site is structurally forced into the 3-part template (pure functions, easy to unit-test, no React):

```ts
export function buildDayStreakTopic(): string {
  return 'ملتزم بنظام صحي متوازن خطوة بخطوة! 💪';
}

// Zone color is deliberately excluded — meal sharing is name-only.
export function buildMealTopic(mealName: string): string {
  return `سجّلت وجبة "${mealName}" اليوم 🍽️`;
}

// Deliberately takes ONLY authorName + content — never post.image_url or
// post.link_url. Embedding a bare URL in the shared text causes WhatsApp/
// iMessage/Telegram to unfurl it into a rich image/link card, turning a
// text share into an image share (the bug this plan fixes — see §1.4).
export function buildPostTopic(authorName: string, content: string): string {
  return `${authorName} يشارك من عائلة الطيبات:\n\n"${content}"`;
}

export function buildStatsTopic(healthScore: number, weekLabel: string): string {
  return `نتيجتي الصحية هذا الأسبوع (${weekLabel}): ${healthScore}/10 🌟`;
}

export function buildTopicTopic(title: string, description: string): string {
  return `هل تعلم؟ 💡 ${title}\n${description}`;
}
```

Every screen calls `shareContent(buildXTopic(...), dayNo, shareConfig)` then conditionally records the matching `PointEventActionKey` based on `result.shared` — fixing the §1.4 bug as a side effect, since the check becomes mandatory at the call site. `dayNo` is computed the same way everywhere via the existing `daysOnPlan(user.plan_start_date)` helper — no new state needed, every screen already has access to `useUserStore`.

`shareConfig` itself is loaded once (e.g. into `notificationSettings.store.ts`-style small store, or simply fetched via `publicConfigRepository.getShareConfig()` on each screen mount with a short in-repo cache — consistent with [[project_supabase_free_tier_budget]] budget concerns: this is a tiny, rarely-changing table, so a 1-hour client cache is enough; no need for the 5-min/90-day windows that apply to `user_meals`).

### 4.3 Wire into existing screens

- **`meal-detail.tsx`**: replace inline `handleShare` body with `shareContent(buildMealTopic(...), dayNo, shareConfig)`; keep existing `result.shared` → `recordEvent('share_meal')` gating (already correct here). This **adds** the header (day count) and footer (hashtags/url) that today's message is missing entirely.
- **`PostCard.tsx`**: replace inline `handleShare` with `shareContent(buildPostTopic(post.author_name, post.content), dayNo, shareConfig)`. Three fixes bundled here:
  1. **Drop `post.image_url` and `post.link_url` from the shared message entirely** — this is the required fix for the "share turns into an image" report (root cause in §1.1/§1.4).
  2. Add the missing `result.shared` check before `recordEvent('share_post')` (point-award bug fix).
  3. Gains the header/footer that today's message has none of.

### 4.4 New share triggers

All three use the same `shareContent(topic, dayNo, shareConfig)` entry point — only the `topic` builder differs.

- **Day-streak (highest priority — content already exists, zero net-new data needed)**: add a small share icon/button to `CommitmentCard.tsx`'s day-counter pill (or a dedicated button below it). On press: `shareContent(buildDayStreakTopic(), dayNumber, shareConfig)` → on success, `recordEvent('supporter', 'share_topic'...)` — **decision needed**: there's no `share_streak` action key today; either (a) reuse `share_stats` (closest semantic match — a personal-progress share) or (b) add a new `share_streak` key + DB rule via migration. Recommend (b) for clean analytics, but (a) ships faster with zero schema change. Note the header already states the day number, so `buildDayStreakTopic()` deliberately does **not** repeat it — the topic line is just a short motivational caption.
- **Weekly stats (`stats.tsx`)**: add a share button near the rating summary, using `shareContent(buildStatsTopic(latestRating.health_score, weekLabel), dayNo, shareConfig)` → `recordEvent('supporter', 'share_stats', ..., 'stat', rating.id)`.
- **Topic detail (`topic-detail.tsx`)**: add a share button on the topic header, using `shareContent(buildTopicTopic(topic.title, topic.description), dayNo, shareConfig)` → `recordEvent('supporter', 'share_topic', ..., 'topic', topic.id)`.

### 4.5 Out of scope for this phase

- Rich/branded image share cards (would need `react-native-view-shot` or server-rendered OG images) — flagged as a fast-follow, not required to ship the copy/hashtag improvements.
- Per-platform message variants (X/Twitter character limits, etc.) — `Share.share()` uses the OS share sheet, which already picks the right target app; no per-network branching needed.
- Localizing share strings into `ar.json`/`en.json` — deferred since the app is Arabic-only today; the builder functions in `services/sharing/` already isolate the strings in one file for an easy future move.

---

## 5. Arabic Share-Text Suggestions (marketing-enhanced)

Every example below is broken into its **Header / Topic / Footer** parts to make the 3-part scope explicit — exactly what `buildShareMessage()` assembles. Header and Footer are byte-for-byte identical across all five types; only Topic changes.

### 5.1 Day streak (`CommitmentCard` → home)

- **Header:** `اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿`
- **Topic:** `ملتزم بنظام صحي متوازن خطوة بخطوة! 💪`
- **Footer:** `#الطيبات #نظام_الطيبات #حياة_صحية` / `https://al-tayabat.com`

```
اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿

ملتزم بنظام صحي متوازن خطوة بخطوة! 💪

#الطيبات #نظام_الطيبات #حياة_صحية
https://al-tayabat.com
```

### 5.2 Meal logged (`meal-detail.tsx`)

Zone color is deliberately excluded from meal sharing — name-only.

- **Header:** `اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿`
- **Topic:** `سجّلت وجبة "شوربة العدس" اليوم 🍽️`
- **Footer:** `#الطيبات #نظام_الطيبات #حياة_صحية` / `https://al-tayabat.com`

```text
اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿

سجّلت وجبة "شوربة العدس" اليوم 🍽️

#الطيبات #نظام_الطيبات #حياة_صحية
https://al-tayabat.com
```

### 5.3 Community post (`PostCard.tsx`)

- **Header:** `اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿`
- **Topic:** `سارة تشارك من عائلة الطيبات:\n\n"أسبوعي الثاني وأنا أشعر بفرق حقيقي في طاقتي اليومية 💪"`
- **Footer:** `#الطيبات #نظام_الطيبات #حياة_صحية` / `https://al-tayabat.com`

```
اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿

سارة تشارك من عائلة الطيبات:

"أسبوعي الثاني وأنا أشعر بفرق حقيقي في طاقتي اليومية 💪"

#الطيبات #نظام_الطيبات #حياة_صحية
https://al-tayabat.com
```

### 5.4 Weekly health score (`stats.tsx` — new)

- **Header:** `اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿`
- **Topic:** `نتيجتي الصحية هذا الأسبوع: ٨/١٠ 🌟`
- **Footer:** `#الطيبات #نظام_الطيبات #حياة_صحية` / `https://al-tayabat.com`

```
اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿

نتيجتي الصحية هذا الأسبوع: ٨/١٠ 🌟

#الطيبات #نظام_الطيبات #حياة_صحية
https://al-tayabat.com
```

### 5.5 Topic / educational tip (`topic-detail.tsx` — new)

- **Header:** `اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿`
- **Topic:** `هل تعلم؟ 💡 الزون الأحمر يشمل أطعمة ممنوعة تماماً حتى كمكوّن فرعي\nتطبيق الطيبات يشرح نظام الخمس مناطق الغذائي بشكل مبسّط لكل حالة`
- **Footer:** `#الطيبات #نظام_الطيبات #حياة_صحية` / `https://al-tayabat.com`

```
اليوم ٧ في رحلتي مع تطبيق الطيبات 🌿

هل تعلم؟ 💡 الزون الأحمر يشمل أطعمة ممنوعة تماماً حتى كمكوّن فرعي
تطبيق الطيبات يشرح نظام الخمس مناطق الغذائي بشكل مبسّط لكل حالة

#الطيبات #نظام_الطيبات #حياة_صحية
https://al-tayabat.com
```

---

## 6. Implementation Order

1. `repositories/publicConfig`: add `ShareConfig` type + `getShareConfig()` to interface, mock, and Supabase implementations.
2. Create `services/sharing/index.ts` with the header/footer composition (`buildShareMessage()`, `shareContent()`) + the five `buildXTopic()` builders.
3. Refactor `meal-detail.tsx` and `PostCard.tsx` to use the new shared module (fixes the unconditional-points bug in `PostCard` as part of the refactor).
4. Decide `share_streak` vs. reusing `share_stats` for the day-counter share (see §4.4) — if new key, add a migration seeding `membership_point_rules` + extend `PointEventActionKey` in `types/index.ts`.
5. Add the day-streak share button to `CommitmentCard.tsx` (highest priority, no new data needed).
6. Add share buttons to `stats.tsx` (weekly score) and `topic-detail.tsx` (educational tip), wiring the already-existing `share_stats`/`share_topic` point rules.
7. Manual test on a dev build: verify share sheet content, verify points are awarded only on actual share (not cancel), verify hashtags/link come from `public_config` (change `url_web` in Supabase, confirm app reflects it after cache expiry/restart).

---

## 7. Open Questions for Product

- Should hashtags be randomized/rotated per share (e.g. pick 2 of N from a larger pool) for organic-looking posts, or always the same fixed 3? Current `community_hash_tags` value is a fixed CSV — rotation would need either a larger stored pool or client-side variation logic.
- New `share_streak` action key (clean analytics) vs. reusing `share_stats` (no schema change) — see §4.4.
- Should the day-streak share be gated behind a minimum streak (e.g. only show the share button from day 3+) to avoid low-value "day 1" shares?
