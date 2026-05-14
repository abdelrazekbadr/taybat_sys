# Community Screen — Design & Implementation Plan

## Overview

The Community screen ("عائلة الطيبات") is the social layer of the app. It is accessed via a bottom tab bar item labeled **"عائلتنا"**. The screen has two badge-style tab buttons: **المنشورات** (posts feed) and **إحصاءات المجتمع** (community stats charts).

This plan covers **Phase 1 only** (system-user posts), but the data model and architecture are designed to support all three phases without schema migration.

---

## Phase Roadmap (for architecture decisions)

| Phase | Who posts | Content | Status |
|---|---|---|---|
| 1 | System user only | Admin announcements, tips, news | **Implement now** |
| 2 | Any user (automated) | Achievement unlocked, streak milestone, meal shared | Future |
| 3 | Any user (manual) | Free text posts, comments, replies | Future |

Phase 1 UI shows a feed and stats. Phase 2–3 add a composer and thread view — the data schema accommodates these without altering existing columns.

---

## Navigation

### Tab bar update

Replace the current `badges` tab with `community`. The `badges` / stats screen remains accessible from the Home `pendingRating` banner card (no dedicated tab needed in Phase 1).

**New tab config (`AppTabBar.tsx`):**

| RTL order | key | label | icon |
|---|---|---|---|
| 1 | `home` | الرئيسية | `House` |
| 2 | `library` | المكتبة | `BookOpen` |
| 3 | `add` | — | `HandPlatter` (center FAB) |
| 4 | `community` | عائلتنا | `Users` |
| 5 | `account` | حسابي | `User` |

Route: `router.push('/(main)/community')` on `community` tab press.

---

## Screen Layout

```
┌──────────────────────────────┐
│  Safe-area top               │
│  عائلة الطيبات               │  ← AppText bold, centered or RTL-start
├──────────────────────────────┤
│                              │
│   [ المنشورات ]  [ إحصاءات ] │  ← centered badge tab pills
│                              │
├──────────────────────────────┤
│                              │
│   < Tab 1 or Tab 2 >         │
│   (FlatList / ScrollView)    │
│                              │
├──────────────────────────────┤
│  AppTabBar  active="community"│
└──────────────────────────────┘
```

---

## Tab 1 — المنشورات (Posts Feed)

### Layout

```
┌──────────────────────────────┐
│  [PostCard]                  │
│  [PostCard]                  │
│  [PostCard]                  │
│  ...                         │
│  [ActivityIndicator]         │  ← load more spinner at bottom
└──────────────────────────────┘
```

Uses `FlatList` with `onEndReached` for cursor-based pagination.

---

### Component: `PostCard`

```
┌──────────────────────────────────┐
│  [Avatar 40px]  فريق الطيبات    │  ← author name bold
│                 منذ ٣ أيام      │  ← relative time, muted
│                                  │
│  نص المنشور هنا                  │  ← multi-line, AppText
│  يمكن أن يكون طويلاً ويُعرض     │
│  بالكامل أو مع "اقرأ أكثر"     │
│                                  │
│  ┌──────────────────────────┐   │
│  │  image (optional)        │   │  ← rounded-xl, 16:9 ratio
│  └──────────────────────────┘   │
│                                  │
│  [❤ ٢٣]  ·  [↗ مشاركة]         │  ← reaction row
└──────────────────────────────────┘
```

**Props:**
```typescript
interface PostCardProps {
  post: CommunityPost;
  isLoved: boolean;
  onLovePress: () => void;
}
```

Love button: filled heart (red) when `isLoved`, outline when not. Tap calls `toggleReaction`.

---

### Empty State — `EmptyFeed`

When no posts exist or fetch fails:

```
┌──────────────────────────────┐
│                              │
│       [Rss icon 48px]        │
│   قريباً — أول منشور في      │
│        الطريق إليك           │
│                              │
│   تابع عائلة الطيبات لتصلك   │
│   آخر الأخبار والنصائح       │
│                              │
└──────────────────────────────┘
```

---

## Tab 2 — إحصاءات المجتمع (Community Stats)

Uses `react-native-gifted-charts` (same recommendation as stats screen plan).

### Layout

```
┌──────────────────────────────┐
│  المستخدمون النشطون          │  ← section header
│  [Bar chart — 12 months]     │  ← active users per month
├──────────────────────────────┤
│  متوسط الالتزام الغذائي      │  ← section header
│  [Line chart — 12 months]    │  ← avg adherence_score per month
└──────────────────────────────┘
```

Empty state per section when `stats[]` is empty:

```
[BarChart2 icon]
قريباً — إحصاءات المجتمع
ستظهر هنا بعد أول شهر نشاط
```

---

## Data Types — `types/community.types.ts`

