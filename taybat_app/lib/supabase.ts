import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { tracedAsyncStorage } from '@/lib/tracedAsyncStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage on native, default (localStorage) on web
    storage: Platform.OS !== 'web' ? tracedAsyncStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // PKCE is required for exchangeCodeForSession() in the Facebook OAuth flow.
    // Email/password, OTP and signInWithIdToken (Google) are unaffected.
    flowType: 'pkce',
  },
});
