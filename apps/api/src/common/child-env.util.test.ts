import { afterEach, describe, expect, it } from "vitest";
import { pickChildEnv, pickMailChildEnv } from "./child-env.util";

describe("pickChildEnv", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("includes only allowlisted keys", () => {
    process.env.PATH = "/bin";
    process.env.JWT_SECRET = "must-not-leak";
    process.env.DEVUKO_CRM_REPO_ROOT = "/srv/sites/crm.devuko.ru/repo";
    process.env.RANDOM_SECRET = "nope";

    const env = pickChildEnv({ EXTRA: "ok" });
    expect(env.PATH).toBe("/bin");
    expect(env.DEVUKO_CRM_REPO_ROOT).toBe("/srv/sites/crm.devuko.ru/repo");
    expect(env.EXTRA).toBe("ok");
    expect(env.JWT_SECRET).toBeUndefined();
    expect(env.RANDOM_SECRET).toBeUndefined();
  });
});

describe("pickMailChildEnv", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("passes only minimal keys plus extras", () => {
    process.env.PATH = "/bin";
    process.env.HOME = "/home/devuko";
    process.env.DATABASE_URL = "postgresql://secret";
    process.env.AUTH_SMTP_PASS = "smtp-secret";

    const env = pickMailChildEnv({ SMTP_PASS: "mail-pass" });
    expect(env.PATH).toBe("/bin");
    expect(env.HOME).toBe("/home/devuko");
    expect(env.SMTP_PASS).toBe("mail-pass");
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.AUTH_SMTP_PASS).toBeUndefined();
  });
});
