/**
 * Logger utility for the application
 * Provides structured logging with different levels and environment-aware output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  component?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, data?: unknown, component?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const prefix = entry.component ? `[${entry.component}]` : '';
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) {
           
          console.debug(message, entry.data || '');
        }
        break;
      case 'info':
         
        console.info(message, entry.data || '');
        break;
      case 'warn':
         
        console.warn(message, entry.data || '');
        break;
      case 'error':
         
        console.error(message, entry.data || '');
        break;
    }
  }

  debug(message: string, data?: unknown, component?: string): void {
    const entry = this.formatMessage('debug', message, data, component);
    this.output(entry);
  }

  info(message: string, data?: unknown, component?: string): void {
    const entry = this.formatMessage('info', message, data, component);
    this.output(entry);
  }

  warn(message: string, data?: unknown, component?: string): void {
    const entry = this.formatMessage('warn', message, data, component);
    this.output(entry);
  }

  error(message: string, data?: unknown, component?: string): void {
    const entry = this.formatMessage('error', message, data, component);
    this.output(entry);
  }

  // Convenience method for auth-related logging
  auth = {
    debug: (message: string, data?: unknown) => this.debug(message, data, 'Auth'),
    info: (message: string, data?: unknown) => this.info(message, data, 'Auth'),
    warn: (message: string, data?: unknown) => this.warn(message, data, 'Auth'),
    error: (message: string, data?: unknown) => this.error(message, data, 'Auth'),
  };

  // Convenience method for API-related logging
  api = {
    debug: (message: string, data?: unknown) => this.debug(message, data, 'API'),
    info: (message: string, data?: unknown) => this.info(message, data, 'API'),
    warn: (message: string, data?: unknown) => this.warn(message, data, 'API'),
    error: (message: string, data?: unknown) => this.error(message, data, 'API'),
  };

  // Convenience method for component-related logging
  component = {
    debug: (component: string, message: string, data?: unknown) => this.debug(message, data, component),
    info: (component: string, message: string, data?: unknown) => this.info(message, data, component),
    warn: (component: string, message: string, data?: unknown) => this.warn(message, data, component),
    error: (component: string, message: string, data?: unknown) => this.error(message, data, component),
  };
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;