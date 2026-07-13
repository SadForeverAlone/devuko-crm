import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_PREFIX = "scrypt:";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${SCRYPT_PREFIX}${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  if (stored.startsWith(SCRYPT_PREFIX)) {
    const body = stored.slice(SCRYPT_PREFIX.length);
    const [salt, hash] = body.split(":");
    if (!salt || !hash) return false;
    const derived = scryptSync(password, salt, 64).toString("hex");
    try {
      return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
    } catch {
      return false;
    }
  }
  const legacy = createHash("sha256").update(password).digest("hex");
  return legacy === stored;
}

export function shouldRehash(stored: string) {
  return !stored.startsWith(SCRYPT_PREFIX);
}
