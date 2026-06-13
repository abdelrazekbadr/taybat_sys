# Database Updates — June 2026

## Beginner's Guide: How to Verify Changes in Supabase

---

## 1. What Changed?

Four database changes were applied across two work sessions:

| # | Migration Name | Target | Purpose |
|---|---|---|---|
| 1 | `add_meal_frequency_limits` | `meals` table | Add frequency cap columns per meal |
| 2 | `notifications_created_at_index` | `app_notifications` table | Index to speed up date-filtered queries |
| 3 | `enable_pg_cron_extension` | DB Extension | Enable scheduled automatic jobs |
| 4 | `schedule_notifications_cleanup_cron` | Cron Job | Auto-delete notifications older than 90 days |

---

## 2. How to Open Supabase Dashboard

### Step-by-step for first-time users

1. Open your browser and go to [supabase.com](https://supabase.com)
2. Click **Sign In** and log in with your account credentials
3. You will see a list of your projects — select **Al-Taybat**
4. The main dashboard opens with a left sidebar navigation

```
Left Sidebar:
├── Table Editor        ← Browse and edit table data
├── SQL Editor          ← Run SQL queries directly
├── Database
│   ├── Tables          ← View table structure and columns
│   ├── Migrations      ← History of all schema changes
│   ├── Indexes         ← List of all indexes
│   └── Extensions      ← Installed Postgres extensions
└── ...
```

---

## Change #1 — Meal Frequency Limit Columns (`meals` table)

### New Columns

Three new nullable integer columns were added to the `meals` table:

| Column | Type | Meaning |
|---|---|---|
| `max_day_frequency` | INTEGER (nullable) | Max times this meal is allowed **per day** |
| `max_week_frequency` | INTEGER (nullable) | Max times allowed in the **last 7 days** |
| `max_month_frequency` | INTEGER (nullable) | Max times allowed in the **last 30 days** |

**Example:** Setting `max_week_frequency = 2` on "Rice with Lamb" means if the user logs that meal more than twice in a week, a red warning appears on the home screen meal card.

> **Note:** `null` means no limit is enforced for that meal.

### Migration SQL — Frequency Columns

```sql
ALTER TABLE meals
  ADD COLUMN IF NOT EXISTS max_day_frequency   INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_week_frequency  INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_month_frequency INTEGER DEFAULT NULL;
```

### Verify the Columns

**Option A — Table Editor (easiest for beginners):**

1. Click **Table Editor** in the left sidebar
2. Find **meals** in the table list on the left and click it
3. Look at the column headers across the top of the data grid
4. You should see `max_day_frequency`, `max_week_frequency`, `max_month_frequency`
5. All cells will be empty (`null`) by default — click any cell to edit the value directly

**Option B — Database → Tables:**

1. Click **Database** → **Tables** in the left sidebar
2. Find the **meals** table and click it
3. Click **Edit Table** — scroll down the column list to see the three new columns

**Option C — SQL Editor (technical verification):**

1. Click **SQL Editor** in the left sidebar
2. Paste this query and click **Run**:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meals'
  AND column_name IN ('max_day_frequency', 'max_week_frequency', 'max_month_frequency');
```

**Expected result:**

```
column_name          | data_type | is_nullable
---------------------|-----------|------------
max_day_frequency    | integer   | YES
max_week_frequency   | integer   | YES
max_month_frequency  | integer   | YES
```

### How to set a frequency limit on a meal

1. Open **Table Editor** → **meals**
2. Find the meal row you want to limit
3. Click the `max_week_frequency` cell on that row
4. Type the limit (e.g. `2`) and press Enter
5. The app will immediately show a warning when that limit is exceeded

---

## Change #2 — Index on `app_notifications`

### Index Definition

```sql
CREATE INDEX idx_app_notifications_created_at
  ON public.app_notifications (created_at DESC);
```

### Why does this matter?

Imagine `app_notifications` has 1,000 rows.

- **Without index:** When a user opens the app and fetches notifications for the last 90 days, Postgres reads all 1,000 rows one-by-one to find matches. This is called a **Sequential Scan** — slow and expensive on compute.
- **With index:** Postgres jumps directly to the matching rows. This is an **Index Scan** — fast, and uses far less compute quota on the Free Tier.

### Verify the Index

**Option A — Database → Indexes:**

1. Click **Database** → **Indexes** in the left sidebar
2. Look for `idx_app_notifications_created_at` in the list
3. It should show table `app_notifications`, column `created_at`

**Option B — SQL Editor:**

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'app_notifications'
ORDER BY indexname;
```

**Expected result:**

```
indexname                          | indexdef
-----------------------------------|--------------------------------------------------
app_notifications_pkey             | CREATE UNIQUE INDEX ... USING btree (id)
idx_app_notifications_created_at   | CREATE INDEX ... USING btree (created_at DESC)
```

---

## Change #3 — Enable `pg_cron` Extension

### What is pg_cron?

`pg_cron` is a Postgres extension that lets you schedule SQL statements to run automatically on a time schedule — exactly like a Linux cron job, but running inside the database itself.

**Usage here:** Automatically delete old notifications every day without any manual intervention.

### Migration SQL — Extension

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
```

### Verify the Extension

**Option A — Database → Extensions:**

1. Click **Database** → **Extensions** in the left sidebar
2. Search for **pg_cron** in the list
3. It should show status **Enabled** (not Disabled)

**Option B — SQL Editor:**

```sql
SELECT name, default_version, installed_version
FROM pg_available_extensions
WHERE name = 'pg_cron';
```

**Expected result:**

```
name    | default_version | installed_version
--------|-----------------|------------------
pg_cron | 1.4             | 1.4
```

If `installed_version` contains a version number (not empty), the extension is active.

---

## Change #4 — Auto-Cleanup Cron Jobs (DELETE + VACUUM)

### Why DELETE alone is not enough

PostgreSQL uses **MVCC** (Multi-Version Concurrency Control). When a `DELETE` runs:

```
DELETE executes
    ↓
Rows are NOT removed from disk immediately
They become "dead tuples" — invisible to queries but still taking space
    ↓
Supabase 500 MB limit counts: live rows + dead tuples + indexes
    ↓
Space is only reclaimed after VACUUM runs
```

**Without VACUUM after DELETE, the measured DB size can stay the same or grow** due to WAL entries and dead tuple accumulation. Supabase runs `autovacuum` automatically, but it only triggers when dead tuples exceed 20% of live rows — which may be too late or too infrequent for a daily cleanup job.

> **Note on WAL logs:** WAL (Write-Ahead Log / transaction log) is NOT counted in your 500 MB Supabase storage. `pg_database_size()` measures table data + indexes + dead tuples — not WAL. WAL is managed and recycled by Supabase automatically.

### Two cron jobs: DELETE then VACUUM

Two jobs are scheduled 30 minutes apart:

```sql
-- Job 1: Delete old notifications at 3:00 AM UTC
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * *',
  $$DELETE FROM public.app_notifications
    WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Job 2: VACUUM 30 minutes later to reclaim the freed space
-- ANALYZE also updates query planner stats so the created_at index is used correctly
SELECT cron.schedule(
  'vacuum-app-notifications',
  '30 3 * * *',
  'VACUUM ANALYZE public.app_notifications'
);
```

**Timeline every night:**

```
03:00 AM  → DELETE old notifications  (marks rows as dead tuples)
              ↓ notification_reads cascade-deleted automatically via FK
03:30 AM  → VACUUM ANALYZE             (reclaims dead tuple space on disk)
              ↓ query planner stats updated → index used efficiently
```

### VACUUM vs VACUUM FULL

| Command | What it does | Safe for production? |
| --- | --- | --- |
| `VACUUM table` | Marks dead space as reusable (no OS-level shrink) | ✓ Yes — no lock |
| `VACUUM ANALYZE table` | Same + updates query planner stats | ✓ Yes — no lock |
| `VACUUM FULL table` | Rewrites entire table, shrinks OS file | ✗ No — full table lock, avoid in production |

We use `VACUUM ANALYZE` — it reclaims space and keeps the query planner informed about the index, without locking the table.

### Why this matters on the Free Tier

- Supabase Free Tier gives you **500 MB** of database storage
- DELETE without VACUUM: dead tuples still count toward the 500 MB
- DELETE + VACUUM: space is actually freed and the 500 MB limit is correctly utilized
- With both jobs: the table stays bounded at ~90 days of data with no bloat accumulating

### Cron schedule format explained

```
┌──────── Minute       (0  = at minute 0, i.e. top of the hour)
│  ┌───── Hour         (3  = 3:00 AM UTC)
│  │  ┌── Day of month (* = every day)
│  │  │  ┌ Month       (* = every month)
│  │  │  │  ┌ Day of week (* = every day of week)
│  │  │  │  │
0  3  *  *  *
```

### Verify the Job

**Option A — SQL Editor (check job exists):**

```sql
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'cleanup-old-notifications';
```

**Expected result:**

```
jobid | jobname                    | schedule  | active
------|----------------------------|-----------|--------
  1   | cleanup-old-notifications  | 0 3 * * * | true
```

**Option B — SQL Editor (check execution history):**

After the job has run at least once, you can see its history:

```sql
SELECT jobid, status, start_time, end_time, return_message
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-notifications'
)
ORDER BY start_time DESC
LIMIT 5;
```

This shows the last 5 executions and whether they succeeded.

---

## 3. Migration History

Every schema change is recorded under **Database → Migrations** in the Supabase dashboard.

### View via UI

1. Click **Database** in the left sidebar
2. Click **Migrations**
3. A table lists every migration in chronological order with version timestamp and name

### View via SQL

```sql
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

