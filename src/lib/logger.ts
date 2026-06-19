type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  route?: string;
  userId?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, message: string, payload: LogPayload = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...payload,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, payload?: LogPayload) => log('info', message, payload),
  warn: (message: string, payload?: LogPayload) => log('warn', message, payload),
  error: (message: string, payload?: LogPayload) => log('error', message, payload),
};
