# Realtime Love Count Sync — Technical Documentation

## Overview

This document explains how we built live reaction count syncing in the community feed using Supabase Realtime and PostgreSQL triggers. The system ensures that every connected user sees the correct `love_count` on every post within milliseconds of any user adding or removing a reaction — with no polling.

---

## Architecture

```
User A taps ❤️
      │
      ▼
[Optimistic UI update]  ← instant local feedback
      │
      ▼
INSERT into post_reactions
      │
      ▼ (PostgreSQL AFTER trigger)
UPDATE community_posts SET love_count = COUNT(*)
      │
      ▼ (Supabase Realtime CDC)
broadcast UPDATE event to all subscribers
      │
      ├──► User A's app  → updates love_count in Zustand store
      ├──► User B's app  → updates love_count in Zustand store
      └──► User N's app  → updates love_count in Zustand store
```

---

## Layer 1 — Database: Trigger Function

### The problem we hit

The original trigger used an increment/decrement approach:

```sql
-- ❌ BROKEN — two bugs
UPDATE community_posts SET love_count = love_count + 1 WHERE id = NEW.post_id;
```

**Bug 1 — RLS blocked the UPDATE.**
The trigger ran under the calling user's auth context. The `community_posts` UPDATE RLS policy is `auth.uid() = user_id`, so when user A reacted to user B's post the trigger's `UPDATE` was silently blocked — the count never saved to the DB and reset to 0 on every refresh.

**Bug 2 — Counter drift.**
Increment/decrement counters drift under concurrent writes or retries. If two INSERTs fire simultaneously both read the same `love_count` and only one increment takes effect.

### The fix

```sql
CREATE OR REPLACE FUNCTION public.sync_post_love_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as function owner, bypasses RLS
SET search_path = public
AS $$
DECLARE
  target_post_id bigint;
BEGIN
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);

  -- COUNT(*) is always exact — never drifts
  UPDATE community_posts
  SET love_count = (
    SELECT COUNT(*) FROM post_reactions WHERE post_id = target_post_id
  )
  WHERE id = target_post_id;

  RETURN NULL; -- AFTER trigger, return value is ignored
END;
$$;
```

**Why `SECURITY DEFINER`:** The function runs as its owner (the Supabase superuser), not as the calling user. This bypasses RLS so any user's reaction can update any post's count.

**Why `COUNT(*)`:** Derives the exact count from the source of truth on every event. Concurrent inserts, retries, and manual DB edits can never cause a mismatch.

**Why `SET search_path = public`:** Prevents schema search path injection attacks — a security best practice when using `SECURITY DEFINER`.

### Trigger registration

The trigger was already registered on `post_reactions` for INSERT and DELETE events:

```sql
-- trg_post_reactions_love_count (already existed, fires on INSERT and DELETE)
EXECUTE FUNCTION sync_post_love_count();
```

---

## Layer 2 — Database: Enabling Realtime

Two steps are required to broadcast row-level changes to clients.

### Step 1 — Replica Identity

By default PostgreSQL only includes the primary key in UPDATE events. `REPLICA IDENTITY FULL` makes it include the entire new row, which the Supabase Realtime system needs to forward to clients.

```sql
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
```

### Step 2 — Add table to the Realtime publication

Supabase uses a Postgres logical replication publication called `supabase_realtime`. Tables must be opted in explicitly.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
```

After these two steps, every `UPDATE` on `community_posts` (including the one fired by the trigger) is streamed to all subscribed clients.

---

## Layer 3 — App: Zustand Store Subscription

### File: `stores/community.store.ts`

#### Module-level channel reference

The Supabase channel is stored outside Zustand state — it is a lifecycle handle, not reactive data.

```typescript
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

let realtimeChannel: RealtimeChannel | null = null;
```

#### Setup function

Called once after `initializeCommunity` succeeds. Guards against double-subscription.

```typescript
function setupLoveCountChannel() {
  if (USE_MOCK || realtimeChannel) return;

  realtimeChannel = supabase
    .channel('community_love_counts')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'community_posts' },
      (payload) => {
        const updated = payload.new as { id: number; love_count: number };

        // Patch only love_count — avoids overwriting other optimistic state
        useCommunityStore.setState((state) => ({
          posts: state.posts.map((p) =>
            p.id === updated.id ? { ...p, love_count: updated.love_count } : p,
          ),
        }));
      },
    )
    .subscribe();
}
```

#### Teardown function

Called in `resetCommunity` to avoid memory leaks and stale subscriptions on logout.

```typescript
function teardownLoveCountChannel() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
```

#### Store wiring

```typescript
initializeCommunity: async () => {
  // ... fetch posts, reactions, follows ...
  set({ posts, userReactions, userFollows, ... });
  setupLoveCountChannel(); // ← subscribe after data is loaded
},

