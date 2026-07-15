import { randomUUID } from "node:crypto";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

export async function registerRequestId(app: NestFastifyApplication) {
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook("onRequest", async (request, reply) => {
    const incoming = request.headers["x-request-id"];
    const id =
      (typeof incoming === "string" && incoming.trim()) ||
      (typeof request.id === "string" && request.id) ||
      randomUUID();
    reply.header("X-Request-Id", id);
    (request as { requestId?: string }).requestId = id;
  });
}
