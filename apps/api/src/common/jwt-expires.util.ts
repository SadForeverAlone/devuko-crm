const DEFAULT_JWT_EXPIRES_SECONDS = 8 * 3600;
const PRODUCTION_JWT_EXPIRES_SECONDS = 2 * 3600;

/** JWT lifetime in seconds; override via JWT_EXPIRES_IN (e.g. 28800). */
export function resolveJwtExpiresIn(): number {
  const raw = process.env.JWT_EXPIRES_IN?.trim();
  if (!raw) {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_JWT_EXPIRES_SECONDS
      : DEFAULT_JWT_EXPIRES_SECONDS;
  }
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.floor(seconds);
  }
  return DEFAULT_JWT_EXPIRES_SECONDS;
}
