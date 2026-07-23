import { createJSONStorage } from 'zustand/middleware';

import { tracedAsyncStorage } from '@/lib/tracedAsyncStorage';

/**
 * Shared JSON storage for zustand `persist` middleware, backed by AsyncStorage
 * (localStorage on web via the same AsyncStorage web shim). Use this so every
 * offline cache serializes identically.
 */
export const persistJSONStorage = createJSONStorage(() => tracedAsyncStorage);