```typescript
export type PostType = 'system' | 'achievement' | 'meal_share' | 'user_post';
// Phase 1: only 'system' is used
// Phase 2: 'achievement' | 'meal_share' added automatically
// Phase 3: 'user_post' added

export type ReactionType = 'love';
// Extendable to 'support' | 'celebrate' in future phases

export interface CommunityPost {
  id: number;
  user_id: number;
  author_name: string;        // denormalized — avoids JOIN on every render
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  post_type: PostType;
  is_pinned: boolean;
  love_count: number;         // denormalized counter — updated via Supabase trigger
  created_at: string;         // ISO string
  updated_at: string;
}

export interface CommunityReaction {
  id: number;
  post_id: number;
  user_id: number;
  reaction_type: ReactionType;
  created_at: string;
}

export interface CommunityFollow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface CommunityStats {
  month: string;              // 'YYYY-MM'
  active_users: number;       // users who logged ≥1 meal that month
  avg_health_score: number | null;
  avg_adherence_score: number | null;
  total_meals_logged: number;
}
```

---

## Supabase Schema

### `community_posts`

```sql
CREATE TABLE community_posts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name   TEXT          NOT NULL,
  author_avatar TEXT,
  content       TEXT          NOT NULL,
  image_url     TEXT,
  post_type     TEXT          NOT NULL DEFAULT 'system'
                              CHECK (post_type IN ('system', 'achievement', 'meal_share', 'user_post')),
  is_pinned     BOOLEAN       NOT NULL DEFAULT false,
  love_count    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Index for cursor-based pagination (most common query)
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
-- Index for filtering by type (phase 2+)
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
-- Index for user's own posts (edit/delete)
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
```

### `community_reactions`

```sql
CREATE TABLE community_reactions (
  id            BIGSERIAL PRIMARY KEY,
  post_id       BIGINT        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id       BIGINT        NOT NULL REFERENCES users(id)           ON DELETE CASCADE,
  reaction_type TEXT          NOT NULL DEFAULT 'love'
                              CHECK (reaction_type IN ('love')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction_type)   -- one reaction type per user per post
);

CREATE INDEX idx_reactions_post ON community_reactions(post_id);
CREATE INDEX idx_reactions_user ON community_reactions(user_id);
```

### `community_follows`

```sql
CREATE TABLE community_follows (
  id           BIGSERIAL PRIMARY KEY,
  follower_id  BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON community_follows(follower_id);
CREATE INDEX idx_follows_following ON community_follows(following_id);
```

### `community_stats` — Materialized view (or scheduled function)

```sql
-- Refreshed nightly via Supabase scheduled function (pg_cron)
CREATE MATERIALIZED VIEW community_stats AS
SELECT
  TO_CHAR(DATE_TRUNC('month', um.date::date), 'YYYY-MM') AS month,
  COUNT(DISTINCT um.user_id)                              AS active_users,
  AVG(wr.health_score)                                   AS avg_health_score,
  AVG(wr.adherence_score)                                AS avg_adherence_score,
  COUNT(um.id)                                           AS total_meals_logged
FROM user_meals um
LEFT JOIN weekly_ratings wr
  ON wr.user_id = um.user_id
 AND TO_CHAR(DATE_TRUNC('month', wr.submitted_at), 'YYYY-MM') =
     TO_CHAR(DATE_TRUNC('month', um.date::date), 'YYYY-MM')
GROUP BY 1
ORDER BY 1 DESC;

CREATE UNIQUE INDEX ON community_stats (month);
```

### Trigger — keep `love_count` in sync

```sql
CREATE OR REPLACE FUNCTION sync_love_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET love_count = love_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET love_count = GREATEST(love_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_love_count
AFTER INSERT OR DELETE ON community_reactions
FOR EACH ROW EXECUTE FUNCTION sync_love_count();
```

### RLS Policies (Phase 1)

```sql
-- Anyone authenticated can read posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_posts" ON community_posts FOR SELECT USING (true);

-- Only system user (user_id = system user ID) can insert/update/delete
CREATE POLICY "system_write_posts" ON community_posts
  FOR ALL USING (auth.uid()::text = user_id::text AND post_type = 'system');

-- Reactions: user can only manage their own
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage_own_reactions" ON community_reactions
  FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "read_reactions" ON community_reactions FOR SELECT USING (true);
```

---

## Zustand Store — `stores/community.store.ts`

```typescript
interface CommunityState {
  posts: CommunityPost[];
  userReactions: number[];      // post IDs current user has loved (persisted)
  userFollows: number[];        // user IDs current user follows (persisted)
  stats: CommunityStats[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  cursor: string | null;        // ISO timestamp of the oldest loaded post
  errorMessage: string;

  initializeCommunity: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  toggleReaction: (postId: number) => Promise<void>;
  toggleFollow: (userId: number) => Promise<void>;
  resetCommunity: () => void;
}
```

### Pagination strategy (memory scaling)

