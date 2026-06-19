export async function register() {
  // Hook point for future monitoring (Sentry, etc.)
}

export async function onRequestError(
  err: Error,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string }
) {
  const { logger } = await import('@/lib/logger');
  logger.error('Request error', {
    route: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    error: err.message,
    stack: err.stack,
  });
}
