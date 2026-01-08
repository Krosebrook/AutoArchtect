/**
 * Structured logging utility for AI requests and system events
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      error
    };

    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const prefix = `[${level}] ${new Date(entry.timestamp).toISOString()}`;
    const contextStr = context ? JSON.stringify(context) : '';
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, contextStr, error);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, contextStr);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, contextStr);
        break;
      default:
        console.log(prefix, message, contextStr);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clear(): void {
    this.logs = [];
  }
}

export const logger = new Logger();