**Recent migrations in this project:**

```
version           | name
------------------|----------------------------------------------
20260613200532    | schedule_notifications_cleanup_cron
20260613183647    | enable_pg_cron_extension
20260613183644    | notifications_created_at_index
20260613175649    | add_meal_frequency_limits
20260613005040    | create_public_config
20260610225629    | align_library_admin_setup_with_live_schema
20260610225529    | admin_full_access_public_rls_tables
```

> **Version format:** `YYYYMMDDHHMMSS` — the timestamp when the migration was applied.

---

## 4. How the Changes Affect the App

### Meal frequency warning flow

```
User opens Home screen
        ↓
App loads today's meals (todayMeals)
        ↓
For each meal → compute:
  dayCount   = times logged today
  weekCount  = times logged in last 7 days
  monthCount = times logged in last 30 days
        ↓
Compare against max_day_frequency / max_week_frequency / max_month_frequency
        ↓
Exceeded limit  →  RED text   "You have exceeded the recommended limit for this meal..."
Within limit    →  GREY text  "You had this meal X times this week"
```

**Priority order:** Day limit checked first → then Week → then Month.

### New user notification filter flow

```
New user registered on 2026-06-10
        ↓
App calls: getNotifications(userId, userRegisteredAt = '2026-06-10T...')
        ↓
Repository computes:
  ninetyDaysAgo = 2026-03-16
  cutoff = MAX('2026-03-16', '2026-06-10') = '2026-06-10'
        ↓
SQL: SELECT * FROM app_notifications WHERE created_at >= '2026-06-10'
        ↓
User only sees notifications published after their registration date ✓
```

