import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type MemoryUsage = {
  usedPercent: number;
  totalMb: number;
  usedMb: number;
};

export async function readMemoryUsage(): Promise<MemoryUsage | null> {
  try {
    const { stdout } = await execFileAsync("free", ["-m"], { timeout: 5000 });
    const line = stdout.trim().split("\n").find((row) => row.startsWith("Mem:"));
    if (!line) return null;
    const parts = line.trim().split(/\s+/);
    const total = Number.parseInt(parts[1] ?? "", 10);
    const used = Number.parseInt(parts[2] ?? "", 10);
    if (!Number.isFinite(total) || !Number.isFinite(used) || total <= 0) return null;
    return {
      totalMb: total,
      usedMb: used,
      usedPercent: Math.round((used / total) * 100),
    };
  } catch {
    return null;
  }
}
