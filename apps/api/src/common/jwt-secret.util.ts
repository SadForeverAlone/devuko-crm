export function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";
  const allowWeak = process.env.DEV_ALLOW_WEAK_JWT === "true";

  if (isProd) {
    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET must be set and at least 32 characters in production");
    }
    return secret;
  }

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (allowWeak) {
    return secret || "dev-jwt-secret";
  }

  throw new Error(
    "JWT_SECRET must be set (>=32 chars) or set DEV_ALLOW_WEAK_JWT=true for local development"
  );
}
