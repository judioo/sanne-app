// utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

// Set this to the desired log level
let currentLogLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Map log levels to numeric values for comparison
const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

// Helper to check if a message should be logged
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVEL_MAP[level] >= LOG_LEVEL_MAP[currentLogLevel];
};

// Set the current log level
export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
  console.info(`Log level set to: ${level}`);
};

// Logger functions
export const logger = {
  debug: (message: string, ...args: any[]): void => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]): void => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]): void => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};

// Export default logger
export default logger;