resetCommunity: () => {
  teardownLoveCountChannel(); // ← unsubscribe on logout/reset
  set({ ...initialState });
},
```

---

## Layer 4 — App: Optimistic UI

Before the network call completes, the UI updates instantly using a local state patch in `toggleReaction`. This makes the tap feel immediate.

```typescript
toggleReaction: async (postId) => {
  const prevPosts = get().posts;
  const prevReactions = get().userReactions;
  const isLoved = prevReactions.includes(postId);

  // 1. Optimistic update — instant UI feedback
  set({
    posts: prevPosts.map((p) =>
      p.id !== postId ? p : {
        ...p,
        love_count: isLoved ? Math.max(0, p.love_count - 1) : p.love_count + 1,
      }
    ),
    userReactions: isLoved
      ? prevReactions.filter((id) => id !== postId)
      : [...prevReactions, postId],
  });

  try {
    // 2. Real write — trigger fires → Realtime broadcasts correct count
    const user = useUserStore.getState().user;
    const nextReactions = await communityRepository.toggleReaction(user?.id ?? '', postId);
    set({ userReactions: nextReactions });
    // Realtime event will confirm/correct love_count for all subscribers
  } catch (error) {
    // 3. Rollback on failure
    set({ userReactions: prevReactions, posts: prevPosts });
  }
},
```

The optimistic value and the DB value will always converge because the trigger recalculates from `COUNT(*)`.

---

## Complete Event Flow

```
User A taps ❤️ on post #1
│
├─ [immediate] Optimistic: love_count +1 in User A's store
│
├─ INSERT post_reactions (user_id=A, post_id=1)
│
│   PostgreSQL AFTER trigger fires (SECURITY DEFINER):
│   UPDATE community_posts
│     SET love_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = 1)
│     WHERE id = 1;
│   → love_count is now the exact real count
│
│   Supabase Realtime broadcasts UPDATE event (REPLICA IDENTITY FULL):
│   { new: { id: 1, love_count: 2, ... } }
│
├─ User A's subscription → love_count := 2 (confirms optimistic)
├─ User B's subscription → love_count := 2 (live update, no refresh)
└─ User N's subscription → love_count := 2 (live update, no refresh)
```

---

## Applying This Pattern to Other Counters

To replicate this pattern for any other counter (e.g., comment count, share count):

1. **Add the counter column** to the parent table.
2. **Write a `SECURITY DEFINER` trigger function** on the child table that does `COUNT(*)`.
3. **Register the trigger** on INSERT and DELETE of the child table.
4. **Set `REPLICA IDENTITY FULL`** on the parent table.
5. **Add the parent table** to `supabase_realtime` publication.
6. **Add a `.on('postgres_changes', { event: 'UPDATE', table: 'parent_table' }, ...)` subscription** in the relevant Zustand store.
7. **Patch only the changed field** in the Realtime callback to avoid state conflicts.

---

## Key Rules and Pitfalls

| Rule | Reason |
|---|---|
| Always use `SECURITY DEFINER` on trigger functions that UPDATE a different table | RLS policies run under the calling user — cross-table updates are blocked without it |
| Use `COUNT(*)` not `+1/-1` in triggers | Increment counters drift under concurrent writes; `COUNT(*)` is always correct |
| Always use `SET search_path = public` with `SECURITY DEFINER` | Prevents schema injection attacks |
| Set `REPLICA IDENTITY FULL` before adding to publication | Without it, UPDATE events may not carry the full new row |
| Guard channel setup with `if (realtimeChannel) return` | Prevents duplicate subscriptions if `initializeCommunity` is called more than once |
| Call `supabase.removeChannel` in reset/logout | Prevents memory leaks and stale event handlers |
| Only mock mode skips the subscription (`USE_MOCK` check) | No Supabase connection exists in mock mode |
| Patch only the changed field in the Realtime callback | Avoids overwriting other optimistic state from concurrent user actions |
