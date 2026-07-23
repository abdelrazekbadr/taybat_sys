import AsyncStorage from '@react-native-async-storage/async-storage';

import { createLogger } from '@/lib/logger';

const log = createLogger('AsyncStorageTrace');

/**
 * Dev-only diagnostic wrapper around AsyncStorage. Logs a full JS stack the
 * moment any call site passes a non-string key — the native module only
 * warns ("[AsyncStorage] Using undefined type for key...") without saying
 * who called it, so this exists purely to make that call site traceable.
 * Passes straight through to the real AsyncStorage in production.
 */
function traceKey(method: string, key: unknown): void {
  if (typeof key !== 'string') {
    log.error(`${method}() called with non-string key (${typeof key}):`, key);
    log.error(
      new Error(`AsyncStorage.${method} traced call stack`).stack ??
        'no stack available',
    );
  }
}

export const tracedAsyncStorage: typeof AsyncStorage = __DEV__
  ? new Proxy(AsyncStorage, {
      get(target, prop, receiver) {
        if (
          prop === 'getItem' ||
          prop === 'setItem' ||
          prop === 'removeItem' ||
          prop === 'mergeItem'
        ) {
          const original = Reflect.get(target, prop, receiver) as (
            ...args: unknown[]
          ) => unknown;
          return (...args: unknown[]) => {
            traceKey(String(prop), args[0]);
            return original.apply(target, args);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    })
  : AsyncStorage;
