import { useEffect, useState } from "react";
import type { CrmPlatformMetrics } from "@/entities/crm";

export type MetricHistoryPoint = {
  at: string;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  containers: number | null;
};

const STORAGE_KEY = "devuko-crm-metric-history";
const MAX_POINTS = 120;
export const CHART_SLOTS = 48;

function loadHistory(): MetricHistoryPoint[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MetricHistoryPoint[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_POINTS) : [];
  } catch {
    return [];
  }
}

function saveHistory(points: MetricHistoryPoint[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(points.slice(-MAX_POINTS)));
  } catch {
    /* ignore */
  }
}

function snapshot(metrics: {
  cpuUsage?: { usedPercent: number } | null;
  memoryUsage?: { usedPercent: number } | null;
  storageUsage?: { usedPercent: number } | null;
  docker?: { runningCount: number } | null;
}): MetricHistoryPoint {
  return {
    at: new Date().toISOString(),
    cpu: metrics.cpuUsage?.usedPercent ?? null,
    ram: metrics.memoryUsage?.usedPercent ?? null,
    disk: metrics.storageUsage?.usedPercent ?? null,
    containers: metrics.docker?.runningCount ?? null,
  };
}

function pointsEqual(left: MetricHistoryPoint, right: MetricHistoryPoint) {
  return (
    left.cpu === right.cpu &&
    left.ram === right.ram &&
    left.disk === right.disk &&
    left.containers === right.containers
  );
}

function appendPoint(prev: MetricHistoryPoint[], point: MetricHistoryPoint) {
  const last = prev[prev.length - 1];
  if (last) {
    const elapsed = new Date(point.at).getTime() - new Date(last.at).getTime();
    if (elapsed < 4_000 && pointsEqual(last, point)) return prev;
  }
  const next = [...prev, point].slice(-MAX_POINTS);
  saveHistory(next);
  return next;
}

export function useMetricHistory(metrics: CrmPlatformMetrics | null) {
  const [history, setHistory] = useState<MetricHistoryPoint[]>(() => loadHistory());

  useEffect(() => {
    if (!metrics) return;
    const point = snapshot(metrics);
    setHistory((prev) => appendPoint(prev, point));
  }, [
    metrics,
    metrics?.cpuUsage?.usedPercent,
    metrics?.memoryUsage?.usedPercent,
    metrics?.storageUsage?.usedPercent,
    metrics?.docker?.runningCount,
  ]);

  return history;
}

function resampleSeries(values: number[], slots: number) {
  if (values.length === 0) return [];
  if (values.length === 1) return Array.from({ length: slots }, () => values[0]);
  if (values.length >= slots) return values.slice(-slots);

  return Array.from({ length: slots }, (_, index) => {
    const t = (index / (slots - 1)) * (values.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(values.length - 1, Math.ceil(t));
    const frac = t - lo;
    return values[lo] * (1 - frac) + values[hi] * frac;
  });
}

export function chartSeries(
  history: MetricHistoryPoint[],
  key: keyof Omit<MetricHistoryPoint, "at">,
  fallback: number | null | undefined,
  slots = CHART_SLOTS
) {
  const raw = history
    .map((point) => point[key])
    .filter((value): value is number => value != null && Number.isFinite(value));

  if (raw.length === 0) {
    if (fallback == null) return [];
    return Array.from({ length: slots }, (_, index) => {
      const wave = Math.sin(index * 0.38) * Math.min(4, Math.max(1.5, fallback * 0.04));
      return Math.max(0, fallback + wave);
    });
  }

  return resampleSeries(raw, slots);
}

export function chartTimeLabels(history: MetricHistoryPoint[], locale: string, slots = CHART_SLOTS) {
  if (history.length >= 2) {
    const resampled = resampleSeries(
      history.map((point) => new Date(point.at).getTime()),
      slots
    );
    return resampled.map((ts) =>
      new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(ts))
    );
  }

  const stepMs = 15_000;
  const now = Date.now();
  return Array.from({ length: slots }, (_, index) => {
    const ts = now - (slots - 1 - index) * stepMs;
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
  });
}

export function seriesStats(values: number[]) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { min, max, avg };
}

export function seriesMaxValue(values: number[], floor = 10) {
  if (values.length === 0) return floor;
  return Math.max(floor, Math.ceil(Math.max(...values) * 1.2));
}

export function chartYDomain(values: number[], unit: string, maxValue?: number) {
  if (unit === "%") {
    return { min: 0, max: maxValue ?? 100 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  return {
    min: Math.max(0, min - spread * 0.15),
    max: maxValue ?? max + spread * 0.2,
  };
}
