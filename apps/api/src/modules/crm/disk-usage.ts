import { execFile } from "child_process";
import { existsSync } from "fs";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type DiskUsage = {
  usedPercent: number;
  path: string;
};

export type DiskMount = {
  filesystem: string;
  mount: string;
  usedPercent: number;
  usedGb: number;
  totalGb: number;
};

function parseDfLine(line: string, fallbackPath: string): DiskMount | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 6) return null;

  const usedPercent = Number.parseInt((parts[4] ?? "").replace("%", ""), 10);
  const totalKb = Number.parseInt(parts[1] ?? "", 10);
  const usedKb = Number.parseInt(parts[2] ?? "", 10);
  if (!Number.isFinite(usedPercent) || !Number.isFinite(totalKb) || !Number.isFinite(usedKb)) return null;

  return {
    filesystem: parts[0] ?? "—",
    mount: parts[parts.length - 1] ?? fallbackPath,
    usedPercent,
    usedGb: Math.round((usedKb / 1024 / 1024) * 10) / 10,
    totalGb: Math.round((totalKb / 1024 / 1024) * 10) / 10,
  };
}

export async function readDiskUsage(preferredPath: string): Promise<DiskUsage | null> {
  const mount = await readDiskMounts([preferredPath]);
  const primary = mount[0];
  if (!primary) return null;
  return { usedPercent: primary.usedPercent, path: primary.mount };
}

export async function readDiskMounts(
  preferredPaths: string[] = ["/", "/srv", "/var/lib/docker"]
): Promise<DiskMount[]> {
  const paths = [...new Set(preferredPaths.filter((path) => existsSync(path)))];
  if (paths.length === 0) paths.push("/");

  const seen = new Set<string>();
  const mounts: DiskMount[] = [];

  for (const path of paths) {
    try {
      const { stdout } = await execFileAsync("df", ["-P", path], { timeout: 5000 });
      const line = stdout.trim().split("\n")[1];
      if (!line) continue;
      const parsed = parseDfLine(line, path);
      if (!parsed || seen.has(parsed.mount)) continue;
      seen.add(parsed.mount);
      mounts.push(parsed);
    } catch {
      continue;
    }
  }

  return mounts.sort((left, right) => left.mount.localeCompare(right.mount));
}
