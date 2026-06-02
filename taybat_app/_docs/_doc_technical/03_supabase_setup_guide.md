# Supabase Setup Guide
### Connecting Al-Tayebat to a Real Database

> This guide is for a developer who has never used Supabase before. By the end you will have a real Postgres database running and the app talking to it instead of in-memory mock data.

---

## What Is Supabase?

Supabase is a hosted Postgres database with a built-in authentication system, a REST API, and a JavaScript client. You get:

- **Auth** — email/password, Google, Apple sign-in, session management
- **Database** — standard Postgres (you write normal SQL)
- **Row-Level Security** — database-enforced access rules (users can't read each other's data)
- **Storage** — file/image hosting (not used yet in this app)
- **Realtime** — live data subscriptions (planned for community feed)

The app already has the Supabase JS client installed (`@supabase/supabase-js`). All you need to do is create a project, run the setup SQL, and add two environment variables.

---

## Part 1 — Create a Supabase Project

### 1.1 Sign Up

Go to [supabase.com](https://supabase.com) and create a free account.

### 1.2 Create a New Project

1. Click **New Project**
2. Choose your organization (or create one)
3. Fill in:
   - **Project name:** `taybat-app` (or anything you like)
   - **Database password:** choose a strong password and save it somewhere safe
   - **Region:** pick the region closest to your users (e.g. EU for Middle East, or pick "Singapore" for better latency)
4. Click **Create new project**
5. Wait 1–2 minutes for the project to provision

### 1.3 Get Your Credentials

Once the project is ready:

1. In the left sidebar click **Project Settings** → **API**
2. Copy two values:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon public key** — a long JWT string starting with `eyJ...`

Keep these ready for Part 2.

---

## Part 2 — Configure the App

### 2.1 Create the `.env` File

In the project root (`taybat_app/`) there is a `.env.example` file. Copy it:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_USE_MOCK=false
```

**Important:**
- `EXPO_PUBLIC_` prefix is required by Expo — variables without it are invisible to the app
- `EXPO_PUBLIC_USE_MOCK=false` switches all repositories from mock to Supabase
- Never commit `.env` to git (it's already in `.gitignore`)

### 2.2 How the Switch Works

The environment variable controls the factory in every repository:

```
EXPO_PUBLIC_USE_MOCK=true   (or not set)  →  uses in-memory mock data
EXPO_PUBLIC_USE_MOCK=false                →  uses real Supabase
```

The factory pattern in each `repositories/<domain>/index.ts` looks like:

```typescript
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const authRepository = USE_MOCK
  ? new AuthRepositoryMock()
  : new AuthRepositorySupabase(supabase);
```

One variable — every repository switches simultaneously. No code changes needed.

---

## Part 3 — Create the Database Schema

### 3.1 Open the SQL Editor

In your Supabase project:
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

Paste and run each SQL block below. Run them in order — some tables reference others.

### 3.2 User Profiles Table

```sql
-- Extends Supabase's built-in auth.users table
create table public.profiles (
  id               uuid        primary key references auth.users (id) on delete cascade,
  email            text        not null,
  name             text,
  gender           text        check (gender in ('male', 'female', 'other')),
  birth_year       integer,
  weight_kg        numeric(5,1),
  height_cm        numeric(5,1),
  activity_level   text        check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  health_goals     text[],
  provider         text        not null default 'email',
  profile_completed boolean    not null default false,
  plan_start_date  date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, provider)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'provider', 'email'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row-Level Security
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
```

### 3.3 Meals & Meal Items Tables

```sql
-- Meals catalog (zone-based food guide)
create table public.meals (
  id          bigint generated always as identity primary key,
  name        text    not null,
  name_en     text,
  zone        integer not null check (zone between 1 and 5),
  description text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- Individual food items within a meal
create table public.meal_items (
  id       bigint generated always as identity primary key,
  meal_id  bigint references public.meals (id) on delete cascade,
  name     text    not null,
  name_en  text,
  zone     integer not null check (zone between 1 and 5)
);

-- Meals are read-only for all authenticated users (admin inserts them)
alter table public.meals      enable row level security;
alter table public.meal_items enable row level security;

create policy "Anyone authenticated can read meals"
  on public.meals for select to authenticated using (true);

create policy "Anyone authenticated can read meal items"
  on public.meal_items for select to authenticated using (true);
```

### 3.4 Meal Tracking (User Meal Logs)

```sql
create table public.user_meals (
  id             bigint generated always as identity primary key,
  user_id        uuid   not null references auth.users (id) on delete cascade,
  meal_id        bigint references public.meals (id),
  meal_item_ids  text   not null default '',    -- comma-separated IDs
  zone_summary   integer not null check (zone_summary between 1 and 5),
  logged_at      timestamptz not null default now()
);

alter table public.user_meals enable row level security;

create policy "Users can read their own meal logs"
  on public.user_meals for select using (auth.uid() = user_id);

create policy "Users can insert their own meal logs"
  on public.user_meals for insert with check (auth.uid() = user_id);

create policy "Users can update their own meal logs"
  on public.user_meals for update using (auth.uid() = user_id);

create policy "Users can delete their own meal logs"
  on public.user_meals for delete using (auth.uid() = user_id);
```

### 3.5 Community Tables

```sql
create table public.community_posts (
  id          bigint generated always as identity primary key,
  author_id   uuid   not null references auth.users (id) on delete cascade,
  content     text   not null,
  image_url   text,
  reactions   integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.post_reactions (
  user_id  uuid   not null references auth.users (id) on delete cascade,
  post_id  bigint not null references public.community_posts (id) on delete cascade,
  primary key (user_id, post_id)
);

create table public.user_follows (
  follower_id  uuid not null references auth.users (id) on delete cascade,
  target_id    uuid not null references auth.users (id) on delete cascade,
  primary key (follower_id, target_id)
);

create table public.community_stats (
  user_id       uuid    not null references auth.users (id) on delete cascade primary key,
  posts_count   integer not null default 0,
  followers     integer not null default 0,
  following     integer not null default 0
);

alter table public.community_posts  enable row level security;
alter table public.post_reactions   enable row level security;
alter table public.user_follows     enable row level security;
alter table public.community_stats  enable row level security;

create policy "Authenticated users can read posts"
  on public.community_posts for select to authenticated using (true);

create policy "Users can insert their own posts"
  on public.community_posts for insert with check (auth.uid() = author_id);

create policy "Users manage their own reactions"
  on public.post_reactions for all using (auth.uid() = user_id);

create policy "Users manage their own follows"
  on public.user_follows for all using (auth.uid() = follower_id);

create policy "Authenticated users can read stats"
  on public.community_stats for select to authenticated using (true);
```

### 3.6 Account Preferences & Favorites

```sql
create table public.user_preferences (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  avatar_config      jsonb,                -- stores AvatarConfig object
  post_visibility    text check (post_visibility in ('public', 'followers', 'private')),
  follow_permission  text check (follow_permission in ('open', 'approval_required'))
);

create table public.meal_favorites (
  user_id  uuid   not null references auth.users (id) on delete cascade,
  meal_id  bigint not null references public.meals (id) on delete cascade,
  primary key (user_id, meal_id)
);

alter table public.user_preferences enable row level security;
alter table public.meal_favorites   enable row level security;

create policy "Users manage their own preferences"
  on public.user_preferences for all using (auth.uid() = user_id);

create policy "Users manage their own favorites"
  on public.meal_favorites for all using (auth.uid() = user_id);
```

### 3.7 Weekly Health Ratings

```sql
create table public.weekly_ratings (
  id                     bigint generated always as identity primary key,
  user_id                uuid    not null references auth.users (id) on delete cascade,
  period_start           date    not null,
  health_score           integer not null check (health_score between 1 and 5),
  adherence_score        integer not null check (adherence_score between 1 and 5),
  pain_reduced           boolean not null default false,
  energy_improved        boolean not null default false,
  sleep_improved         boolean not null default false,
  digestion_improved     boolean not null default false,
  mood_improved          boolean not null default false,
  mental_health_improved boolean not null default false,
  submitted_at           timestamptz not null default now()
);

alter table public.weekly_ratings enable row level security;

create policy "Users can read their own ratings"
  on public.weekly_ratings for select using (auth.uid() = user_id);

create policy "Users can insert their own ratings"
  on public.weekly_ratings for insert with check (auth.uid() = user_id);
```

---

## Part 4 — Enable Authentication Providers

### 4.1 Email/Password (Already On by Default)

In your Supabase project: **Authentication** → **Providers** → **Email**

Default settings are fine. Optionally disable "Confirm email" during development so you can sign up without email verification.

### 4.2 Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Add to Authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**
5. In Supabase: **Authentication** → **Providers** → **Google** → paste the credentials → **Save**

### 4.3 Apple OAuth (Optional, iOS only)

Apple Sign-In requires an Apple Developer account ($99/year). Setup is more involved — refer to the [Supabase Apple Auth guide](https://supabase.com/docs/guides/auth/social-login/auth-apple).

---

## Part 5 — Seed the Meals Data

The meals catalog (zones 1–5) needs to be populated by an admin. The mock data lives in `data/mock/`. You can either:

**Option A — Import via SQL**

Export the mock data as SQL INSERT statements and run them in the SQL Editor.

**Option B — Import via Supabase Dashboard**

1. Go to **Table Editor** → `meals` table
2. Click **Insert** and add rows manually (good for small datasets)
3. Or use **Import Data** (CSV upload) for bulk import

**Option C — Seed Script**

Create `scripts/seed.ts` that reads the mock JSON and calls the Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js';
import meals from '../data/mock/meals.json';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function seed() {
  const { error } = await supabase.from('meals').insert(meals);
  if (error) console.error(error);
  else console.log('Seeded', meals.length, 'meals');
}

seed();
```

Run with: `npx ts-node scripts/seed.ts`

---

## Part 6 — Verify the Connection

### 6.1 Start the App

```bash
npm run start
```

Then press `i` for iOS simulator or `a` for Android emulator.

### 6.2 What to Check

1. **Splash screen loads** without errors
2. **Sign up** creates a row in `auth.users` (visible in Supabase **Authentication** → **Users**)
3. **Profile completion** creates/updates a row in `public.profiles`
4. **Meal logs** appear in `public.user_meals` after logging a meal
5. **TypeScript** passes: `npm run typecheck`

### 6.3 Common Errors

| Error | Cause | Fix |
|---|---|---|
| `supabaseUrl is required` | `.env` not found or missing `EXPO_PUBLIC_` prefix | Check variable names in `.env` |
| `JWT expired` | Anon key copied incorrectly | Re-copy from Supabase Project Settings → API |
| `relation "profiles" does not exist` | SQL not run yet | Run Part 3 SQL in order |
| `new row violates row-level security` | RLS policy missing or wrong | Check the policy for the table in Supabase → Authentication → Policies |
| `Network request failed` | No internet / wrong URL | Check `EXPO_PUBLIC_SUPABASE_URL` |
| `AuthSessionMissingError` | Trying to call a protected route without a session | Make sure the user is logged in before calling that repository method |

### 6.4 Checking Logs

In Supabase: **Logs** → **API** shows every request the app makes with status codes and error details. This is the fastest way to debug.

---

## Part 7 — Switching Between Mock and Real

| Want to… | Change in `.env` |
|---|---|
| Develop offline, no Supabase needed | `EXPO_PUBLIC_USE_MOCK=true` |
| Test against real Supabase | `EXPO_PUBLIC_USE_MOCK=false` |

After changing `.env`, restart the Expo dev server:

```bash
# Stop the server (Ctrl+C), then:
npm run start
```

Expo reads environment variables at startup, not at runtime.

---

## Part 8 — Supabase Client Reference

The client is a singleton at `lib/supabase.ts`. Import it anywhere in the repository layer:

```typescript
import { supabase } from '@/lib/supabase';
```

**Never import `supabase` directly in stores or screens.** Only repository files should use it.

### Common Query Patterns

```typescript
// SELECT all rows
const { data, error } = await supabase.from('meals').select('*');

// SELECT with filter
const { data, error } = await supabase
  .from('meals')
  .select('*')
  .eq('zone', 1);

// SELECT one row (throws if not found)
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// SELECT one row or null (safe)
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

// INSERT
const { data, error } = await supabase
  .from('user_meals')
  .insert({ user_id: userId, meal_id: mealId, zone_summary: 1 })
  .select()
  .single();

// UPDATE
const { error } = await supabase
  .from('profiles')
  .update({ name: 'Ahmed' })
  .eq('id', userId);

// UPSERT (insert or update if exists)
const { data, error } = await supabase
  .from('user_preferences')
  .upsert({ user_id: userId, avatar_config: config })
  .select()
  .single();

// DELETE
const { error } = await supabase
  .from('user_meals')
  .delete()
  .eq('id', mealLogId);
```

### Auth Patterns

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({ email, password });

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign out
const { error } = await supabase.auth.signOut();

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen for auth state changes (used in auth.store.ts)
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
});
```

---

## Part 9 — Security Checklist

Before going to production:

```
[ ] EXPO_PUBLIC_SUPABASE_ANON_KEY is the "anon" key, NOT the "service_role" key
    (service_role bypasses RLS — never put it in the app)

[ ] Every table has RLS enabled (green shield icon in Table Editor)

[ ] Every table has at least a SELECT policy

[ ] The .env file is in .gitignore

[ ] No Supabase credentials appear in any committed file

[ ] Password reset emails are configured in Authentication → Email Templates

[ ] "Confirm email" setting matches your intended UX (on for prod, off for dev)
```

---

## Quick Reference

| What | Where in Supabase |
|---|---|
| Create/view tables | Table Editor |
| Run SQL | SQL Editor |
| See users | Authentication → Users |
| Manage auth providers | Authentication → Providers |
| View/edit RLS policies | Authentication → Policies |
| Debug API requests | Logs → API |
| Get API credentials | Project Settings → API |
| Database password | Project Settings → Database |
| Supabase JS docs | supabase.com/docs/reference/javascript |