For an existing user registered 200 days ago, `cutoff` becomes `ninetyDaysAgo` — they see only the last 90 days, not their full history.

---

## 5. Quick Verification Checklist

Run this single query in SQL Editor to verify all four changes at once:

```sql
SELECT
  'meal frequency columns' AS item,
  COUNT(*) AS found,
  CASE WHEN COUNT(*) = 3 THEN '✓ OK' ELSE '✗ MISSING' END AS status
FROM information_schema.columns
WHERE table_name = 'meals'
  AND column_name IN ('max_day_frequency','max_week_frequency','max_month_frequency')

UNION ALL

SELECT
  'notifications index',
  COUNT(*),
  CASE WHEN COUNT(*) = 1 THEN '✓ OK' ELSE '✗ MISSING' END
FROM pg_indexes
WHERE tablename = 'app_notifications'
  AND indexname = 'idx_app_notifications_created_at'

UNION ALL

SELECT
  'pg_cron extension',
  COUNT(*),
  CASE WHEN COUNT(*) = 1 THEN '✓ OK' ELSE '✗ MISSING' END
FROM pg_available_extensions
WHERE name = 'pg_cron'
  AND installed_version IS NOT NULL

UNION ALL

SELECT
  'cleanup cron job',
  COUNT(*),
  CASE WHEN COUNT(*) = 1 THEN '✓ OK' ELSE '✗ MISSING' END
FROM cron.job
WHERE jobname = 'cleanup-old-notifications';
```

**Expected output (all healthy):**

```
item                    | found | status
------------------------|-------|--------
meal frequency columns  | 3     | ✓ OK
notifications index     | 1     | ✓ OK
pg_cron extension       | 1     | ✓ OK
cleanup cron job        | 1     | ✓ OK
```

---

## 6. Free Tier Resource Impact

| Resource | Free Tier Limit | How These Changes Help |
|---|---|---|
| Database storage | 500 MB | pg_cron prevents notification accumulation |
| Bandwidth | 5 GB / month | 5–10 min store cache reduces DB requests by ~80% |
| Active connections | 60 | Cache reduces concurrent DB connections |
| Compute (CPU) | Limited | Index scan vs sequential scan = far less CPU per query |

### The golden rule for this project

Any table that grows over time (`user_meals`, `app_notifications`, `users_ratings`) must have:

1. **Date window on queries** — never fetch unbounded history
2. **Index on the date column** — turn Sequential Scans into Index Scans
3. **Cron job for cleanup** — if data beyond a retention window is not needed
