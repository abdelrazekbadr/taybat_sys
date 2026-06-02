import { logger as RNLogger, consoleTransport } from 'react-native-logs';

const rootLog = RNLogger.createLogger({
  levels: { debug: 0, info: 1, warn: 2, error: 3 },
  // In dev: show everything. In prod: errors only (silent traces).
  severity: __DEV__ ? 'debug' : 'error',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'white',
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
  async: true,
  printDate: false,
  enabled: true,
});

/**
 * Returns a namespaced logger for a module.
 * Each call site defines its own namespace so Metro logs are scannable.
 *
 * Usage:
 *   const log = createLogger('Auth');
 *   log.debug('verifyOtp →', email);
 *   log.error('login failed', err.message);
 */
export function createLogger(namespace: string) {
  return rootLog.extend(namespace);
}