- **Page size:** 10 posts per load
- **Cursor:** `created_at` of last item (timestamp cursor — avoids offset drift on inserts)
- **In-memory:** only loaded pages (`posts[]`)
- **Not persisted to AsyncStorage** — posts are always fresh-fetched
- **Persisted to AsyncStorage:** `userReactions` and `userFollows` only (small arrays)

Query pattern:
```sql
SELECT * FROM community_posts
WHERE created_at < :cursor          -- cursor = timestamp of last loaded post
ORDER BY is_pinned DESC, created_at DESC
LIMIT 10;
```

Pinned posts always appear first on the initial load.

---

## Mock Data — `data/mock/community.mock.ts`

```typescript
export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    user_id: 0,                     // system user (id: 0)
    author_name: 'فريق الطيبات',
    author_avatar: null,
    content: 'أهلاً بكم في عائلة الطيبات! نسعد بانضمامكم لهذه الرحلة الصحية المميزة.',
    image_url: null,
    post_type: 'system',
    is_pinned: true,
    love_count: 0,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 2,
    user_id: 0,
    author_name: 'فريق الطيبات',
    author_avatar: null,
    content: 'نصيحة اليوم: الأرز مع زيت الزيتون وجبة مثالية للمستوى الأول. بسيطة، مغذية، ومضادة للالتهابات.',
    image_url: null,
    post_type: 'system',
    is_pinned: false,
    love_count: 0,
    created_at: '2026-05-07T09:00:00.000Z',
    updated_at: '2026-05-07T09:00:00.000Z',
  },
  // add 4–6 more posts covering tips, announcements, quotes
];

export const MOCK_COMMUNITY_STATS: CommunityStats[] = [
  { month: '2026-05', active_users: 0, avg_health_score: null, avg_adherence_score: null, total_meals_logged: 0 },
  // empty template — charts render "coming soon" state
];
```

---

## API Layer

### `api/community/communityPosts.ts`
- `fetchPosts(cursor: string | null, limit: number): Promise<CommunityPost[]>`
- `createPost(payload): Promise<CommunityPost>`
- `updatePost(id, payload): Promise<CommunityPost>`
- `deletePost(id): Promise<void>`
- `fetchStats(): Promise<CommunityStats[]>`

### `api/community/communityReactions.ts`
- `addReaction(postId, userId, type): Promise<void>`
- `removeReaction(postId, userId, type): Promise<void>`
- `fetchUserReactions(userId): Promise<number[]>`  — returns array of post IDs

### `api/community/communityFollows.ts`
- `followUser(followerId, followingId): Promise<void>`
- `unfollowUser(followerId, followingId): Promise<void>`
- `fetchFollows(userId): Promise<number[]>` — returns array of following IDs

---

## File Checklist

**New files:**
- [ ] `types/community.types.ts`
- [ ] `data/mock/community.mock.ts`
- [ ] `stores/community.store.ts`
- [ ] `api/community/communityPosts.ts`
- [ ] `api/community/communityReactions.ts`
- [ ] `api/community/communityFollows.ts`
- [ ] `app/(main)/community.tsx`
- [ ] `components/community/PostCard.tsx`
- [ ] `components/community/CommunityStatsTab.tsx`
- [ ] `components/community/EmptyFeed.tsx`

**Modified files:**
- [ ] `data/mock/index.ts` — export `community.mock`
- [ ] `app/(main)/_layout.tsx` — register `community` screen
- [ ] `components/common/AppTabBar.tsx` — replace `badges` with `community` tab

---

## Design Rules

- **Phase 1 only:** no composer UI, no reply thread, no manual post input
- `PostCard` love button: optimistic update (toggle `userReactions` immediately, then call API) — same UX pattern as Twitter/Instagram
- `FlatList` `keyExtractor` = `post.id.toString()` — stable keys prevent re-renders
- Relative time ("منذ ٣ أيام") derived in a pure util function `toRelativeArabicTime(iso: string): string`
- All text via `AppText` — no raw `<Text>`
- No hardcoded colors — `theme.colors.*` or `app-*` tokens
- Images in `PostCard`: use `resizeMode="cover"` with `aspect-ratio: 16/9`, lazy-loaded
- Stats tab "coming soon" default view when `stats` array is empty or all months have `active_users: 0`
- `is_pinned` posts always appear at top of first page — handled in API query, not in component

---

## Scaling Notes (for future phases)

| Concern | Phase 1 approach | Phase 2+ upgrade |
|---|---|---|
| Post volume | 10/page cursor pagination | Same — no change needed |
| Reaction storage | User reactions array in AsyncStorage | Same pattern, larger array OK up to ~10k posts |
| `love_count` | DB trigger — zero query cost on read | Same |
| Image storage | External URLs (CDN/Supabase Storage) | Same — just populate `image_url` |
| Real-time feed | Pull-to-refresh | Supabase Realtime subscription on `community_posts` |
| Comments (Phase 3) | Not in schema yet | Add `community_comments` table with `post_id` FK |
| Post composer (Phase 3) | Not in UI | Add `ComposerSheet` bottom sheet component |
