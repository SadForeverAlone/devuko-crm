import { readFile } from "fs/promises";

type CpuSample = { idle: number; total: number };

function parseCpuLine(line: string): CpuSample | null {
  const parts = line.trim().split(/\s+/);
  if (parts[0] !== "cpu") return null;
  const values = parts.slice(1).map((value) => Number.parseInt(value, 10));
  if (values.some((value) => !Number.isFinite(value))) return null;
  const idle = values[3] + (values[4] ?? 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  return { idle, total };
}

async function readCpuSample(): Promise<CpuSample | null> {
  try {
    const raw = await readFile("/proc/stat", "utf8");
    const line = raw.split("\n")[0];
    if (!line) return null;
    return parseCpuLine(line);
  } catch {
    return null;
  }
}

function usagePercent(before: CpuSample, after: CpuSample) {
  const idleDelta = after.idle - before.idle;
  const totalDelta = after.total - before.total;
  if (totalDelta <= 0) return null;
  const used = totalDelta - idleDelta;
  return Math.max(0, Math.min(100, Math.round((used / totalDelta) * 100)));
}

export type CpuUsage = {
  usedPercent: number;
};

export async function readCpuUsage(): Promise<CpuUsage | null> {
  const first = await readCpuSample();
  if (!first) return null;
  await new Promise((resolve) => setTimeout(resolve, 180));
  const second = await readCpuSample();
  if (!second) return null;
  const usedPercent = usagePercent(first, second);
  if (usedPercent == null) return null;
  return { usedPercent };
}
