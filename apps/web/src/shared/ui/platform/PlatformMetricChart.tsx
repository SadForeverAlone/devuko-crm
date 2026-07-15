import { useId, useMemo } from "react";

type PlatformSparklineProps = {
  values: number[];
  color?: string;
  maxValue?: number;
  minValue?: number;
  height?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildPoints(
  values: number[],
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
  yMin: number,
  yMax: number
) {
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const span = Math.max(0.001, yMax - yMin);

  return values.map((value, index) => {
    const x = pad.left + (values.length <= 1 ? innerW / 2 : (index / (values.length - 1)) * innerW);
    const y = pad.top + innerH - ((clamp(value, yMin, yMax) - yMin) / span) * innerH;
    return { x, y, value };
  });
}

function smoothLine(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function yDomain(values: number[], maxValue?: number, minValue?: number) {
  if (values.length === 0) return { min: 0, max: maxValue ?? 100 };
  const min = minValue ?? Math.min(...values);
  const max = maxValue ?? Math.max(...values);
  const spread = Math.max(1, max - min);
  return {
    min: minValue ?? Math.max(0, min - spread * 0.25),
    max: maxValue ?? max + spread * 0.15,
  };
}

export function PlatformSparkline({
  values,
  color = "#a78bfa",
  maxValue,
  minValue,
  height = 44,
  className = "",
}: PlatformSparklineProps) {
  const gradientId = useId();
  const glowId = useId();
  const width = 160;
  const vbHeight = 40;
  const pad = { top: 4, right: 4, bottom: 4, left: 4 };
  const domain = yDomain(values, maxValue, minValue);
  const points = buildPoints(values, width, vbHeight, pad, domain.min, domain.max);
  const line = smoothLine(points);
  const baseline = vbHeight - pad.bottom;
  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
      : "";
  const last = points[points.length - 1];

  return (
    <div
      className={`crm-monitor-sparkline crm-monitor-sparkline--h${height} ${className}`.trim()}
    >
      {points.length > 0 ? (
        <svg viewBox={`0 0 ${width} ${vbHeight}`} preserveAspectRatio="none" className="crm-monitor-sparkline__svg" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
          />
          {last ? <circle cx={last.x} cy={last.y} r="3.5" fill={color} stroke="#0a0a0b" strokeWidth="1.5" /> : null}
        </svg>
      ) : (
        <span className="crm-monitor-sparkline__empty" />
      )}
    </div>
  );
}

type PlatformMetricTileProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "healthy" | "warning" | "critical" | "neutral";
  values: number[];
  color?: string;
  maxValue?: number;
};

const toneColors = {
  healthy: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  neutral: "#a78bfa",
};

export function PlatformMetricTile({
  label,
  value,
  detail,
  tone = "neutral",
  values,
  color,
  maxValue,
}: PlatformMetricTileProps) {
  const stroke = color ?? toneColors[tone];

  return (
    <article className={`crm-monitor-tile crm-monitor-tile--${tone}`}>
      <div className="crm-monitor-tile__top">
        <span className="crm-monitor-tile__label">{label}</span>
        <span className="crm-monitor-tile__value">{value}</span>
      </div>
      <PlatformSparkline values={values} color={stroke} maxValue={maxValue} />
      {detail ? <p className="crm-monitor-tile__detail">{detail}</p> : null}
    </article>
  );
}

type PlatformMetricChartProps = {
  title: string;
  values: number[];
  labels?: string[];
  color?: string;
  maxValue?: number;
  unit?: string;
  emptyLabel?: string;
};

export function PlatformMetricChart({
  title,
  values,
  labels = [],
  color = "#a78bfa",
  maxValue,
  unit = "%",
  emptyLabel = "—",
}: PlatformMetricChartProps) {
  const gradientId = useId();
  const glowId = useId();
  const width = 640;
  const height = 200;
  const pad = { top: 18, right: 14, bottom: 30, left: 40 };

  const stats = useMemo(() => {
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { min, max, avg };
  }, [values]);

  const domain = yDomain(values, maxValue, unit === "%" ? 0 : undefined);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const span = Math.max(0.001, domain.max - domain.min);

  const points = values.map((value, index) => {
    const x = pad.left + (values.length <= 1 ? innerW / 2 : (index / (values.length - 1)) * innerW);
    const y = pad.top + innerH - ((clamp(value, domain.min, domain.max) - domain.min) / span) * innerH;
    return { x, y, value };
  });

  const line = smoothLine(points);
  const baseline = pad.top + innerH;
  const area =
    points.length > 0 ? `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z` : "";
  const latest = values[values.length - 1];
  const formatValue = (value: number) =>
    `${Math.round(value * 10) / 10}${unit === "%" ? "%" : unit ? ` ${unit}` : ""}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    value: domain.min + span * ratio,
    y: pad.top + innerH * (1 - ratio),
  }));

  return (
    <article className="crm-monitor-series">
      <header className="crm-monitor-series__head">
        <div>
          <h4>{title}</h4>
          <p>
            {labels[0] && labels[labels.length - 1]
              ? `${labels[0]} — ${labels[labels.length - 1]}`
              : emptyLabel}
          </p>
        </div>
        <strong>{latest != null ? formatValue(latest) : emptyLabel}</strong>
      </header>

      {stats ? (
        <div className="crm-monitor-series__stats">
          <span>min {formatValue(stats.min)}</span>
          <span>avg {formatValue(stats.avg)}</span>
          <span>max {formatValue(stats.max)}</span>
        </div>
      ) : null}

      <div className="crm-monitor-series__canvas">
        {points.length > 0 ? (
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={title}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.38" />
                <stop offset="55%" stopColor={color} stopOpacity="0.12" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
              <filter id={glowId} x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {unit === "%"
              ? [
                  { from: 80, to: 100, fill: "rgba(239,68,68,0.08)" },
                  { from: 60, to: 80, fill: "rgba(245,158,11,0.06)" },
                  { from: 0, to: 60, fill: "rgba(34,197,94,0.05)" },
                ].map((band) => {
                  const yTop = pad.top + innerH * (1 - (clamp(band.to, domain.min, domain.max) - domain.min) / span);
                  const yBottom =
                    pad.top + innerH * (1 - (clamp(band.from, domain.min, domain.max) - domain.min) / span);
                  return (
                    <rect
                      key={band.from}
                      x={pad.left}
                      y={Math.min(yTop, yBottom)}
                      width={innerW}
                      height={Math.abs(yBottom - yTop)}
                      fill={band.fill}
                    />
                  );
                })
              : null}

            {yTicks.map((tick) => (
              <g key={tick.ratio}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray={tick.ratio === 0.5 ? "0" : "4 5"}
                />
                <text x={pad.left - 8} y={tick.y + 4} textAnchor="end" className="crm-monitor-series__tick">
                  {formatValue(tick.value)}
                </text>
              </g>
            ))}

            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
            />

            {points.map((point, index) =>
              index === points.length - 1 || index % 8 === 0 ? (
                <circle
                  key={`${point.x}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={index === points.length - 1 ? 4.5 : 2.5}
                  fill={index === points.length - 1 ? color : "rgba(255,255,255,0.85)"}
                  stroke={index === points.length - 1 ? "#0a0a0b" : color}
                  strokeWidth={index === points.length - 1 ? 2 : 1}
                  opacity={index === points.length - 1 ? 1 : 0.7}
                />
              ) : null
            )}

            {labels[0] ? (
              <text x={pad.left} y={height - 8} className="crm-monitor-series__axis">
                {labels[0]}
              </text>
            ) : null}
            {labels[labels.length - 1] && labels[labels.length - 1] !== labels[0] ? (
              <text x={width - pad.right} y={height - 8} textAnchor="end" className="crm-monitor-series__axis">
                {labels[labels.length - 1]}
              </text>
            ) : null}
          </svg>
        ) : (
          <div className="crm-monitor-series__empty">{emptyLabel}</div>
        )}
      </div>
    </article>
  );
}
