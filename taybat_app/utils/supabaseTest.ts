import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('SupabaseTest');

/**
 * Dev-only: tests Supabase reachability and database table existence.
 * Call this from any screen button during development.
 */
export async function testSupabaseConnection(): Promise<void> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '(missing)';
  const lines: string[] = [];

  // ── Test 1: Auth SDK ──
  const t0 = Date.now();
  const { error: sessionError } = await supabase.auth.getSession();
  const ms0 = Date.now() - t0;
  if (sessionError) {
    lines.push(`❌ Auth SDK (${ms0}ms): ${sessionError.message}`);
    log.error('[SupabaseTest] getSession error:', sessionError);
  } else {
    lines.push(`✅ Auth SDK OK (${ms0}ms)`);
    log.info('[SupabaseTest] getSession OK');
  }

  // ── Test 2: profiles table ──
  const t1 = Date.now();
  const { error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  const ms1 = Date.now() - t1;
  if (profilesError) {
    lines.push(`❌ profiles table (${ms1}ms):`);
    lines.push(`   code: ${profilesError.code}`);
    lines.push(`   ${profilesError.message}`);
    log.error('[SupabaseTest] profiles query error:', profilesError);
  } else {
    lines.push(`✅ profiles table OK (${ms1}ms)`);
    log.info('[SupabaseTest] profiles table OK');
  }

  // ── Test 3: profiles upsert (only if there's an active session) ──
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.user) {
    const uid = sessionData.session.user.id;
    const t2 = Date.now();
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: uid, updated_at: new Date().toISOString() })
      .select()
      .single();
    const ms2 = Date.now() - t2;
    if (upsertError) {
      lines.push(`❌ profiles upsert (${ms2}ms):`);
      lines.push(`   code: ${upsertError.code}`);
      lines.push(`   ${upsertError.message}`);
      if (upsertError.hint) lines.push(`   hint: ${upsertError.hint}`);
      log.error('[SupabaseTest] upsert error:', upsertError);
    } else {
      lines.push(`✅ profiles upsert OK (${ms2}ms)`);
      log.info('[SupabaseTest] upsert OK for uid:', uid);
    }
  } else {
    lines.push(`⚠️  profiles upsert: skipped (not logged in)`);
  }

  // ── Test 4: check email confirmation setting ──
  const { data: authSettingsData } = await supabase.auth.getSession();
  const emailConfirmed = authSettingsData?.session?.user?.email_confirmed_at;
  if (authSettingsData?.session?.user) {
    lines.push('');
    lines.push(`Email confirmed: ${emailConfirmed ? '✅ yes' : '❌ no (OTP will fail)'}`);
  }

  lines.push('');
  lines.push(`Project: ${url.replace('https://', '').split('.')[0]}`);

  log.info('[SupabaseTest] Result:\n' + lines.join('\n'));
  Alert.alert('Supabase Diagnostics', lines.join('\n'));
}
