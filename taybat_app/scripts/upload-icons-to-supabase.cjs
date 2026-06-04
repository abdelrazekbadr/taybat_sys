const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.stderr.write(
    'Missing env vars. Need SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY.\n',
  );
  process.exit(1);
}

const bucket = 'taybat_app_assets';
const localDir = path.resolve(process.cwd(), 'assets/icons');
const objectPrefix = 'icons';

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

function log(line) {
  process.stdout.write(`${line}\n`);
}

function warn(line) {
  process.stderr.write(`${line}\n`);
}

async function ensureBucket(supabase) {
  try {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error && !String(error.message || '').toLowerCase().includes('already exists')) {
      warn(`createBucket warning: ${error.message}`);
    }
  } catch (error) {
    warn(`createBucket exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const { error } = await supabase.storage.updateBucket(bucket, { public: true });
    if (error) warn(`updateBucket warning: ${error.message}`);
  } catch (error) {
    warn(`updateBucket exception: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function uploadIcons(supabase) {
  if (!fs.existsSync(localDir)) {
    throw new Error(`Local directory does not exist: ${localDir}`);
  }

  const files = fs.readdirSync(localDir).filter((f) => f.toLowerCase().endsWith('.png'));
  if (!files.length) {
    log(`No .png files found in ${localDir}`);
    return [];
  }

  const results = [];
  for (const filename of files) {
    const absPath = path.join(localDir, filename);
    const objectPath = `${objectPrefix}/${filename}`;
    const bytes = fs.readFileSync(absPath);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, bytes, { contentType: 'image/png', upsert: true });

    if (uploadError) {
      warn(`Upload failed: ${filename} - ${uploadError.message}`);
      continue;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    results.push({ filename, publicUrl: data.publicUrl });
    log(`Uploaded: ${filename} -> ${data.publicUrl}`);
  }

  return results;
}

async function updateReferenceTableImages(supabase, tableName, whereKey) {
  const { data: rows, error } = await supabase.from(tableName).select(`${whereKey}, image`);
  if (error) throw error;

  const prefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPrefix}/`;

  const candidates = (rows ?? []).filter((r) => typeof r.image === 'string' && r.image && !isHttpUrl(r.image));
  if (!candidates.length) {
    log(`No rows to update in ${tableName}.`);
    return;
  }

  for (const row of candidates) {
    const nextUrl = `${prefix}${row.image}.png`;
    const { error: updateError } = await supabase.from(tableName).update({ image: nextUrl }).eq(whereKey, row[whereKey]);
    if (updateError) {
      warn(`Update failed ${tableName}:${row[whereKey]} - ${updateError.message}`);
      continue;
    }
    log(`Updated ${tableName}:${row[whereKey]} -> ${nextUrl}`);
  }
}

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  log(`Bucket: ${bucket}`);
  log(`Local icons dir: ${localDir}`);

  await ensureBucket(supabase);
  await uploadIcons(supabase);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('Skipped DB updates (set SUPABASE_SERVICE_ROLE_KEY to update reference tables).');
    return;
  }

  await updateReferenceTableImages(supabase, 'health_conditions', 'code');
  await updateReferenceTableImages(supabase, 'health_goals', 'code');
}

main().catch((error) => {
  warn(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
