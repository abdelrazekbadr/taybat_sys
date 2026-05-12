# Supabase Setup & Usage Guide (Al‑Tayebat)

This guide explains how to create a Supabase project, configure Auth, prepare the database, and connect it to the React Native app (`taybat_app`) in this repo.

**Supabase Tutorial for Beginners 2026: How to Use Supabase:**
https://www.youtube.com/watch?v=hVrSGKGU24g

---

## 1) Create Supabase Project

1. Go to https://supabase.com and create an account.
2. Create a new project:
   - Choose an organization.
   - Set a project name (example: `taybat-app-prod` or `taybat-app-dev`).
   - Choose a region close to your users.
   - Set a strong database password (store it safely).
3. Wait until provisioning finishes.

---

## 2) Get Project Credentials (URL + Anon Key)

1. Open your Supabase project.
2. Go to **Project Settings → API**.
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

Important:

- Do not store secrets in the repository.
- For mobile apps, using the **anon key** is normal; security must come from **Row Level Security (RLS)** policies.

---

## 3) Configure Authentication (Email + OAuth)

https://www.youtube.com/watch?v=4THgyc3oq68

https://console.cloud.google.com/

### 3.1 Enable Email/Password

1. Go to **Authentication → Providers**.
2. Enable **Email** (and configure email confirmation behavior if you want verification).

### 3.2 Enable Google / Facebook / Apple (optional but recommended)

In Supabase:

1. Go to **Authentication → Providers**.
2. Enable each provider and paste the provider credentials:
   - Google: Client ID + Client Secret
   - Facebook: App ID + App Secret
   - Apple: Service ID / Team ID / Key ID / Private key (as required by Apple)

Redirect URLs:

- Supabase will show a callback/redirect URL per provider.
- You must add the exact Supabase callback URL in the provider console (Google/Facebook/Apple).

React Native note:

- OAuth on mobile typically needs deep linking setup (and sometimes an in-app browser). The current code calls `supabase.auth.signInWithOAuth`, which will open the provider flow and return through configured redirects/deep links.

command used

>> npm install -g expo-cli eas-cli

rm -rf node_modules
rm package-lock.json

npm install

npm install expo

npx expo install

npx expo install expo-auth-session expo-web-browser

[tayabat.sys@gmail.com](mailto:taybat.sys@gmail.com)

npx expo login --browser

com.tayabat.sys



---

## 4) Database Tables (Minimal Schema for Current App Code)

The app currently uses these tables in `src/types/supabase.ts` and API modules:

- `users`
- `meals`
- `meal_plans`
- `analytics`

### 4.1 Create Tables (SQL)

In Supabase: **SQL Editor → New query**, run:

```sql
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  profile jsonb,
  preferences jsonb
);

create table if not exists public.meals (
  id uuid primary key,
  created_at timestamptz not null default now(),
  data jsonb
);

create table if not exists public.meal_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  data jsonb
);

create table if not exists public.analytics (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  data jsonb
);
```

Notes:

- This is a flexible JSON-based schema aligned with the current typed API stubs.
- Later phases can normalize data into proper relational structures.

---

## 5) Row Level Security (RLS) Policies (Required)

If you don’t enable RLS, your anon key can read/write data unexpectedly.

### 5.1 Enable RLS

Run:

```sql
alter table public.users enable row level security;
alter table public.meal_plans enable row level security;
alter table public.analytics enable row level security;
```

For `meals`, decide if it’s public catalog data or per-user:

- If it’s a global catalog, you can allow read-only for everyone.
- If per-user, treat it like other user tables and enable RLS + policies.

### 5.2 Policies (Recommended Defaults)

Users table: user can read/update only their row.

```sql
create policy "users_select_own"
on public.users for select
using (auth.uid() = id);

create policy "users_insert_own"
on public.users for insert
with check (auth.uid() = id);

create policy "users_update_own"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

Meal plans: user can read/write only their own.

```sql
create policy "meal_plans_select_own"
on public.meal_plans for select
using (auth.uid() = user_id);

create policy "meal_plans_insert_own"
on public.meal_plans for insert
with check (auth.uid() = user_id);

create policy "meal_plans_update_own"
on public.meal_plans for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Analytics: user can read/write only their own.

```sql
create policy "analytics_select_own"
on public.analytics for select
using (auth.uid() = user_id);

create policy "analytics_insert_own"
on public.analytics for insert
with check (auth.uid() = user_id);

create policy "analytics_update_own"
on public.analytics for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Meals (global catalog) example: allow read for everyone, restrict write to service role (not from app).

```sql
alter table public.meals enable row level security;

create policy "meals_select_all"
on public.meals for select
using (true);
```

---

## 6) Connect Supabase to the React Native App (taybat_app)

### 6.1 Configure Environment Variables

1. Copy:
   - `taybat_app/.env.example` → `taybat_app/.env`
2. Fill it:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
API_TIMEOUT=30000
```

Do not commit `.env` (already ignored by `.gitignore`).

### 6.2 react-native-config Integration

The app uses `react-native-config` in:

- [supabaseClient.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/api/supabaseClient.ts)

Android:

- Already configured via:
  - [android/app/build.gradle](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/android/app/build.gradle)

iOS:

1. From `taybat_app/ios`:
   - `bundle install`
   - `bundle exec pod install`
2. If Xcode build doesn’t pick up env values, ensure `react-native-config` pod is properly integrated (Pods will handle most of this).

---

## 7) How Supabase Is Used in This Codebase

### 7.1 Supabase Client

- `src/api/supabaseClient.ts` centralizes the client.
- Auth session persistence uses AsyncStorage:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: false` (mobile safe default)

### 7.2 API Modules (Supabase calls only)

- [authApi.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/api/authApi.ts)
- [userApi.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/api/userApi.ts)
- [mealsApi.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/api/mealsApi.ts)
- [analyticsApi.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/api/analyticsApi.ts)

Rule:

- Screens must not import Supabase client directly; screens call store actions.

### 7.3 Services (Business logic)

- [authService.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/services/authService.ts)
- [userService.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/services/userService.ts)

Rule:

- Services validate inputs, call API modules, map errors, and return clean results.

### 7.4 Stores (State management)

- Auth flows are exposed via store actions:
  - [authStore.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/store/authStore.ts)
- Profile submission through user store:
  - [userStore.ts](file:///Users/abadr/Documents/Abadr/Projects/taybat_sys/taybat_app/src/store/userStore.ts)

---

## 8) Recommended Supabase Checklist Before Shipping

- [ ] RLS enabled on all user data tables
- [ ] Policies tested with anon key + real user sessions
- [ ] Email confirmations configured (if required)
- [ ] OAuth providers configured with correct callback URLs
- [ ] Database backups enabled (production)
- [ ] Realtime enabled only where needed
- [ ] No service-role key is ever used inside the mobile app
