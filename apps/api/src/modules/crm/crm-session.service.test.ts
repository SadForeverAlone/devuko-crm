import { describe, expect, it, vi } from "vitest";
import type { JwtService } from "@nestjs/jwt";
import { CrmSessionService } from "./crm-session.service";
import type { DatabaseService } from "../database/database.service";

function createService() {
  const db = {
    execute: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ rows: [{ id: "sess_1" }] }),
  } satisfies Partial<DatabaseService>;

  const jwt = {
    sign: vi.fn().mockReturnValue("signed-jwt"),
    verify: vi.fn().mockReturnValue({ sid: "sess_abc", sub: "admin_1" }),
  } satisfies Partial<JwtService>;

  const service = new CrmSessionService(db as DatabaseService, jwt as JwtService);
  return { service, db, jwt };
}

describe("CrmSessionService", () => {
  it("issues JWT with server session row", async () => {
    const { service, db, jwt } = createService();

    const token = await service.issueForAdmin({
      id: "admin_1",
      email: "admin@devuko.ru",
      firstName: "Platform",
      lastName: "Admin",
    });

    expect(token).toBe("signed-jwt");
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining(`INSERT INTO "CrmAuthSession"`),
      expect.arrayContaining(["admin_1"])
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: "admin_1", sid: expect.stringMatching(/^sess_/) }),
      expect.any(Object)
    );
  });

  it("revokes session by id", async () => {
    const { service, db } = createService();
    await service.revokeSession("sess_abc");
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining(`SET "revokedAt"`),
      ["sess_abc"]
    );
  });

  it("checks active session in database", async () => {
    const { service, db } = createService();
    await expect(service.isSessionActive("sess_abc")).resolves.toBe(true);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining(`"revokedAt" IS NULL`), ["sess_abc"]);
  });
});
