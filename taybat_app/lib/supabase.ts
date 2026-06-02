import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage on native, default (localStorage) on web
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
