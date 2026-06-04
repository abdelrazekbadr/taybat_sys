# Supabase Storage — Icons Upload + DB URL Migration (taybat_app_assets)

## Goal

Move local icons from `taybat_app/assets/icons/` to Supabase Storage bucket `taybat_app_assets`, then store **public URLs** in the DB so UI can render icons dynamically (remote URL) and still support static Metro `require()` assets.

Reference: https://supabase.com/docs/guides/ai-tools/mcp

---

## What was changed in the app

### 1) OptionSelector supports remote URLs

`OptionSelector` (used by onboarding goals/conditions) now treats `icon.name` as:

- remote image when it starts with `http://` or `https://`
- otherwise, it falls back to the local static map `ICON_SOURCES[name]`

File:
- `components/common/OptionSelector.tsx`

This makes the following code paths work with DB-provided URLs:

- `components/auth/ProfileStepGoals.tsx` → `g.image`
- `components/auth/ProfileStepHealthConditions.tsx` → `c.image`

---

## What was done in Supabase (via MCP Database SQL)

### 2) Verified the Storage bucket exists and is public

```sql
select id, name, public, created_at
from storage.buckets
where name = 'taybat_app_assets';
```

Expected:
- `public = true`

### 3) Verified the bucket has no uploaded icon objects yet

```sql
select name
from storage.objects
where bucket_id = 'taybat_app_assets'
  and name like 'icons/%'
order by name;
```

Expected (before upload):
- empty array / 0 rows

### 4) Updated reference tables to store public icon URLs

This migrates short image keys like `goal_pain` → full public URL:

```sql
update public.health_goals
set image = 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/' || image || '.png'
where image is not null and image !~ '^https?://';
```

```sql
update public.health_conditions
set image = 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/' || image || '.png'
where image is not null and image !~ '^https?://';
```

Sanity check:

```sql
select code, image from public.health_goals order by code;
select code, image from public.health_conditions order by code;
```

---

## Uploading the icon files to Storage

After the DB migration, icons will render correctly only once the files exist in Storage at:

```
bucket: taybat_app_assets
path:   icons/<filename>.png
```

Example:
```
icons/goal_pain.png
icons/hc_diabetes.png
```

### Option A) Supabase Dashboard (manual)

1. Go to Storage → `taybat_app_assets`
2. Create folder `icons/` (if missing)
3. Upload all `.png` files from:
   `taybat_app/assets/icons/`
4. Re-run the `storage.objects` query to confirm objects exist.

### Option B) Local upload script (recommended for bulk)

File:
- `scripts/upload-icons-to-supabase.cjs`

Run from `taybat_app/` (do not commit secrets):

```bash
SUPABASE_URL="https://mbbbdhyhtqkxakmblzmk.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
node scripts/upload-icons-to-supabase.cjs
```

Notes:
- This script uploads `assets/icons/*.png` to `taybat_app_assets/icons/`.
- If `SUPABASE_SERVICE_ROLE_KEY` is set, it can also update DB rows (but DB is already migrated using MCP SQL).

---

## Enabling Storage tools in Supabase MCP (per docs)

Supabase MCP Storage tools are **disabled by default**. The docs list:

- `list_storage_buckets`
- `get_storage_config` / `update_storage_config`

From the official guide:
https://supabase.com/docs/guides/ai-tools/mcp

The MCP server supports URL query parameters:

- `features=<groups>` (comma-separated)

Example (storage-only server):

```
https://mcp.supabase.com/mcp?project_ref=mbbbdhyhtqkxakmblzmk&features=storage
```

After updating MCP config, re-authenticate the MCP server in your MCP client, then you should be able to call the Storage tools.

