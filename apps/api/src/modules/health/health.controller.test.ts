import { HttpStatus } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { DatabaseService } from "../database/database.service";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  function createController(dbUp: boolean) {
    const db = {
      query: async () => {
        if (!dbUp) {
          throw new Error("db down");
        }
        return { rows: [{ "?column?": 1 }] };
      },
    } as Pick<DatabaseService, "query">;
    return new HealthController(db as DatabaseService);
  }

  it("returns ok when database responds", async () => {
    const controller = createController(true);
    const reply = { status: () => reply } as { status: (code: number) => unknown };
    await expect(controller.check(reply as never)).resolves.toEqual({ ok: true, db: "up" });
  });

  it("returns 503 when database is unavailable", async () => {
    const controller = createController(false);
    let statusCode = 0;
    const reply = {
      status(code: number) {
        statusCode = code;
        return reply;
      },
    };
    await expect(controller.check(reply as never)).resolves.toEqual({ ok: false, db: "down" });
    expect(statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
