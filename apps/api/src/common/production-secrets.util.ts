export function validateProductionSecrets(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const errors: string[] = [];

  const jwt = process.env.JWT_SECRET?.trim();
  if (!jwt || jwt.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters in production");
  }

  const postgresPassword = process.env.POSTGRES_PASSWORD?.trim();
  if (!postgresPassword || postgresPassword === "devuko") {
    errors.push("POSTGRES_PASSWORD must be set to a strong value in production");
  }

  const proxySecret = process.env.DEVUKO_PROXY_SECRET?.trim();
  if (!proxySecret || proxySecret.length < 32) {
    errors.push("DEVUKO_PROXY_SECRET must be at least 32 characters in production");
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (databaseUrl.includes("devuko:devuko@") || databaseUrl.includes(":devuko@postgres")) {
    errors.push("DATABASE_URL must not use default credentials in production");
  }

  if (errors.length > 0) {
    throw new Error(`Production secret validation failed:\n- ${errors.join("\n- ")}`);
  }
}
