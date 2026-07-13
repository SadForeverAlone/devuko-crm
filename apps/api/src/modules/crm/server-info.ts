import { readFile } from "fs/promises";
import * as os from "os";

export type ServerInfo = {
  hostname: string;
  uptimeSeconds: number;
  platform: string;
  arch: string;
};

export async function readServerInfo(): Promise<ServerInfo> {
  let uptimeSeconds = Math.floor(os.uptime());

  try {
    const raw = await readFile("/proc/uptime", "utf8");
    const value = Number.parseFloat(raw.split(" ")[0] ?? "");
    if (Number.isFinite(value)) uptimeSeconds = Math.floor(value);
  } catch {
    /* use os.uptime fallback */
  }

  return {
    hostname: os.hostname(),
    uptimeSeconds,
    platform: `${os.type()} ${os.release()}`,
    arch: os.arch(),
  };
}
