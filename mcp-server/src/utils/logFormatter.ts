/**
 * Log Formatter Utility
 * 
 * Provides structured logging functions for the MCP service.
 * All logs are directed to stderr to avoid interfering with stdin/stdout JSON-RPC communication.
 */

// Define log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Define log context type
interface LogContext {
  [key: string]: any;
}

/**
 * Format log message for output
 * 
 * @param level - Log level
 * @param message - Log message
 * @param service - Service name
 * @param version - Service version
 * @param error - Optional error object
 * @param context - Optional context object
 * @returns Formatted log message
 */
function formatLog(
  level: LogLevel,
  message: string,
  service: string,
  version: string,
  error?: Error,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const logObject = {
    timestamp,
    level,
    service,
    version,
    message,
    ...(error && { 
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }),
    ...(context && { context })
  };
  
  return JSON.stringify(logObject);
}

/**
 * Write log message directly to stderr
 * 
 * @param logMessage - Formatted log message
 */
function writeToStderr(logMessage: string): void {
  process.stderr.write(logMessage + '\n');
}

/**
 * Log a debug message
 */
export function logDebug(
  message: string,
  service: string,
  version: string,
  context?: LogContext
): void {
  const formattedLog = formatLog(LogLevel.DEBUG, message, service, version, undefined, context);
  writeToStderr(formattedLog);
}

/**
 * Log an info message
 */
export function logInfo(
  message: string,
  service: string,
  version: string,
  context?: LogContext
): void {
  const formattedLog = formatLog(LogLevel.INFO, message, service, version, undefined, context);
  writeToStderr(formattedLog);
}

/**
 * Log a warning message
 */
export function logWarn(
  message: string,
  service: string,
  version: string,
  error?: Error,
  context?: LogContext
): void {
  const formattedLog = formatLog(LogLevel.WARN, message, service, version, error, context);
  writeToStderr(formattedLog);
}

/**
 * Log an error message
 */
export function logError(
  message: string,
  service: string,
  version: string,
  error: Error,
  context?: LogContext
): void {
  const formattedLog = formatLog(LogLevel.ERROR, message, service, version, error, context);
  writeToStderr(formattedLog);
}
