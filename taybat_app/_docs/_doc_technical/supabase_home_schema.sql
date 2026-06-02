-- =============================================================================
-- Al-Taybat — Complete Supabase Schema
-- Safe to re-run: all DDL uses IF NOT EXISTS / OR REPLACE / ON CONFLICT DO NOTHING
--
-- ANALYSIS NOTES (discrepancies found vs supabase_setup.sql):
--   • user_meals: existing script used "logged_at" but TypeScript type + repository
--     both use "datetime" — fixed here.
--   • user_follows: existing script used "followed_id" but CommunityRepositorySupabase
--     queries "target_id" — fixed here.
--   • community_posts: missing "post_type" and "updated_at" columns — added.
--   • user_preferences: had "favorite_meal_ids int[]" but AccountRepositorySupabase
--     uses a separate "meal_favorites" table — removed array column, separate table added.
--   • profiles: INSERT policy was missing — upsertProfile (app code) needs it.
--   • weekly_ratings: no UNIQUE guard against duplicate submissions — added.
--   • meals / meal_items: completely absent from old script — added (home screen blocker).
--   • community_stats: absent — added as a live VIEW (always accurate, zero maintenance).
--   • love_count: not maintained by trigger — added trigger on post_reactions.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- SECTION 0 — Utility: updated_at trigger function (shared by all tables)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ===========================================================================
-- SECTION 1 — REFERENCE CATALOG  (meals, meal_items)
--
-- Design:
--   • Static, read-only reference data seeded from the domain knowledge base.
--   • No per-user filtering — ALL authenticated + anonymous users can read.
--   • Only service_role can write (seed scripts, admin panel).
--   • meal_item_ids stored as TEXT (comma-separated) to match the TypeScript
--     Meal.meal_item_ids: string type without requiring a type change.
--     Future: migrate to integer[] once the app layer is updated.
--   • meal_type_ids stored as TEXT for the same reason (1=إفطار 2=غداء 3=عشاء).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1a. meals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meals (
  id             integer     PRIMARY KEY,
  name           text        NOT NULL,
  name_en        text,                   -- English translation (null = not yet translated)
  description    text,                   -- Arabic description / preparation notes
  description_en text,                   -- English description (null = not yet translated)
  -- Comma-separated meal_item IDs. Keep as text to match Meal.meal_item_ids: string.
  -- Upgrade path: ALTER COLUMN meal_item_ids TYPE integer[] USING string_to_array(...)
  meal_item_ids  text        NOT NULL DEFAULT '',
  zone  integer     NOT NULL CHECK (zone BETWEEN 1 AND 5),
  image_url      text,
  -- Comma-separated meal-type IDs: 1=إفطار  2=غداء  3=عشاء
  meal_type_ids  text        NOT NULL DEFAULT '',
  -- active = false hides the record from the app without deleting it.
  -- Use this to soft-disable seasonal or unavailable meals.
  active         boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meals: public read"       ON public.meals;
DROP POLICY IF EXISTS "meals: service_role write" ON public.meals;

-- Only active rows are visible to the app.
CREATE POLICY "meals: public read"
  ON public.meals FOR SELECT
  USING (active = true);

-- Writes go through service_role only (seed scripts, admin panel).
-- Application JWT (anon / authenticated) cannot insert/update/delete.
CREATE POLICY "meals: service_role write"
  ON public.meals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ---------------------------------------------------------------------------
-- 1b. meal_items  (individual food ingredients that compose a Meal)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_items (
  id          integer     PRIMARY KEY,
  name        text        NOT NULL,
  name_en     text,                   -- English translation (null = not yet translated)
  description    text,                -- Arabic description / nutritional notes
  description_en text,                -- English description (null = not yet translated)
  -- Domain category ID (links to the dietary zone classification system)
  category    integer     NOT NULL DEFAULT 0,
  zone        integer     NOT NULL CHECK (zone BETWEEN 1 AND 5),
  rating      numeric(3,1),
  frequency   text,
  notes       text,
  image_url   text,
  -- active = false hides the ingredient from all meal compositions and filters.
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meal_items: public read"        ON public.meal_items;
DROP POLICY IF EXISTS "meal_items: service_role write"  ON public.meal_items;

CREATE POLICY "meal_items: public read"
  ON public.meal_items FOR SELECT
  USING (active = true);

CREATE POLICY "meal_items: service_role write"
  ON public.meal_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ===========================================================================
-- SECTION 2 — USER IDENTITY  (profiles, user_preferences, meal_favorites)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 2aa. health_gools  (health goals catalog — selectable in complete-profile)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_gools (
  id         integer     GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name       text        NOT NULL,
  name_en    text,
  active     boolean     NOT NULL DEFAULT true,
  image      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.health_gools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_gools: public read"       ON public.health_gools;
DROP POLICY IF EXISTS "health_gools: service_role write" ON public.health_gools;

CREATE POLICY "health_gools: public read"
  ON public.health_gools FOR SELECT
  USING (active = true);

CREATE POLICY "health_gools: service_role write"
  ON public.health_gools FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO public.health_gools (id, name, name_en, active, image)
VALUES
  (1, 'تقليل الالتهاب',   'Reduce inflammation', true, 'dish'),
  (2, 'تحسين الهضم',      'Improve digestion',   true, 'dish'),
  (3, 'فقدان الوزن',      'Weight loss',         true, 'dish'),
  (4, 'تحسين الطاقة',     'Improve energy',      true, 'dish'),
  (5, 'تحسين النوم',      'Improve sleep',       true, 'dish'),
  (6, 'التخلص من التوتر', 'Reduce stress',       true, 'dish')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2a. profiles  (one row per auth.user — mirrors UserProfile TypeScript type)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text        NOT NULL,
  name              text,
  gender            text        CHECK (gender IN ('male', 'female')),
  birth_year        integer,
  weight_kg         numeric(5, 1),
  height_cm         numeric(5, 1),
  activity_level    text        CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active')),
  health_gools_ids  text,
  provider          text        NOT NULL DEFAULT 'email',
  profile_completed boolean     NOT NULL DEFAULT false,
  plan_start_date   date,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_start_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_gools_ids text;

-- Trigger: keep updated_at current
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: auto-create profile row on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: owner read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: owner insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles: owner update" ON public.profiles;

CREATE POLICY "profiles: owner read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT needed: upsertProfile (ensureProfileRow) may insert via authenticated role.
-- The handle_new_user trigger is SECURITY DEFINER so it bypasses RLS;
-- this policy covers the app-layer upsert path.
CREATE POLICY "profiles: owner insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- 2b. user_preferences  (avatar, visibility, follow settings — one row per user)
--
-- Design: No favorite_meal_ids here.
--   • Favorites are stored in the separate meal_favorites table so they can
--     be queried efficiently without loading the entire preferences row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_config     jsonb,
  post_visibility   text        NOT NULL DEFAULT 'public'
                                CHECK (post_visibility   IN ('public', 'followers')),
  follow_permission text        NOT NULL DEFAULT 'everyone'
                                CHECK (follow_permission IN ('everyone', 'approved')),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_preferences: owner all" ON public.user_preferences;
CREATE POLICY "user_preferences: owner all"
  ON public.user_preferences FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 2c. meal_favorites  (user ↔ meal many-to-many)
--
-- Design: Separate table instead of integer[] in user_preferences.
--   Pros: efficient per-meal queries, clean INSERT/DELETE semantics,
--         no need to load full prefs row to check one meal.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_favorites (
  user_id  uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id  integer NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, meal_id)
);

ALTER TABLE public.meal_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meal_favorites: owner all" ON public.meal_favorites;
CREATE POLICY "meal_favorites: owner all"
  ON public.meal_favorites FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ===========================================================================
-- SECTION 3 — TRACKING  (user_meals, weekly_ratings)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 3a. user_meals  (meal log — one row per logged meal)
--
-- Column "datetime" (timestamptz) matches UserMeal.datetime: string in TypeScript
-- and the repository INSERT payload: { datetime: now, date: now.slice(0,10) }.
--
-- NOTE: The old supabase_setup.sql used "logged_at" which would cause
-- insert failures at runtime — this schema uses "datetime" to match the code.
--
-- Scaling notes:
--   • Index on (user_id, date DESC) covers "today's meals" query.
--   • Index on (user_id, datetime DESC) covers "all meals" ordered list.
--   • 3-meals/day cap is enforced in app layer; a DB-level check can be added
--     later via a trigger if abuse prevention is needed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_meals (
  id            bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id       integer     NOT NULL REFERENCES public.meals(id),
  meal_item_ids text        NOT NULL DEFAULT '',
  zone_summary  integer     NOT NULL DEFAULT 1 CHECK (zone_summary BETWEEN 1 AND 5),
  -- "datetime" is the column name used by TrackingRepositorySupabase and UserMeal type
  datetime      timestamptz NOT NULL DEFAULT now(),
  date          date        NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.user_meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_meals: owner all" ON public.user_meals;
CREATE POLICY "user_meals: owner all"
  ON public.user_meals FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index: fast "today's meals" filter and "full history" ordered query
CREATE INDEX IF NOT EXISTS idx_user_meals_user_date     ON public.user_meals (user_id, date     DESC);
CREATE INDEX IF NOT EXISTS idx_user_meals_user_datetime ON public.user_meals (user_id, datetime DESC);


-- ---------------------------------------------------------------------------
-- 3b. weekly_ratings  (7-day health check-in)
--
-- Unique constraint on (user_id, period_start): prevents a user from
-- submitting two ratings for the same 7-day window (business rule).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_ratings (
  id                     bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- period_start: the ISO date (Monday) that opens this 7-day window
  period_start           date        NOT NULL,
  health_score           integer     NOT NULL CHECK (health_score     BETWEEN 1 AND 5),
  adherence_score        integer     NOT NULL CHECK (adherence_score  BETWEEN 1 AND 5),
  pain_reduced           boolean     NOT NULL DEFAULT false,
  energy_improved        boolean     NOT NULL DEFAULT false,
  sleep_improved         boolean     NOT NULL DEFAULT false,
  digestion_improved     boolean     NOT NULL DEFAULT false,
  mood_improved          boolean     NOT NULL DEFAULT false,
  mental_health_improved boolean     NOT NULL DEFAULT false,
  submitted_at           timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate submissions for the same period
ALTER TABLE public.weekly_ratings
  DROP CONSTRAINT IF EXISTS uq_weekly_ratings_user_period;
ALTER TABLE public.weekly_ratings
  ADD CONSTRAINT uq_weekly_ratings_user_period UNIQUE (user_id, period_start);

ALTER TABLE public.weekly_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_ratings: owner all" ON public.weekly_ratings;
CREATE POLICY "weekly_ratings: owner all"
  ON public.weekly_ratings FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_ratings_user ON public.weekly_ratings (user_id, submitted_at DESC);


-- ===========================================================================
-- SECTION 4 — COMMUNITY  (posts, reactions, follows, stats)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 4a. community_posts
--
-- post_type values match PostType = 'system'|'achievement'|'meal_share'|'user_post'.
-- love_count is a denormalized counter maintained by trigger (Section 5).
-- updated_at tracks last edit for optimistic concurrency.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
  id            bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text        NOT NULL,
  author_avatar text,
  content       text        NOT NULL,
  image_url     text,
  post_type     text        NOT NULL DEFAULT 'user_post'
                            CHECK (post_type IN ('system', 'achievement', 'meal_share', 'user_post')),
  is_pinned     boolean     NOT NULL DEFAULT false,
  love_count    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts: authenticated read" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: owner insert"       ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: owner update"       ON public.community_posts;
DROP POLICY IF EXISTS "community_posts: owner delete"       ON public.community_posts;
-- System/achievement posts need service_role to insert (no user_id match)
DROP POLICY IF EXISTS "community_posts: service_role all"   ON public.community_posts;

CREATE POLICY "community_posts: authenticated read"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "community_posts: owner insert"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts: owner update"
  ON public.community_posts FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts: owner delete"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "community_posts: service_role all"
  ON public.community_posts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Cursor-based pagination sort: pinned first, then newest
CREATE INDEX IF NOT EXISTS idx_community_posts_feed
  ON public.community_posts (is_pinned DESC, created_at DESC);


-- ---------------------------------------------------------------------------
-- 4b. post_reactions  (user ↔ post — love reaction)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_reactions (
  user_id  uuid   NOT NULL REFERENCES auth.users(id)          ON DELETE CASCADE,
  post_id  bigint NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_reactions: owner all" ON public.post_reactions;
CREATE POLICY "post_reactions: owner all"
  ON public.post_reactions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 4c. user_follows  (follower → target)
--
-- Column "target_id" matches CommunityRepositorySupabase which queries
--   .select('target_id').eq('follower_id', userId)
-- The old supabase_setup.sql used "followed_id" — that would fail at runtime.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, target_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_follows: owner all"    ON public.user_follows;
DROP POLICY IF EXISTS "user_follows: public read"  ON public.user_follows;

CREATE POLICY "user_follows: owner all"
  ON public.user_follows FOR ALL
  USING  (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Follower counts can be shown publicly (e.g. on user profiles)
CREATE POLICY "user_follows: public read"
  ON public.user_follows FOR SELECT
  USING (true);


-- ---------------------------------------------------------------------------
-- 4d. community_stats  (live VIEW — always accurate, zero maintenance)
--
-- Aggregates per calendar month from weekly_ratings + user_meals.
-- Matches CommunityStats TypeScript interface exactly.
--
-- Scaling: if query becomes slow at high volume, replace with a
-- MATERIALIZED VIEW refreshed nightly by a pg_cron job.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.community_stats AS
SELECT
  to_char(date_trunc('month', wr.submitted_at), 'YYYY-MM') AS month,
  COUNT(DISTINCT wr.user_id)                                AS active_users,
  ROUND(AVG(wr.health_score)::numeric,    1)                AS avg_health_score,
  ROUND(AVG(wr.adherence_score)::numeric, 1)                AS avg_adherence_score,
  COUNT(DISTINCT um.id)                                     AS total_meals_logged
FROM public.weekly_ratings wr
LEFT JOIN public.user_meals um
  ON date_trunc('month', um.datetime) = date_trunc('month', wr.submitted_at)
GROUP BY date_trunc('month', wr.submitted_at)
ORDER BY 1 DESC;


-- ===========================================================================
-- SECTION 5 — TRIGGERS
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 5a. Maintain love_count on community_posts
--
-- Increments/decrements the denormalized counter on post_reactions changes.
-- This avoids a COUNT(*) join on every feed load.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_post_love_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.community_posts
    SET love_count = love_count + 1
    WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.community_posts
    SET love_count = GREATEST(0, love_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL; -- AFTER trigger, return value ignored
END;
$$;

DROP TRIGGER IF EXISTS trg_post_reactions_love_count ON public.post_reactions;
CREATE TRIGGER trg_post_reactions_love_count
  AFTER INSERT OR DELETE ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_love_count();


-- ===========================================================================
-- SECTION 6 — GRANTS
-- ===========================================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Reference catalog: read for everyone, write for service_role only
GRANT SELECT ON public.meals, public.meal_items TO authenticated, anon;

-- User tables: authenticated reads/writes own rows (enforced by RLS above)
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles,
  public.user_preferences,
  public.meal_favorites,
  public.user_meals,
  public.weekly_ratings,
  public.community_posts,
  public.post_reactions,
  public.user_follows
TO authenticated;

-- View is owned by postgres; grant read to authenticated
GRANT SELECT ON public.community_stats TO authenticated;

-- Sequences (for IDENTITY columns)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
